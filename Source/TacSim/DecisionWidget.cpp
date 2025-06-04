#include "DecisionWidget.h"
#include "Components/TextBlock.h"
#include "Components/VerticalBox.h"
#include "Components/Button.h"
#include "Components/TextBlock.h"

void UDecisionWidget::NativeConstruct()
{
    Super::NativeConstruct();
    SetVisibility(ESlateVisibility::Hidden);
}

void UDecisionWidget::InitializeDecision(const FString& StageTitle, const TMap<FString, FString>& Options)
{
    SetVisibility(ESlateVisibility::Visible);
    if (StageText)
    {
        StageText->SetText(FText::FromString(StageTitle));
    }
    ClearOptions();
    for (auto& Elem : Options)
    {
        UButton* Btn = WidgetTree->ConstructWidget<UButton>(UButton::StaticClass());
        UTextBlock* Label = WidgetTree->ConstructWidget<UTextBlock>(UTextBlock::StaticClass());
        Label->SetText(FText::FromString(Elem.Key + ": " + Elem.Value));
        Btn->AddChild(Label);
        Btn->OnClicked.AddDynamic(this, &UDecisionWidget::SelectOption);
        Btn->WidgetTags.Add(FName(*Elem.Key));
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
    OnDecisionSelected.Broadcast(OptionKey);
    SetVisibility(ESlateVisibility::Hidden);
}
