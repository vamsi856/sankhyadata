#!/usr/bin/env python3
"""Create the SankhyaData web server in the Hetzner Cloud project "sankhyadata".

Idempotent: re-running reuses the firewall and server if they exist. Needs an API token
for that project (Read & Write) in the HCLOUD_TOKEN environment variable.

    HCLOUD_TOKEN=... python3 deploy/provision-hetzner.py [--location fsn1] [--dry-run]

What it does:
  1. Firewall "sankhyadata-web": inbound TCP 80 and 443 and ICMP only. SSH (22) stays
     closed; use the Hetzner web console, or add a rule later if you need SSH.
  2. Server "sankhyadata-web": Ubuntu 24.04, the cheapest current x86 type with 2 GB+
     RAM in the chosen location, booted with deploy/cloud-init.yaml (Caddy + site updater).
  3. Prints the IPv4/IPv6 addresses to point sankhyadata.com at.
"""
import argparse
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request

API = "https://api.hetzner.cloud/v1"
NAME = "sankhyadata-web"
HERE = pathlib.Path(__file__).resolve().parent


def call(method, path, body=None):
    token = os.environ.get("HCLOUD_TOKEN")
    if not token:
        sys.exit("HCLOUD_TOKEN is not set")
    req = urllib.request.Request(
        API + path,
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} -> {e.code}: {e.read().decode()[:500]}")


def pick_server_type(location):
    # A price for a location does not mean the type can be ordered there: check the
    # type's per-location availability.
    types = call("GET", "/server_types?per_page=50")["server_types"]
    options = []
    for t in types:
        here = [l for l in t.get("locations", []) if l["name"] == location]
        if not here or not here[0].get("available") or here[0].get("deprecation"):
            continue
        if t.get("deprecated") or t.get("deprecation") or t["architecture"] != "x86" or t["memory"] < 2:
            continue
        for p in t["prices"]:
            if p["location"] == location:
                options.append((float(p["price_monthly"]["gross"]), t["name"], t))
    if not options:
        sys.exit(f"no suitable server type in {location}")
    options.sort(key=lambda o: o[0])
    price, name, t = options[0]
    print(f"server type: {name} ({t['cores']} vCPU, {t['memory']:g} GB RAM, {t['disk']} GB disk, ~{price:.2f}/month gross)")
    return name


def ensure_firewall(dry):
    found = call("GET", f"/firewalls?name={NAME}")["firewalls"]
    if found:
        print(f"firewall: reusing {NAME} (id {found[0]['id']})")
        return found[0]["id"]
    anywhere = ["0.0.0.0/0", "::/0"]
    rules = [
        {"direction": "in", "protocol": "tcp", "port": "80", "source_ips": anywhere, "description": "HTTP (ACME + redirect)"},
        {"direction": "in", "protocol": "tcp", "port": "443", "source_ips": anywhere, "description": "HTTPS"},
        {"direction": "in", "protocol": "icmp", "source_ips": anywhere, "description": "ping"},
    ]
    if dry:
        print("firewall: would create", NAME, "allowing 80, 443, ICMP")
        return None
    fw = call("POST", "/firewalls", {"name": NAME, "rules": rules, "labels": {"app": "sankhyadata"}})["firewall"]
    print(f"firewall: created {NAME} (id {fw['id']})")
    return fw["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--location", default="ash", help="ash (Ashburn, US East), hil (Hillsboro, US West), fsn1, nbg1, hel1, ...")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    existing = call("GET", f"/servers?name={NAME}")["servers"]
    if existing:
        s = existing[0]
        print(f"server: {NAME} already exists, status {s['status']}")
    else:
        server_type = pick_server_type(a.location)
        fw_id = ensure_firewall(a.dry_run)
        user_data = (HERE / "cloud-init.yaml").read_text()
        body = {
            "name": NAME,
            "server_type": server_type,
            "image": "ubuntu-24.04",
            "location": a.location,
            "user_data": user_data,
            "labels": {"app": "sankhyadata"},
            "public_net": {"enable_ipv4": True, "enable_ipv6": True},
            "start_after_create": True,
        }
        if fw_id:
            body["firewalls"] = [{"firewall": fw_id}]
        if a.dry_run:
            print("server: would create", json.dumps({k: v for k, v in body.items() if k != "user_data"}))
            return
        res = call("POST", "/servers", body)
        s = res["server"]
        print(f"server: created {NAME} (id {s['id']}). Hetzner emails the root password for console login.")
        action = res.get("action", {}).get("id")
        for _ in range(60):
            if not action or call("GET", f"/actions/{action}")["action"]["status"] != "running":
                break
            time.sleep(5)
        s = call("GET", f"/servers/{s['id']}")["server"]

    v4 = s["public_net"]["ipv4"]["ip"] if s["public_net"].get("ipv4") else None
    v6net = s["public_net"]["ipv6"]["ip"] if s["public_net"].get("ipv6") else None
    v6 = v6net.split("/")[0] + "1" if v6net else None
    print(json.dumps({"ipv4": v4, "ipv6": v6, "status": s["status"]}))
    print("Next: point sankhyadata.com A ->", v4, "and AAAA ->", v6, "; cloud-init finishes in ~3-5 minutes.")


if __name__ == "__main__":
    main()
