"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, X, Star, Move, Trash2 } from "lucide-react";

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

interface Step3ImagesProps {
  formData: CostumeFormData;
  updateFormData: (updates: Partial<CostumeFormData>) => void;
}

export default function Step3Images({ formData, updateFormData }: Step3ImagesProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      
      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      setErrors({ images: "Please select valid image files (max 5MB each)" });
      return;
    }

    if (validFiles.length !== files.length) {
      setErrors({ images: "Some files were skipped. Please ensure all files are images under 5MB." });
    } else {
      setErrors({});
    }

    const newImages = [...formData.images, ...validFiles];
    updateFormData({ images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    let newPrimaryIndex = formData.primaryImageIndex;
    
    // Adjust primary index if needed
    if (formData.primaryImageIndex === index) {
      newPrimaryIndex = 0;
    } else if (formData.primaryImageIndex > index) {
      newPrimaryIndex = formData.primaryImageIndex - 1;
    }
    
    updateFormData({ 
      images: newImages, 
      primaryImageIndex: newPrimaryIndex 
    });
  };

  const setPrimaryImage = (index: number) => {
    updateFormData({ primaryImageIndex: index });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    let newPrimaryIndex = formData.primaryImageIndex;
    if (formData.primaryImageIndex === fromIndex) {
      newPrimaryIndex = toIndex;
    } else if (fromIndex < formData.primaryImageIndex && toIndex >= formData.primaryImageIndex) {
      newPrimaryIndex = formData.primaryImageIndex - 1;
    } else if (fromIndex > formData.primaryImageIndex && toIndex <= formData.primaryImageIndex) {
      newPrimaryIndex = formData.primaryImageIndex + 1;
    }
    
    updateFormData({ 
      images: newImages, 
      primaryImageIndex: newPrimaryIndex 
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Upload Photos
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Show off your costume with high-quality photos
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-brandBlue-500 bg-brandBlue-50 dark:bg-brandBlue-900/20"
            : "border-neutral-300 dark:border-neutral-600 hover:border-brandBlue-400 dark:hover:border-brandBlue-500"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-neutral-400" />
          </div>
          
          <div>
            <button
              type="button"
              onClick={openFileDialog}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brandBlue-500 text-white rounded-lg hover:bg-brandBlue-600 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Choose Files
            </button>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              or drag and drop images here
            </p>
          </div>
          
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            PNG, JPG, GIF up to 5MB each. Upload at least 1 image, up to 10 images.
          </p>
        </div>
      </div>

      {errors.images && (
        <p className="text-sm text-red-600">{errors.images}</p>
      )}

      {/* Image Grid */}
      {formData.images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
            Your Photos ({formData.images.length}/10)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div
                key={index}
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  formData.primaryImageIndex === index
                    ? "border-brandBlue-500 ring-2 ring-brandBlue-200 dark:ring-brandBlue-800"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Costume photo ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                
                {/* Primary Badge */}
                {formData.primaryImageIndex === index && (
                  <div className="absolute top-2 left-2 bg-brandBlue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Primary
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="p-2 bg-white text-neutral-700 rounded-full hover:bg-brandBlue-50 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index - 1)}
                        className="p-2 bg-white text-neutral-700 rounded-full hover:bg-brandBlue-50 transition-colors"
                        title="Move left"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                    )}
                    
                    {index < formData.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, index + 1)}
                        className="p-2 bg-white text-neutral-700 rounded-full hover:bg-brandBlue-50 transition-colors"
                        title="Move right"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The first image will be used as the main photo in search results. You can reorder images by clicking the move buttons.
          </p>
        </div>
      )}
    </div>
  );
}
