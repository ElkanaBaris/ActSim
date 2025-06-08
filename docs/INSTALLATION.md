# Installation Guide

This document explains how to set up **ActSim** and all required dependencies on macOS, Linux and inside Docker. The web application consists of a Node.js API and React front end. A PostgreSQL database is required for persistent storage and Git LFS is used for large assets such as Unreal Engine files.

## Prerequisites

- **Git** and **Git LFS**
- **Node.js 20** (other versions have not been tested and may fail)
- **npm** (bundled with Node.js)
- **PostgreSQL** server
- **Unreal Engine 5** for building the optional VR demo

Clone the repository and pull LFS files:

```bash
git clone https://github.com/your-org/ActSim.git
cd ActSim
git lfs install
git lfs pull
```

Create a PostgreSQL database and note the connection string. Export it as `DATABASE_URL` before running the server. Example:

```bash
export DATABASE_URL=postgres://user:password@127.0.0.1:5432/actsim
```

Install Node dependencies and run database migrations:

```bash
npm install
npm run db:push
```

Start the development server:

```bash
npm run dev
```

The API and front end will be available on [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Building for Production

```bash
npm run build
npm start
```

The compiled application lives in the `dist/` directory and listens on port `5000`.

## Platform Specific Setup

### macOS
Run the helper script which installs Homebrew, Node.js, Git LFS and PostgreSQL:

```bash
./scripts/install-mac.sh
```

### Linux (Ubuntu/Debian)
Run the Linux setup script to install Node.js, Git LFS and PostgreSQL packages:

```bash
./scripts/install-linux.sh
```

### Docker
A Dockerfile is provided to build a self‑contained image. Ensure `DATABASE_URL` is accessible from inside the container.

```bash
./scripts/run-docker.sh
```

This builds the image and starts it on port `5000`.

## Unreal VR Demo
The VR scenario is located under `unreal/`. Install Unreal Engine 5.4 or newer, open `TACSIM.uproject` and enable the OpenXR plugin. See `unreal/README.md` for details on packaging the project for Meta Quest.
