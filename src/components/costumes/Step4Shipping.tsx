"use client";

import React, { useState } from "react";
import { Truck, DollarSign, Clock } from "lucide-react";

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

interface Step4ShippingProps {
  formData: CostumeFormData;
  updateFormData: (updates: Partial<CostumeFormData>) => void;
}

const shippingMethods = [
  { value: "standard", label: "Standard Shipping", description: "5-7 business days", baseCost: 8.99 },
  { value: "expedited", label: "Expedited Shipping", description: "2-3 business days", baseCost: 15.99 },
  { value: "overnight", label: "Overnight Shipping", description: "Next business day", baseCost: 29.99 },
  { value: "pickup", label: "Local Pickup", description: "Arrange with buyer", baseCost: 0 },
];

const deliveryEstimates = [
  { value: "1-2", label: "1-2 business days" },
  { value: "3-5", label: "3-5 business days" },
  { value: "5-7", label: "5-7 business days" },
  { value: "7-10", label: "7-10 business days" },
  { value: "10-14", label: "10-14 business days" },
  { value: "varies", label: "Varies by location" },
];

export default function Step4Shipping({ formData, updateFormData }: Step4ShippingProps) {
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
    handleInputChange("shippingCost", formatted);
  };

  const handleShippingMethodChange = (method: string) => {
    const selectedMethod = shippingMethods.find(m => m.value === method);
    if (selectedMethod) {
      updateFormData({ 
        shippingMethod: method,
        shippingCost: selectedMethod.baseCost.toString()
      });
    }
  };

  const getSelectedMethod = () => {
    return shippingMethods.find(m => m.value === formData.shippingMethod);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Shipping Options
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Set your shipping preferences and costs
        </p>
      </div>

      {/* Shipping Method */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          <Truck className="inline h-4 w-4 mr-1" />
          Shipping Method *
        </label>
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <label
              key={method.value}
              className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                formData.shippingMethod === method.value
                  ? "bg-brandBlue-50 dark:bg-brandBlue-900/20 border-brandBlue-500 dark:border-brandBlue-400"
                  : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={method.value}
                checked={formData.shippingMethod === method.value}
                onChange={(e) => handleShippingMethodChange(e.target.value)}
                className="mt-1 h-4 w-4 text-brandBlue-600 focus:ring-brandBlue-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {method.label}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {method.description}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {method.baseCost > 0 ? `$${method.baseCost.toFixed(2)}` : "Free"}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.shippingMethod && (
          <p className="mt-2 text-sm text-red-600">{errors.shippingMethod}</p>
        )}
      </div>

      {/* Custom Shipping Cost */}
      {formData.shippingMethod && formData.shippingMethod !== "pickup" && (
        <div>
          <label
            htmlFor="shippingCost"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            <DollarSign className="inline h-4 w-4 mr-1" />
            Shipping Cost *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-500 dark:text-neutral-400 text-lg">$</span>
            </div>
            <input
              id="shippingCost"
              type="text"
              value={formData.shippingCost}
              onChange={(e) => handlePriceChange(e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
                errors.shippingCost
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.shippingCost && (
            <p className="mt-1 text-sm text-red-600">{errors.shippingCost}</p>
          )}
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            You can adjust the shipping cost based on your location and packaging needs
          </p>
        </div>
      )}

      {/* Estimated Delivery */}
      <div>
        <label
          htmlFor="estimatedDelivery"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          <Clock className="inline h-4 w-4 mr-1" />
          Estimated Delivery Time
        </label>
        <select
          id="estimatedDelivery"
          value={formData.estimatedDelivery}
          onChange={(e) => handleInputChange("estimatedDelivery", e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-neutral-900 dark:text-white shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
        >
          <option value="">Select delivery time</option>
          {deliveryEstimates.map((estimate) => (
            <option key={estimate.value} value={estimate.value}>
              {estimate.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Help buyers understand when they can expect to receive their costume
        </p>
      </div>

      {/* Shipping Summary */}
      {formData.shippingMethod && (
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Shipping Summary
          </h3>
          <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-medium">
                {getSelectedMethod()?.label || "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cost:</span>
              <span className="font-medium">
                {formData.shippingMethod === "pickup" 
                  ? "Free (Local Pickup)" 
                  : `$${formData.shippingCost || "0.00"}`
                }
              </span>
            </div>
            {formData.estimatedDelivery && (
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-medium">
                  {deliveryEstimates.find(e => e.value === formData.estimatedDelivery)?.label}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
