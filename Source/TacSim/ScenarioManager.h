#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ScenarioManager.generated.h"

UCLASS(Blueprintable)
class TACSIM_API AScenarioManager : public AActor
{
    GENERATED_BODY()

public:
    AScenarioManager();

protected:
    virtual void BeginPlay() override;

    UFUNCTION(BlueprintCallable, Category="Scenario")
    void LoadScenario(const FString& ScenarioJsonFilename);

private:
    void ParseAndSpawn(const TSharedPtr<FJsonObject>& JsonObject);
    void SpawnEnvironment(const TSharedPtr<FJsonObject>& BuildingObj);
    void SpawnActors(const TArray<TSharedPtr<FJsonValue>>& ActorsArray);
    FString ScenarioFolderPath = FPaths::ProjectContentDir() + "Scenarios/";
    TSharedPtr<FJsonObject> LoadJsonObjectFromFile(const FString& FullPath);

    UPROPERTY(EditAnywhere, Category="UI")
    TSubclassOf<class UDecisionWidget> DecisionWidgetClass;

    UFUNCTION()
    void OnStageDecision(FString DecisionKey);
};
