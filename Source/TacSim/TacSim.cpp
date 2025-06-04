#include "TacSim.h"
#include "Modules/ModuleManager.h"
#include "Engine/Engine.h"

#define LOCTEXT_NAMESPACE "FTacSimModule"

void FTacSimModule::StartupModule()
{
    UE_LOG(LogTemp, Log, TEXT("TacSim module started"));
}

void FTacSimModule::ShutdownModule()
{
    UE_LOG(LogTemp, Log, TEXT("TacSim module shutting down"));
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_PRIMARY_GAME_MODULE(FTacSimModule, TacSim, "TacSim");
