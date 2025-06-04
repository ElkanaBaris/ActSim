#include "VRPawn.h"
#include "Camera/CameraComponent.h"
#include "Components/SceneComponent.h"
#include "MotionControllerComponent.h"
#include "HeadMountedDisplayFunctionLibrary.h"
#include "XRMotionControllerBase.h"

AVRPawn::AVRPawn()
{
    PrimaryActorTick.bCanEverTick = true;

    // Root
    VROrigin = CreateDefaultSubobject<USceneComponent>(TEXT("VROrigin"));
    RootComponent = VROrigin;

    // VR Camera
    CameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("CameraComponent"));
    CameraComponent->SetupAttachment(VROrigin);
    CameraComponent->bUsePawnControlRotation = false;

    // Motion Controllers (for future expansion)
    LeftController = CreateDefaultSubobject<UMotionControllerComponent>(TEXT("LeftController"));
    LeftController->SetupAttachment(VROrigin);
    LeftController->SetTrackingSource(EControllerHand::Left);

    RightController = CreateDefaultSubobject<UMotionControllerComponent>(TEXT("RightController"));
    RightController->SetupAttachment(VROrigin);
    RightController->SetTrackingSource(EControllerHand::Right);
}

void AVRPawn::BeginPlay()
{
    Super::BeginPlay();

    // Initialize HMD
    UHeadMountedDisplayFunctionLibrary::EnableHMD(true);
}

void AVRPawn::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void AVRPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    // Bind teleport or other VR input as needed (omitted for MVP)
}
