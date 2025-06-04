#include "ScenarioManager.h"
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "Json.h"
#include "JsonUtilities.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"
#include "Kismet/GameplayStatics.h"
#include "DecisionWidget.h"

AScenarioManager::AScenarioManager()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AScenarioManager::BeginPlay()
{
    Super::BeginPlay();
    LoadScenario(TEXT("example_scenario.json"));
}

void AScenarioManager::LoadScenario(const FString& ScenarioJsonFilename)
{
    FString FullPath = ScenarioFolderPath + ScenarioJsonFilename;
    TSharedPtr<FJsonObject> JsonObject = LoadJsonObjectFromFile(FullPath);
    if (JsonObject.IsValid())
    {
        ParseAndSpawn(JsonObject);
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("Failed to load scenario: %s"), *FullPath);
    }
}

TSharedPtr<FJsonObject> AScenarioManager::LoadJsonObjectFromFile(const FString& FullPath)
{
    FString JsonRaw;
    if (!FFileHelper::LoadFileToString(JsonRaw, *FullPath))
    {
        return nullptr;
    }
    TSharedPtr<FJsonObject> JsonObject;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonRaw);
    if (FJsonSerializer::Deserialize(Reader, JsonObject))
    {
        return JsonObject;
    }
    return nullptr;
}

void AScenarioManager::ParseAndSpawn(const TSharedPtr<FJsonObject>& JsonObject)
{
    if (!JsonObject->HasTypedField<EJson::Object>("scenario")) return;

    TSharedPtr<FJsonObject> ScenarioRoot = JsonObject->GetObjectField(TEXT("scenario"));

    if (ScenarioRoot->HasField(TEXT("building")))
    {
        SpawnEnvironment(ScenarioRoot->GetObjectField(TEXT("building")));
    }

    if (ScenarioRoot->HasField(TEXT("actors")))
    {
        SpawnActors(ScenarioRoot->GetArrayField(TEXT("actors")));
    }

    if (ScenarioRoot->HasField(TEXT("stages")))
    {
        const TArray<TSharedPtr<FJsonValue>>& StagesArray = ScenarioRoot->GetArrayField(TEXT("stages"));
        if (StagesArray.Num() > 0)
        {
            TSharedPtr<FJsonObject> StageObj = StagesArray[0]->AsObject();
            FString StageName = StageObj->GetStringField(TEXT("name"));
            TSharedPtr<FJsonObject> DecisionsObj = StageObj->GetObjectField(TEXT("decisions"));
            TMap<FString, FString> OptionsMap;
            for (auto& Pair : DecisionsObj->Values)
            {
                OptionsMap.Add(Pair.Key, Pair.Value->AsObject()->GetStringField(TEXT("description")));
            }
            if (DecisionWidgetClass)
            {
                UWorld* World = GetWorld();
                APlayerController* PC = UGameplayStatics::GetPlayerController(World, 0);
                UDecisionWidget* DecWidget = CreateWidget<UDecisionWidget>(PC, DecisionWidgetClass);
                if (DecWidget)
                {
                    DecWidget->AddToViewport();
                    DecWidget->InitializeDecision(StageName, OptionsMap);
                    DecWidget->OnDecisionSelected.AddDynamic(this, &AScenarioManager::OnStageDecision);
                }
            }
        }
    }
}

void AScenarioManager::SpawnEnvironment(const TSharedPtr<FJsonObject>& BuildingObj)
{
    FString Type = BuildingObj->GetStringField(TEXT("type"));
    if (Type.Equals(TEXT("Townhouse_3Floor")))
    {
        FString AssetPath = TEXT("/Game/Buildings/Townhouse_3Floor.Townhouse_3Floor");
        UStaticMesh* Mesh = Cast<UStaticMesh>(StaticLoadObject(UStaticMesh::StaticClass(), nullptr, *AssetPath));
        if (Mesh)
        {
            FVector Loc;
            Loc.X = BuildingObj->GetObjectField(TEXT("location"))->GetNumberField(TEXT("x"));
            Loc.Y = BuildingObj->GetObjectField(TEXT("location"))->GetNumberField(TEXT("y"));
            Loc.Z = BuildingObj->GetObjectField(TEXT("location"))->GetNumberField(TEXT("z"));
            float Yaw = BuildingObj->GetObjectField(TEXT("rotation"))->GetNumberField(TEXT("yaw"));
            FTransform Transform(FRotator(0, Yaw, 0), Loc);
            AStaticMeshActor* MeshActor = GetWorld()->SpawnActor<AStaticMeshActor>(AStaticMeshActor::StaticClass(), Transform);
            MeshActor->GetStaticMeshComponent()->SetStaticMesh(Mesh);
            MeshActor->SetMobility(EComponentMobility::Static);
        }
    }
}

void AScenarioManager::SpawnActors(const TArray<TSharedPtr<FJsonValue>>& ActorsArray)
{
    for (auto& Val : ActorsArray)
    {
        TSharedPtr<FJsonObject> ActorObj = Val->AsObject();
        FString Type = ActorObj->GetStringField(TEXT("type"));
        float X = ActorObj->GetObjectField(TEXT("spawn"))->GetNumberField(TEXT("x"));
        float Y = ActorObj->GetObjectField(TEXT("spawn"))->GetNumberField(TEXT("y"));
        float Z = ActorObj->GetObjectField(TEXT("spawn"))->GetNumberField(TEXT("z"));
        FVector SpawnLoc(X, Y, Z);
        FRotator SpawnRot(0, 0, 0);
        UClass* PawnClass = nullptr;
        if (Type.Equals(TEXT("Friendly")))
        {
            static ConstructorHelpers::FClassFinder<APawn> FriendlyBP(TEXT("/Game/Blueprints/BP_FriendlyPawn"));
            PawnClass = FriendlyBP.Class;
        }
        else if (Type.Equals(TEXT("Enemy")))
        {
            static ConstructorHelpers::FClassFinder<APawn> EnemyBP(TEXT("/Game/Blueprints/BP_EnemyPawn"));
            PawnClass = EnemyBP.Class;
        }
        if (PawnClass)
        {
            GetWorld()->SpawnActor<APawn>(PawnClass, SpawnLoc, SpawnRot);
        }
    }
}

void AScenarioManager::OnStageDecision(FString DecisionKey)
{
    UE_LOG(LogTemp, Log, TEXT("User selected decision: %s"), *DecisionKey);
}
