#!/bin/bash
set -e

# Install Homebrew if not installed
if ! command -v brew >/dev/null 2>&1; then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Node.js 20 (required)
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v20'; then
  brew install node@20
  brew link --overwrite --force node@20
fi

# Install git-lfs
if ! command -v git-lfs >/dev/null 2>&1; then
  brew install git-lfs
  git lfs install
fi

# Install Postgres (optional for local testing)
if ! command -v psql >/dev/null 2>&1; then
  brew install postgresql
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
