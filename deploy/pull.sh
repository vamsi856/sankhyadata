#!/usr/bin/env bash
# Installed on the server as /usr/local/bin/sankhyadata-pull and run every 2 minutes by a
# systemd timer. Fetches the latest built site from the repo's "live" release and, if it is
# new, verifies it and activates it with install-site.sh. Only data comes from GitHub:
# the scripts that run as root were installed once by setup-pull.sh.
set -euo pipefail
BASE="${SANKHYADATA_BASE:-https://github.com/vamsi856/sankhyadata/releases/download/live}"
ROOT=/var/www/sankhyadata
LIB=/usr/local/lib/sankhyadata

want=$(curl -fsSL --max-time 30 "$BASE/version.txt" | tr -d '[:space:]')
[[ "$want" =~ ^[0-9a-f]{12}$ ]] || { echo "unexpected version: $want" >&2; exit 1; }
have=$(basename "$(readlink "$ROOT/current" 2>/dev/null || echo none)")
[ "$want" = "$have" ] && exit 0

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
for f in site.tar.gz sankhyadata.caddy sha256sums.txt; do
  curl -fsSL --max-time 120 -o "$tmp/$f" "$BASE/$f"
done
(cd "$tmp" && sha256sum --check --quiet sha256sums.txt)

mkdir -p "$ROOT/releases/$want"
tar --no-same-owner -xzf "$tmp/site.tar.gz" -C "$ROOT/releases/$want"
bash "$LIB/install-site.sh" "$ROOT/releases/$want" "$tmp/sankhyadata.caddy"
