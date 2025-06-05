# ActSim

This repository contains the web interface and documentation for a tactical
training simulator. The `/unreal` folder holds the Unreal Engine project used
for VR scenes while the `/server` and `/client` folders contain the Node.js API
and React front‑end.

## Running the Web App

```
npm install
npm run dev
```

The server will start on port `5000` and host both the API and the front‑end.

## Type Checking

Run the TypeScript compiler to verify the project builds without errors:

```bash
npm run check
```

Make sure all dependencies are installed via `npm install` before running this command.

## Unreal VR Scene

Setup instructions and C++ source for the VR demo are located in
[`unreal/README.md`](unreal/README.md).

Additional notes on optional audio/visual assets live in
[`docs/enhanced_vr.md`](docs/enhanced_vr.md). Prompts for generating the
core placeholder assets are in [`docs/asset_prompts.md`](docs/asset_prompts.md).

## Git LFS

Large binary assets such as Unreal Engine resources are stored using [Git LFS](https://git-lfs.github.com/). Install Git LFS and run `git lfs install` before working with the repo. After cloning, execute `git lfs pull` to download any large files.
