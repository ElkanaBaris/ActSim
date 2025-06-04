#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "VRPawn.generated.h"

UCLASS()
class TACSIM_API AVRPawn : public APawn
{
    GENERATED_BODY()

public:
    AVRPawn();

protected:
    virtual void BeginPlay() override;

public:
    virtual void Tick(float DeltaTime) override;

    // Called to bind functionality to input
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

private:
    // VR Camera (first-person view)
    UPROPERTY(VisibleAnywhere)
    class UCameraComponent* CameraComponent;

    // Motion Controllers (for future use if needed)
    UPROPERTY(VisibleAnywhere)
    class UMotionControllerComponent* LeftController;
    UPROPERTY(VisibleAnywhere)
    class UMotionControllerComponent* RightController;

    // VR root scene component
    UPROPERTY(VisibleAnywhere)
    class USceneComponent* VROrigin;
};
