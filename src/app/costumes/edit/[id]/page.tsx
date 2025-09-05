"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

// Step components
import Step1BasicInfo from "@/components/costumes/Step1BasicInfo";
import Step2Details from "@/components/costumes/Step2Details";
import Step3Images from "@/components/costumes/Step3Images";
import Step4Shipping from "@/components/costumes/Step4Shipping";

interface CostumeFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  categories: string[];
  
  // Step 2: Details
  price: string;
  size: string;
  condition: string;
  
  // Step 3: Images
  images: File[];
  primaryImageIndex: number;
  
  // Step 4: Shipping
  shippingCost: string;
  shippingMethod: string;
  estimatedDelivery: string;
}

interface CostumeImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Costume {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: string;
  status: string;
  images: CostumeImage[];
  categories: { category: Category }[];
}

const initialFormData: CostumeFormData = {
  title: "",
  description: "",
  categories: [],
  price: "",
  size: "",
  condition: "",
  images: [],
  primaryImageIndex: 0,
  shippingCost: "",
  shippingMethod: "",
  estimatedDelivery: "",
};

const steps = [
  { id: 1, title: "Basic Info", description: "Title, description, and categories" },
  { id: 2, title: "Details", description: "Price, size, and condition" },
  { id: 3, title: "Images", description: "Upload photos of your costume" },
  { id: 4, title: "Shipping", description: "Shipping options and costs" },
];

function EditCostumeContent() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const costumeId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CostumeFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<CostumeImage[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchCostume();
      fetchCategories();
    }
  }, [user, authLoading, router, costumeId]);

  const fetchCostume = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/costumes/${costumeId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const costume = data.costume;
        
        // Check if user owns this costume
        if (costume.seller.id !== user?.id) {
          toast.error("You don't have permission to edit this listing");
          router.push("/costumes/my-listings");
          return;
        }

        // Check if costume is sold
        if (costume.status === "sold") {
          toast.error("Cannot edit sold costumes");
          router.push("/costumes/my-listings");
          return;
        }

        // Populate form data
        setFormData({
          title: costume.title,
          description: costume.description,
          categories: costume.categories.map((c: any) => c.category.id),
          price: costume.price.toString(),
          size: costume.size,
          condition: costume.condition,
          images: [],
          primaryImageIndex: costume.images.findIndex((img: CostumeImage) => img.isPrimary) || 0,
          shippingCost: "0", // Default values for shipping
          shippingMethod: "standard",
          estimatedDelivery: "",
        });

        setExistingImages(costume.images);
      } else if (response.status === 404) {
        toast.error("Costume not found");
        router.push("/costumes/my-listings");
      } else {
        toast.error("Failed to load costume");
      }
    } catch (error) {
      console.error("Error fetching costume:", error);
      toast.error("An error occurred while loading the costume");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/costumes/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const updateFormData = (updates: Partial<CostumeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error("Please enter a title for your listing");
          return false;
        }
        if (!formData.description.trim()) {
          toast.error("Please enter a description");
          return false;
        }
        if (formData.categories.length === 0) {
          toast.error("Please select at least one category");
          return false;
        }
        return true;
      
      case 2:
        if (!formData.price || parseFloat(formData.price) <= 0) {
          toast.error("Please enter a valid price");
          return false;
        }
        if (!formData.size) {
          toast.error("Please select a size");
          return false;
        }
        if (!formData.condition) {
          toast.error("Please select a condition");
          return false;
        }
        return true;
      
      case 3:
        if (formData.images.length === 0 && existingImages.length === 0) {
          toast.error("Please upload at least one image");
          return false;
        }
        return true;
      
      case 4:
        if (!formData.shippingCost || parseFloat(formData.shippingCost) < 0) {
          toast.error("Please enter a valid shipping cost");
          return false;
        }
        if (!formData.shippingMethod) {
          toast.error("Please select a shipping method");
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      let imageUrls: string[] = [];
      let primaryImageIndex = formData.primaryImageIndex;

      // Handle image uploads
      if (formData.images.length > 0) {
        // Upload new images
        for (const image of formData.images) {
          const formData = new FormData();
          formData.append("file", image);
          
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error("Failed to upload image");
          }
          
          const data = await response.json();
          imageUrls.push(data.url);
        }

        // Combine with existing images
        const existingImageUrls = existingImages.map(img => img.imageUrl);
        imageUrls = [...existingImageUrls, ...imageUrls];
        
        // Adjust primary image index if we have new images
        if (formData.images.length > 0) {
          primaryImageIndex = existingImages.length + formData.primaryImageIndex;
        }
      } else {
        // Use existing images
        imageUrls = existingImages.map(img => img.imageUrl);
      }

      // Update costume listing
      const response = await fetch(`/api/costumes/${costumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          size: formData.size,
          condition: formData.condition,
          categoryIds: formData.categories,
          imageUrls,
          primaryImageIndex,
          shippingCost: parseFloat(formData.shippingCost),
          shippingMethod: formData.shippingMethod,
          estimatedDelivery: formData.estimatedDelivery,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Costume listing updated successfully!");
        router.push(`/costumes/${costumeId}`);
      } else {
        toast.error(data.error || "Failed to update listing. Please try again.");
      }
    } catch (error) {
      console.error("Update listing error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading costume...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            categories={categories}
          />
        );
      case 2:
        return (
          <Step2Details
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <Step3Images
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <Step4Shipping
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/costumes/my-listings"
          className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to My Listings
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Edit Listing
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Update your costume listing information
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.id
                        ? "bg-brandBlue-500 border-brandBlue-500 text-white"
                        : "border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400"
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-brandBlue-600 dark:text-brandBlue-400"
                          : "text-neutral-500 dark:text-neutral-400"
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                      currentStep > step.id
                        ? "bg-brandBlue-500"
                        : "bg-neutral-300 dark:bg-neutral-600"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex gap-3">
                {currentStep < steps.length ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Package className="h-4 w-4" />
                    {isSubmitting ? "Updating..." : "Update Listing"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditCostume() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditCostumeContent />
    </Suspense>
  );
}
