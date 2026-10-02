"use client";

import React, { useState } from "react";
import { CategoryTab } from "./categoryTab";
import { CuisineTab } from "./cuisineTab";
import { DietaryTypeTab } from "./dietaryTypeTab";
import { FoodGoalTab } from "./foodGoalTab";
import { TastePreferenceTab } from "./tastePreferenceTab";

export function CategoriesModule() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border px-6 pt-6 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "categories"
              ? "border-[#2d7a4f] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("cuisines")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "cuisines"
              ? "border-[#2d7a4f] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Cuisines
        </button>
        <button
          onClick={() => setActiveTab("dietary")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "dietary"
              ? "border-[#2d7a4f] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Dietary Types
        </button>
        <button
          onClick={() => setActiveTab("food-goals")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "food-goals"
              ? "border-[#2d7a4f] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Food Goals
        </button>
        <button
          onClick={() => setActiveTab("taste-preferences")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "taste-preferences"
              ? "border-[#2d7a4f] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Taste Preferences
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "categories" && <CategoryTab />}
        {activeTab === "cuisines" && <CuisineTab />}
        {activeTab === "dietary" && <DietaryTypeTab />}
        {activeTab === "food-goals" && <FoodGoalTab />}
        {activeTab === "taste-preferences" && <TastePreferenceTab />}
      </div>
    </div>
  );
}
