"use client";

import React, { useState } from "react";
import { DollarSign, Ruler, Star } from "lucide-react";

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

interface Step2DetailsProps {
  formData: CostumeFormData;
  updateFormData: (updates: Partial<CostumeFormData>) => void;
}

const sizeOptions = [
  { value: "Child XS", label: "Child XS" },
  { value: "Child S", label: "Child S" },
  { value: "Child M", label: "Child M" },
  { value: "Child L", label: "Child L" },
  { value: "Child XL", label: "Child XL" },
  { value: "Adult XS", label: "Adult XS" },
  { value: "Adult S", label: "Adult S" },
  { value: "Adult M", label: "Adult M" },
  { value: "Adult L", label: "Adult L" },
  { value: "Adult XL", label: "Adult XL" },
  { value: "Adult XXL", label: "Adult XXL" },
];

const conditionOptions = [
  { value: "NEW", label: "New", description: "Never worn, with tags" },
  { value: "LIKE_NEW", label: "Like New", description: "Worn once or twice, excellent condition" },
  { value: "GOOD", label: "Good", description: "Worn several times, minor wear" },
  { value: "FAIR", label: "Fair", description: "Well-worn but still functional" },
];

export default function Step2Details({ formData, updateFormData }: Step2DetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CostumeFormData, value: string) => {
    updateFormData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatPrice = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  const handlePriceChange = (value: string) => {
    const formatted = formatPrice(value);
    handleInputChange("price", formatted);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Pricing & Details
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Set your price and provide sizing information
        </p>
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          <DollarSign className="inline h-4 w-4 mr-1" />
          Price *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-500 dark:text-neutral-400 text-lg">$</span>
          </div>
          <input
            id="price"
            type="text"
            value={formData.price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className={`w-full pl-8 pr-4 py-3 rounded-lg border text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
              errors.price
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Research similar costumes to set a competitive price
        </p>
      </div>

      {/* Size */}
      <div>
        <label
          htmlFor="size"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          <Ruler className="inline h-4 w-4 mr-1" />
          Size *
        </label>
        <select
          id="size"
          value={formData.size}
          onChange={(e) => handleInputChange("size", e.target.value)}
          className={`w-full rounded-lg border px-4 py-3 text-neutral-900 dark:text-white shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
            errors.size
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
          }`}
        >
          <option value="">Select a size</option>
          {sizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.size && (
          <p className="mt-1 text-sm text-red-600">{errors.size}</p>
        )}
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Choose the size that best fits the costume
        </p>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          <Star className="inline h-4 w-4 mr-1" />
          Condition *
        </label>
        <div className="space-y-3">
          {conditionOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                formData.condition === option.value
                  ? "bg-brandBlue-50 dark:bg-brandBlue-900/20 border-brandBlue-500 dark:border-brandBlue-400"
                  : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={option.value}
                checked={formData.condition === option.value}
                onChange={(e) => handleInputChange("condition", e.target.value)}
                className="mt-1 h-4 w-4 text-brandBlue-600 focus:ring-brandBlue-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.condition && (
          <p className="mt-2 text-sm text-red-600">{errors.condition}</p>
        )}
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Be honest about the condition to avoid disputes
        </p>
      </div>
    </div>
  );
}
