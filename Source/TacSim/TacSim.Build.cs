using UnrealBuildTool;

public class TacSim : ModuleRules
{
    public TacSim(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
                "CoreUObject",
                "Engine",
                "InputCore",
                "UMG",
                "Json",
                "JsonUtilities",
                "HeadMountedDisplay",
            }
        );
        PrivateDependencyModuleNames.AddRange(new string[] { });
    }
}
