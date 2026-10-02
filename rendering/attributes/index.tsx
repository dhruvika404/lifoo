"use client";

import { useState } from "react";
import { NutritionTab } from "./nutritionTab";
import { IngredientTab } from "./ingredientTab";
import { KeywordTab } from "./keywordTab";

type ActiveTab = "nutrition" | "ingredient" | "keyword";

export function AttributesModule() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("nutrition");

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "nutrition", label: "Nutritions" },
    { id: "ingredient", label: "Ingredients" },
    { id: "keyword", label: "Keywords" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border px-6 pt-6 gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-[#2d7a4f] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
          {activeTab === "nutrition" && <NutritionTab />}
          {activeTab === "ingredient" && <IngredientTab />}
          {activeTab === "keyword" && <KeywordTab />}
        </div>
    </div>
  );
}
