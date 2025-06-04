# TACSIM Unreal VR Project

This folder contains the source code and setup notes for the Unreal Engine 5
portion of the project. The goal of **Phase&nbsp;1** is to produce a VR compatible
demo scene that runs on Meta Quest using OpenXR.

## Engine Setup

1. Install **Unreal Engine&nbsp;5** (tested with 5.4) through the Epic Games
   Launcher.
2. Open the project file `TACSIM.uproject` and let the editor generate project
   files.
3. Enable the **OpenXR** plugin for VR support and set the default OpenXR
   runtime to the Meta Quest runtime.
4. Configure project settings for mobile/Quest deployment (Android SDK paths,
   minimum SDK version 29, and Vulkan rendering).

## VR Pawn

`Source/TACSIM/VRPawn.h` and `VRPawn.cpp` implement a minimal first-person
pawn. It creates a VR origin scene component, a camera component and motion
controllers. The pawn enables the HMD at startup and can be extended with
teleport or interaction inputs later on.

## Decision Widget

`Source/TACSIM/DecisionWidget.h` and `DecisionWidget.cpp` define a basic UMG
widget used to present choices during a scenario. It generates buttons for each
option and emits a `FOnDecisionSelected` delegate when one is clicked.

## Demo Scene

1. Acquire free environment assets from **Quixel Megascans** (buildings,
   debris and terrain that evoke an urban Middle Eastern location). Import them
   into the project using the "Quixel Bridge" plugin.
2. Download rigged military characters and animation packs from **Mixamo** or
   Operation: Harsh Doorstop. Use Unreal's animation retargeting tools to retarget
   them to the UE5 mannequin skeleton.
3. Create a small city block using the Megascans meshes. Use hierarchical
   instanced static meshes and LODs to keep the scene performant in VR.
4. Place the `AVRPawn` as the default pawn class in the level and ensure
   tracking works on the Quest.

## Optimization

- Generate LODs for all static meshes. Use Nanite only when meshes remain
  performant on Quest.
- Prefer instanced meshes for repeated props such as windows or walls.
- Simplify collision on large meshes or disable collision where not needed.
- Target **72&nbsp;FPS** on the Quest. Use the built‑in `stat unit` and
  `stat fps` commands to profile.

## Asset List

- Quixel Megascans: concrete buildings, street props, vegetation.
- Mixamo: free soldier characters and rifle animations.
- Operation: Harsh Doorstop: additional military assets if required.

## Build and Deployment

1. Package the project for **Android (ASTC)** to deploy to Meta Quest.
2. Test performance directly on the headset. Adjust quality settings if the
   frame rate drops below 72&nbsp;FPS.

This README is meant as a concise reference for reproducing the Phase&nbsp;1 setup.
