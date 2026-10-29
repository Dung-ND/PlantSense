# Deploying PlantSense on a VPS with Cloudflare

The site runs on one small Linux server (VPS). Cloudflare sits in front for HTTPS, caching and attack protection. Cloudflare Tunnel connects the two, so the server needs **no open web ports and no SSL certificates**.

```
Visitor ──HTTPS──▶ Cloudflare ──tunnel──▶ your VPS: Next.js on 127.0.0.1:3000
                                                    └─ /var/lib/plantsense (database + photos)
```

## 1. What to buy

- **A VPS**: Hetzner, DigitalOcean, Vultr or similar. Pick Ubuntu 24.04, 1–2 vCPU and **2 GB RAM** (building the site needs ~1.5 GB). About $5–7/month.
- **A domain**, added to a free Cloudflare account (Cloudflare → *Add a site*, then change the nameservers at your registrar).

## 2. Prepare the server

SSH in as root, then:

```bash
apt update && apt upgrade -y
apt install -y git build-essential ufw
```

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
```

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Only allow SSH from outside (the tunnel connects outwards, so nothing else is needed):

```bash
ufw allow OpenSSH && ufw --force enable
```

Create a user for the app and the data folder:

```bash
adduser --disabled-password --gecos "" plantsense
mkdir -p /var/lib/plantsense && chown plantsense:plantsense /var/lib/plantsense
```

Let that user restart the service without a password (used by `deploy/update.sh`):

```bash
echo 'plantsense ALL=NOPASSWD: /usr/bin/systemctl restart plantsense' > /etc/sudoers.d/plantsense
```

## 3. Install the site

```bash
su - plantsense
git clone https://github.com/Dung-ND/PlantSense.git plantsense && cd plantsense
cp .env.example .env.local
nano .env.local
```

In `.env.local` set at least:

| Variable | Value |
| --- | --- |
| `OPENAI_API_KEY` | your OpenAI key |
| `ADMIN_PASSWORD` | a long password (16+ characters) |
| `ADMIN_SESSION_SECRET` | any long random text (`openssl rand -hex 32`) |
| `DATA_DIR` | `/var/lib/plantsense` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
| `LEAD_WEBHOOK_URL` | optional — see README |

Build it:

```bash
npm ci && npm run build
exit
```

The first build creates the database in `/var/lib/plantsense` with the starter products.

## 4. Run it as a service

As root:

```bash
cp /home/plantsense/plantsense/deploy/plantsense.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now plantsense
```

```bash
systemctl status plantsense
```

It starts on boot and restarts on its own if it crashes. Logs: `journalctl -u plantsense -f`.

## 5. Connect Cloudflare (Tunnel)

1. In Cloudflare go to **Zero Trust → Networks → Tunnels → Create a tunnel** (type *Cloudflared*). Name it `plantsense`.
2. Cloudflare shows an install command for Debian/Ubuntu. Run it on the server as root. It installs `cloudflared` as a service.
3. Under **Public hostnames**, add your domain (and `www` if you like) → Service `HTTP` → URL `localhost:3000`.

Your site is now live on `https://your-domain.com`.

Recommended Cloudflare settings:
- **SSL/TLS → Edge certificates**: *Always use HTTPS* on.
- **Security → Bots**: *Bot fight mode* on.
- Optionally protect `/admin` with **Zero Trust → Access** (an email login before the admin page) for a second lock on top of the password.

## 6. Backups

Every update takes a snapshot automatically. Also schedule a daily one. As the `plantsense` user, run `crontab -e` and add:

```
15 3 * * * cd /home/plantsense/plantsense && npm run backup >> /var/lib/plantsense/backup.log 2>&1
```

Backups go to `/var/lib/plantsense/backups` (the last 14 are kept). **Copy them off the server too**, for example with `rclone` to Cloudflare R2, Google Drive or Backblaze, or enable your VPS provider's snapshot feature.

To restore: stop the service, copy `plantsense.db` and `uploads/` from a backup folder into `/var/lib/plantsense`, then start the service.

## 7. Updating the site

After new code is pushed to GitHub:

```bash
su - plantsense -c "cd plantsense && ./deploy/update.sh"
```

Product changes made in `/admin` don't need this. They go live straight away.
