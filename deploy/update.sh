#!/usr/bin/env bash
# Pull the latest code, rebuild and restart. Run as the plantsense user:  ./deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
npm run backup               # snapshot before every update
git pull --ff-only
npm ci
npm run build
sudo systemctl restart plantsense
echo "Updated and restarted."
