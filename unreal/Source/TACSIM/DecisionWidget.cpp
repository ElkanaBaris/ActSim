#include "DecisionWidget.h"
#include "Components/TextBlock.h"
#include "Components/VerticalBox.h"
#include "Components/Button.h"
#include "Components/TextBlock.h"

void UDecisionWidget::NativeConstruct()
{
    Super::NativeConstruct();

    // Initially hidden until InitializeDecision is called
    SetVisibility(ESlateVisibility::Hidden);
}

void UDecisionWidget::InitializeDecision(const FString& StageTitle, const TMap<FString, FString>& Options)
{
    // Show widget
    SetVisibility(ESlateVisibility::Visible);

    // Set stage text
    if (StageText)
    {
        StageText->SetText(FText::FromString(StageTitle));
    }

    // Clear any existing buttons
    ClearOptions();

    // For each option, create a button
    for (auto& Elem : Options)
    {
        FString OptionKey = Elem.Key;
        FString OptionDesc = Elem.Value;

        // Create Button
        UButton* Btn = WidgetTree->ConstructWidget<UButton>(UButton::StaticClass());
        UTextBlock* BtnLabel = WidgetTree->ConstructWidget<UTextBlock>(UTextBlock::StaticClass());
        BtnLabel->SetText(FText::FromString(OptionKey + TEXT(": ") + OptionDesc));
        Btn->AddChild(BtnLabel);

        // Bind OnClicked to SelectOption
        Btn->OnClicked.AddDynamic(this, &UDecisionWidget::SelectOption);
        // Store the OptionKey in the button’s tag for retrieval
        Btn->WidgetTags.Add(FName(*OptionKey));

        OptionsList->AddChild(Btn);
    }
}

void UDecisionWidget::ClearOptions()
{
    if (OptionsList)
    {
        OptionsList->ClearChildren();
    }
}

void UDecisionWidget::SelectOption(FString OptionKey)
{
    // Broadcast the decision
    OnDecisionSelected.Broadcast(OptionKey);

    // Hide widget after selection
    SetVisibility(ESlateVisibility::Hidden);
}
