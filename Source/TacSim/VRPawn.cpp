#include "VRPawn.h"
#include "Camera/CameraComponent.h"
#include "Components/SceneComponent.h"
#include "MotionControllerComponent.h"
#include "HeadMountedDisplayFunctionLibrary.h"
#include "XRMotionControllerBase.h"

AVRPawn::AVRPawn()
{
    PrimaryActorTick.bCanEverTick = true;

    VROrigin = CreateDefaultSubobject<USceneComponent>(TEXT("VROrigin"));
    RootComponent = VROrigin;

    CameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("CameraComponent"));
    CameraComponent->SetupAttachment(VROrigin);
    CameraComponent->bUsePawnControlRotation = false;

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
    UHeadMountedDisplayFunctionLibrary::EnableHMD(true);
}

void AVRPawn::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void AVRPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
}
