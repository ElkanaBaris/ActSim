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
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

private:
    UPROPERTY(VisibleAnywhere)
    class UCameraComponent* CameraComponent;

    UPROPERTY(VisibleAnywhere)
    class UMotionControllerComponent* LeftController;

    UPROPERTY(VisibleAnywhere)
    class UMotionControllerComponent* RightController;

    UPROPERTY(VisibleAnywhere)
    class USceneComponent* VROrigin;
};
