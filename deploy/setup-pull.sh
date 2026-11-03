#!/usr/bin/env bash
# One-time setup on the Hetzner server (run as root):
#   curl -fsSL https://raw.githubusercontent.com/vamsi856/sankhyadata/main/deploy/setup-pull.sh | bash
# Installs the updater and a systemd timer that checks for a new build every 2 minutes,
# then runs it once. Safe to run again.
set -euo pipefail
RAW="https://raw.githubusercontent.com/vamsi856/sankhyadata/main/deploy"
[ "$(id -u)" = 0 ] || { echo "run as root" >&2; exit 1; }
command -v caddy >/dev/null || { echo "caddy is not installed on this server" >&2; exit 1; }

install -d -m 0755 /usr/local/lib/sankhyadata /var/www/sankhyadata/releases
curl -fsSL "$RAW/install-site.sh" -o /usr/local/lib/sankhyadata/install-site.sh
curl -fsSL "$RAW/pull.sh" -o /usr/local/bin/sankhyadata-pull
chmod 0755 /usr/local/lib/sankhyadata/install-site.sh /usr/local/bin/sankhyadata-pull

cat > /etc/systemd/system/sankhyadata-pull.service <<'UNIT'
[Unit]
Description=Update the SankhyaData site from GitHub
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/sankhyadata-pull
UNIT

cat > /etc/systemd/system/sankhyadata-pull.timer <<'UNIT'
[Unit]
Description=Check for a new SankhyaData site build every 2 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=2min
Persistent=true

[Install]
WantedBy=timers.target
UNIT

systemctl daemon-reload
systemctl enable --now sankhyadata-pull.timer
/usr/local/bin/sankhyadata-pull && echo "SankhyaData site installed: https://sankhyadata.com"
