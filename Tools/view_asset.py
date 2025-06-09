#!/usr/bin/env python3
"""Simple 3D asset viewer.

This script loads a 3D model file (e.g. OBJ or FBX) and displays it using
Open3D. It is completely standalone and does not rely on any of the
simulation logic in the web app.
"""

import argparse
import os
import sys

import open3d as o3d


def main() -> None:
    parser = argparse.ArgumentParser(description="Preview a 3D asset")
    parser.add_argument("path", help="Path to the model file to display")
    args = parser.parse_args()

    asset_path = os.path.abspath(args.path)
    if not os.path.exists(asset_path):
        sys.exit(f"File not found: {asset_path}")

    mesh = o3d.io.read_triangle_mesh(asset_path)
    if mesh.is_empty():
        sys.exit(f"Unable to load mesh from {asset_path}")

    mesh.compute_vertex_normals()
    o3d.visualization.draw(mesh, title=os.path.basename(asset_path))


if __name__ == "__main__":
    main()
