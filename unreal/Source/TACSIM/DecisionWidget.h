#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "DecisionWidget.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDecisionSelected, FString, DecisionKey);

UCLASS()
class TACSIM_API UDecisionWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    // Called to initialize the widget with stage info
    UFUNCTION(BlueprintCallable, Category = "Decision")
    void InitializeDecision(const FString& StageTitle, const TMap<FString, FString>& Options);

    // Delegate for when user selects an option
    UPROPERTY(BlueprintAssignable, Category = "Decision")
    FOnDecisionSelected OnDecisionSelected;

protected:
    // In UMG, this would be bound to buttons for each option
    UFUNCTION(BlueprintCallable, Category = "Decision")
    void SelectOption(FString OptionKey);

    // Helper to clear existing buttons
    UFUNCTION(BlueprintCallable, Category = "Decision")
    void ClearOptions();

    // Called when widget is constructed (Blueprint event)
    virtual void NativeConstruct() override;

private:
    // TextBlock for stage name
    UPROPERTY(meta = (BindWidget))
    class UTextBlock* StageText;

    // Vertical box containing option buttons
    UPROPERTY(meta = (BindWidget))
    class UVerticalBox* OptionsList;
};
