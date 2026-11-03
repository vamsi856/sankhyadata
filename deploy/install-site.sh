#!/usr/bin/env bash
# Runs on the server as root (called by the deploy workflow). Idempotent.
# Activates an uploaded release and makes sure Caddy serves it, without touching other sites.
set -euo pipefail
RELEASE="$1"                      # e.g. /var/www/sankhyadata/releases/<sha>
SITE_ROOT=/var/www/sankhyadata
CADDYFILE=/etc/caddy/Caddyfile
SITE_CONF=/etc/caddy/sites/sankhyadata.caddy

test -f "$RELEASE/index.html" || { echo "release is missing index.html" >&2; exit 1; }
command -v caddy >/dev/null || { echo "caddy is not installed on this server" >&2; exit 1; }
test -f "$CADDYFILE" || { echo "no $CADDYFILE; Caddy is configured some other way" >&2; exit 1; }

# 1. Switch the live site to the new release atomically, keep the last 5.
ln -sfn "$RELEASE" "$SITE_ROOT/current.tmp" && mv -T "$SITE_ROOT/current.tmp" "$SITE_ROOT/current"
ls -1dt "$SITE_ROOT"/releases/*/ | tail -n +6 | xargs -r rm -rf

# 2. Install or update the site's Caddy config; roll back if Caddy rejects it.
mkdir -p /etc/caddy/sites
backup=$(mktemp -d)
cp -a "$CADDYFILE" "$backup/Caddyfile"
[ -f "$SITE_CONF" ] && cp -a "$SITE_CONF" "$backup/site.caddy"
install -m 0644 /tmp/sankhyadata.caddy "$SITE_CONF"
grep -qE '^\s*import\s+/etc/caddy/sites/\*' "$CADDYFILE" || printf '\nimport /etc/caddy/sites/*.caddy\n' >> "$CADDYFILE"

if caddy validate --config "$CADDYFILE" --adapter caddyfile >/dev/null 2>&1; then
  systemctl reload caddy
  echo "live: $(readlink "$SITE_ROOT/current")"
else
  echo "Caddy rejected the config; restoring the previous one" >&2
  caddy validate --config "$CADDYFILE" --adapter caddyfile || true
  cp -a "$backup/Caddyfile" "$CADDYFILE"
  if [ -f "$backup/site.caddy" ]; then cp -a "$backup/site.caddy" "$SITE_CONF"; else rm -f "$SITE_CONF"; fi
  exit 1
fi
