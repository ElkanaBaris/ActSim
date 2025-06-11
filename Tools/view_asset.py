#!/usr/bin/env python3
"""Simple 3D asset viewer.

This script loads a 3D model file (OBJ, FBX, or Maya ``.mb``) and displays it
using Open3D. It is completely standalone and does not rely on any of the
simulation logic in the web app. Maya binaries are converted to OBJ using the
``assimp`` command if available.
"""

import argparse
import os
import subprocess
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

    ext = os.path.splitext(asset_path)[1].lower()
    if ext == ".mb":
        # Attempt to convert Maya binaries using Assimp if available
        tmp_obj = os.path.splitext(asset_path)[0] + "_tmp.obj"
        try:
            result = subprocess.run([
                "assimp",
                "export",
                asset_path,
                tmp_obj,
            ], capture_output=True, text=True)
        except FileNotFoundError:
            sys.exit(
                "Cannot display .mb files: 'assimp' command not found. "
                "Export the file to OBJ or FBX first."
            )
        if result.returncode != 0 or not os.path.exists(tmp_obj):
            sys.exit(
                "Failed to convert .mb file with assimp. "
                "Ensure assimp supports Maya binaries or export manually."
            )
        mesh = o3d.io.read_triangle_mesh(tmp_obj)
        os.remove(tmp_obj)
    else:
        mesh = o3d.io.read_triangle_mesh(asset_path)
    if mesh.is_empty():
        sys.exit(f"Unable to load mesh from {asset_path}")

    mesh.compute_vertex_normals()
    o3d.visualization.draw(mesh, title=os.path.basename(asset_path))


if __name__ == "__main__":
    main()
