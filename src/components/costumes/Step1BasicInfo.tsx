"use client";

import React, { useState } from "react";
import { Tag, FileText, Type } from "lucide-react";

interface CostumeFormData {
  title: string;
  description: string;
  categories: string[];
  price: string;
  size: string;
  condition: string;
  images: File[];
  primaryImageIndex: number;
  shippingCost: string;
  shippingMethod: string;
  estimatedDelivery: string;
}

interface Category {
  id: string;
  name: string;
}

interface Step1BasicInfoProps {
  formData: CostumeFormData;
  updateFormData: (updates: Partial<CostumeFormData>) => void;
  categories: Category[];
}

export default function Step1BasicInfo({ formData, updateFormData, categories }: Step1BasicInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CostumeFormData, value: string) => {
    updateFormData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId];
    
    updateFormData({ categories: newCategories });
    
    // Clear error when user selects a category
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: "" }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Basic Information
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Tell us about your costume and what makes it special
        </p>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          <Type className="inline h-4 w-4 mr-1" />
          Listing Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full rounded-lg border px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
            errors.title
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
          }`}
          placeholder="e.g., Beautiful Ballet Tutu - Size Medium"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Choose a descriptive title that will help buyers find your costume
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          <FileText className="inline h-4 w-4 mr-1" />
          Description *
        </label>
        <textarea
          id="description"
          rows={6}
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={`w-full rounded-lg border px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 resize-none ${
            errors.description
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
          }`}
          placeholder="Describe your costume in detail. Include information about the style, color, material, any special features, and why it's perfect for dance performances..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Be detailed and honest about the condition and any unique features
        </p>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          <Tag className="inline h-4 w-4 mr-1" />
          Categories * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryToggle(category.id)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                formData.categories.includes(category.id)
                  ? "bg-brandBlue-50 dark:bg-brandBlue-900/20 border-brandBlue-500 dark:border-brandBlue-400 text-brandBlue-700 dark:text-brandBlue-300"
                  : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        {errors.categories && (
          <p className="mt-2 text-sm text-red-600">{errors.categories}</p>
        )}
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Help buyers find your costume by selecting relevant categories
        </p>
      </div>
    </div>
  );
}
