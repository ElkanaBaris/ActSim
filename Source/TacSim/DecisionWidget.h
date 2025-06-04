#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "DecisionWidget.generated.h"

declare_dynamic_multicast_delegate_oneparam(FOnDecisionSelected, FString, DecisionKey);

UCLASS()
class TACSIM_API UDecisionWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category="Decision")
    void InitializeDecision(const FString& StageTitle, const TMap<FString, FString>& Options);

    UPROPERTY(BlueprintAssignable, Category="Decision")
    FOnDecisionSelected OnDecisionSelected;

protected:
    UFUNCTION(BlueprintCallable, Category="Decision")
    void SelectOption(FString OptionKey);

    UFUNCTION(BlueprintCallable, Category="Decision")
    void ClearOptions();

    virtual void NativeConstruct() override;

private:
    UPROPERTY(meta=(BindWidget))
    class UTextBlock* StageText;

    UPROPERTY(meta=(BindWidget))
    class UVerticalBox* OptionsList;
};
