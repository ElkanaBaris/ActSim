#!/usr/bin/env python3
"""Simple 3D asset viewer.

This script loads a 3D model file (e.g. OBJ or FBX) and displays it using
Open3D. It is completely standalone and does not rely on any of the
simulation logic in the web app.
"""

import argparse
import os
import sys

try:
    import open3d as o3d
except Exception as exc:
    message = f"Failed to import Open3D: {exc}"
    if sys.version_info >= (3, 13):
        message += (
            "\nOpen3D provides wheels only for Python 3.12 and earlier. "
            "You can build Open3D from source or run this tool with an older Python release."
        )
    else:
        message += "\nInstall Open3D with 'pip install open3d'."
    sys.exit(message)


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
