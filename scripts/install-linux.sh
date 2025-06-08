#!/bin/bash
set -e

# Update package lists
sudo apt-get update

# Install Node.js from NodeSource
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v20'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install git-lfs
if ! command -v git-lfs >/dev/null 2>&1; then
  sudo apt-get install -y git-lfs
  git lfs install
fi

# Install Postgres (optional for local testing)
if ! command -v psql >/dev/null 2>&1; then
  sudo apt-get install -y postgresql
fi

echo "Installing npm dependencies"
npm install

echo "Running database migrations"
npm run db:push

cat <<EOM
Setup complete. Configure the DATABASE_URL environment variable before running the server:
  export DATABASE_URL=postgres://user:password@127.0.0.1:5432/actsim
Run the development server with:
  npm run dev
EOM
