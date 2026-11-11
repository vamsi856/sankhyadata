#!/usr/bin/env bash
# One-time move of sankhyadata.com from Hetzner to GitHub Pages. Run it on your own computer
# (macOS, Linux, or Git Bash/WSL on Windows) with the GitHub CLI signed in as vamsi856:
#
#   bash scripts/move-to-pages.sh setup    output repo, deploy key, first publish, Pages, domain
#   (change DNS at Hostinger as it prints)
#   bash scripts/move-to-pages.sh finish   checks DNS, enforces HTTPS, makes the source private
#
# Safe to re-run. It never touches DNS or Hetzner; it prints what to do there.
set -euo pipefail

SRC=vamsi856/sankhyadata
LIVE=vamsi856/sankhyadata-live
DOMAIN=sankhyadata.com
KEY_TITLE="deploy from $SRC"

step() { printf '\n== %s\n' "$*"; }
die() { printf 'Stopped: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "needs '$1' installed"; }

# Public DNS answers (data fields only), via DNS-over-HTTPS so local caches do not mislead.
# Only the Answer section counts (a missing name returns the zone's SOA under Authority).
dns() {
  curl -fsS "https://dns.google/resolve?name=$1&type=$2" | grep -o '"Answer": *\[[^]]*\]' |
    grep -o '"data": *"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/' || true
}

print_dns() {
  cat <<EOF
At Hostinger (Domains > $DOMAIN > DNS), in one sitting, at a quiet hour:
  delete  A     @        5.161.223.5
  delete  AAAA  @        2a01:4ff:f0:860d::1
  add     A     @        185.199.108.153
  add     A     @        185.199.109.153
  add     A     @        185.199.110.153
  add     A     @        185.199.111.153
  add     AAAA  @        2606:50c0:8000::153
  add     AAAA  @        2606:50c0:8001::153
  add     AAAA  @        2606:50c0:8002::153
  add     AAAA  @        2606:50c0:8003::153
  change  CNAME www      vamsi856.github.io
  delete  the portal and samples records (they point at the Hetzner IP)
  keep    MX, the SPF TXT, DKIM, CAA and the _github-pages-challenge-vamsi856 TXT
Then run: bash scripts/move-to-pages.sh finish
EOF
}

setup() {
  need gh; need ssh-keygen; need curl
  gh auth status >/dev/null 2>&1 || die "run 'gh auth login' first"

  step "1. Public output repo $LIVE"
  if gh repo view "$LIVE" >/dev/null 2>&1; then
    echo "exists"
  else
    gh repo create "$LIVE" --public --description "Built files for $DOMAIN, served by GitHub Pages."
  fi

  step "2. Deploy key (write access to $LIVE only) and secret LIVE_DEPLOY_KEY in $SRC"
  key_id=$(gh api "repos/$LIVE/keys" --jq ".[] | select(.title == \"$KEY_TITLE\") | .id" | head -1)
  if [ -n "$key_id" ] && gh secret list -R "$SRC" | grep -q '^LIVE_DEPLOY_KEY'; then
    echo "both exist"
  else
    [ -n "$key_id" ] && gh api -X DELETE "repos/$LIVE/keys/$key_id" >/dev/null
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    ssh-keygen -q -t ed25519 -N "" -C "$KEY_TITLE" -f "$tmp/key"
    gh repo deploy-key add "$tmp/key.pub" -R "$LIVE" --allow-write --title "$KEY_TITLE"
    gh secret set LIVE_DEPLOY_KEY -R "$SRC" < "$tmp/key"
    rm -rf "$tmp"   # no copy of the private key is kept anywhere but the secret
    echo "set"
  fi

  step "3. First publish (Deploy to GitHub Pages)"
  prev=$(gh run list -R "$SRC" --workflow deploy-pages.yml -L 1 --json databaseId --jq '.[0].databaseId // 0')
  gh workflow run deploy-pages.yml -R "$SRC" --ref main
  id=$prev
  for _ in $(seq 1 30); do
    sleep 3
    id=$(gh run list -R "$SRC" --workflow deploy-pages.yml -L 1 --json databaseId --jq '.[0].databaseId // 0')
    [ "$id" != "$prev" ] && break
  done
  [ "$id" != "$prev" ] || die "the run did not start; see the Actions tab of $SRC"
  gh run watch "$id" -R "$SRC" --exit-status
  gh api "repos/$LIVE/branches/gh-pages" --jq .name >/dev/null 2>&1 || die "gh-pages was not pushed; see run $id"
  echo "gh-pages is in $LIVE"

  step "4. GitHub Pages on $LIVE, from gh-pages"
  if gh api "repos/$LIVE/pages" >/dev/null 2>&1; then
    echo "already on"
  else
    gh api -X POST "repos/$LIVE/pages" -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null
    echo "on"
  fi

  step "5. Verify $DOMAIN on your GitHub account (web only; stops anyone else claiming it)"
  cat <<EOF
Open https://github.com/settings/pages > Add a domain > $DOMAIN.
Add the TXT record GitHub shows (_github-pages-challenge-vamsi856) at Hostinger, then click Verify.
Keep that TXT record for good.
EOF
  read -r -p "Press Enter once GitHub shows $DOMAIN as verified... " _

  step "6. Custom domain $DOMAIN on $LIVE"
  gh api -X PUT "repos/$LIVE/pages" -f cname="$DOMAIN" >/dev/null
  echo "set"

  step "7. DNS"
  print_dns
}

finish() {
  need gh; need curl
  gh auth status >/dev/null 2>&1 || die "run 'gh auth login' first"

  step "1. DNS"
  a=$(dns "$DOMAIN" A | sort | tr '\n' ' ')
  aaaa=$(dns "$DOMAIN" AAAA | sort | tr '\n' ' ')
  echo "A:    $a"
  echo "AAAA: $aaaa"
  for ip in $a; do case $ip in 185.199.10[89].153|185.199.11[01].153) ;; *) bad=1 ;; esac; done
  for ip in $aaaa; do case $ip in 2606:50c0:800[0-3]::153) ;; *) bad=1 ;; esac; done
  [ -n "$a" ] && [ -z "${bad:-}" ] || { print_dns; die "$DOMAIN must resolve to GitHub Pages only"; }
  for h in portal samples; do
    [ -z "$(dns "$h.$DOMAIN" A)" ] || echo "Warning: $h.$DOMAIN still has an A record; delete it at Hostinger."
  done

  step "2. Certificate and Enforce HTTPS"
  state=$(gh api "repos/$LIVE/pages" --jq '.https_certificate.state // "none"')
  echo "certificate: $state"
  if [ "$state" != "approved" ]; then
    echo "Not issued yet. Usually under an hour; if it sticks, remove and re-add the custom domain"
    echo "in $LIVE > Settings > Pages. Then run finish again."
    exit 0
  fi
  gh api -X PUT "repos/$LIVE/pages" -F https_enforced=true >/dev/null
  curl -fsS -o /dev/null "https://$DOMAIN/" || die "https://$DOMAIN/ does not answer yet"
  echo "https://$DOMAIN/ serves; http redirects to: $(curl -sI "http://$DOMAIN/" | tr -d '\r' | sed -n 's/^[Ll]ocation: //p')"

  step "3. Source repo $SRC private (and its old redirect-only Pages site off)"
  gh api -X DELETE "repos/$SRC/pages" >/dev/null 2>&1 || true
  gh repo edit "$SRC" --visibility private --accept-visibility-change-consequences
  echo "private"

  step "Left for you"
  cat <<EOF
- Portal server (178.105.159.139): stop trusting forwarded client addresses from 5.161.223.5 and
  2a01:4ff:f0:860d::1, and drop its portal.$DOMAIN / samples.$DOMAIN host entries.
- About 48 hours from now: in Hetzner project "sankhyadata", delete the server sankhyadata-web,
  its firewall and its primary IPs, then revoke the project's API tokens. With the hcloud CLI:
    hcloud server delete sankhyadata-web
    hcloud firewall delete sankhyadata-web
    hcloud primary-ip list    (delete any left over with: hcloud primary-ip delete <id>)
  Do not touch the portal server, which is a separate machine.
EOF
}

case "${1:-}" in
  setup) setup ;;
  finish) finish ;;
  *) echo "Usage: bash scripts/move-to-pages.sh setup|finish" >&2; exit 2 ;;
esac
