"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, Star, Package, User, Calendar, Truck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-toastify";

interface CostumeImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Seller {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  averageRating?: number;
  reviewCount?: number;
}

interface Costume {
  id: string;
  title: string;
  description: string;
  price: string | number; // Prisma Decimal comes as string
  size: string;
  condition: string;
  status: string;
  shippingCost?: string | number;
  shippingMethod?: string;
  estimatedDelivery?: string;
  createdAt: string;
  images: CostumeImage[];
  categories: { category: Category }[];
  seller: Seller;
}

function CostumeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const costumeId = params.id as string;
  
  const [costume, setCostume] = useState<Costume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchCostume();
  }, [costumeId]);

  const fetchCostume = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/costumes/${costumeId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCostume(data.costume);
      } else if (response.status === 404) {
        setError("Costume not found");
      } else {
        setError("Failed to load costume");
      }
    } catch (error) {
      console.error("Error fetching costume:", error);
      setError("Failed to load costume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }

    try {
      const response = await fetch(`/api/costumes/${costumeId}/favorite`, {
        method: isFavorited ? "DELETE" : "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
      } else {
        toast.error("Failed to update favorites");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("An error occurred");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: costume?.title,
          text: costume?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      NEW: "New",
      LIKE_NEW: "Like New",
      GOOD: "Good",
      FAIR: "Fair",
    };
    return labels[condition] || condition;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-neutral-300 dark:text-neutral-600"
        }`}
      />
    ));
  };

  const handleAddToCart = () => {
    if (!costume) return;

    if (!user) {
      toast.error("Please log in to add items to your cart");
      router.push("/auth/login");
      return;
    }

    if (costume.status !== "available") {
      toast.error("This costume is no longer available");
      return;
    }

    addItem({
      costumeId: costume.id,
      title: costume.title,
      price: Number(costume.price),
      size: costume.size,
      condition: costume.condition,
      imageUrl: costume.images.find(img => img.isPrimary)?.imageUrl || costume.images[0]?.imageUrl || "",
      quantity: 1,
      seller: {
        id: costume.seller.id,
        username: costume.seller.username,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading costume...</p>
        </div>
      </div>
    );
  }

  if (error || !costume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-500 mb-4">
            {error || "Costume Not Found"}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 mb-8">
            The costume you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-6 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Search
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {costume.images.length > 0 ? (
                  <img
                    src={costume.images[selectedImageIndex]?.imageUrl}
                    alt={costume.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {costume.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {costume.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? "border-brandBlue-500"
                          : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={`${costume.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  {costume.title}
                </h1>
                <div className="flex items-center gap-4 text-2xl font-bold text-brandBlue-600 dark:text-brandBlue-400">
                  ${Number(costume.price).toFixed(2)}
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {costume.categories.map(({ category }) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 bg-brandBlue-100 dark:bg-brandBlue-900 text-brandBlue-700 dark:text-brandBlue-300 rounded-full text-sm font-medium"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Size</div>
                  <div className="font-medium text-neutral-900 dark:text-white">{costume.size}</div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Condition</div>
                  <div className="font-medium text-neutral-900 dark:text-white">
                    {getConditionLabel(costume.condition)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                  {costume.description}
                </p>
              </div>

              {/* Seller Info */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Seller
                </h3>
                <Link
                  href={`/profile/${costume.seller.username}`}
                  className="flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 p-2 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                    {costume.seller.profilePictureUrl ? (
                      <img
                        src={costume.seller.profilePictureUrl}
                        alt={`${costume.seller.username}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {costume.seller.firstName && costume.seller.lastName
                        ? `${costume.seller.firstName} ${costume.seller.lastName}`
                        : costume.seller.username}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      @{costume.seller.username}
                    </div>
                    {costume.seller.averageRating && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {renderStars(costume.seller.averageRating)}
                        </div>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {costume.seller.averageRating.toFixed(1)} ({costume.seller.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleFavorite}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border transition-all ${
                      isFavorited
                        ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400"
                        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                    {isFavorited ? "Favorited" : "Add to Favorites"}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="px-6 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={costume.status !== "available"}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-brandBlue-500 disabled:hover:to-brandBlue-600"
                >
                  <Package className="h-5 w-5" />
                  {costume.status === "available" ? "Add to Cart" : "Sold Out"}
                </button>
              </div>

              {/* Shipping Information */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Shipping Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {costume.shippingMethod || "Standard Shipping"}
                    </span>
                  </div>
                  {costume.shippingCost && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 dark:text-neutral-400">Cost:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        ${Number(costume.shippingCost).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {costume.estimatedDelivery && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 dark:text-neutral-400">Estimated delivery:</span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {costume.estimatedDelivery}
                      </span>
                    </div>
                  )}
                  {!costume.shippingCost && !costume.shippingMethod && !costume.estimatedDelivery && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Shipping available - Contact seller for details
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Listed on {formatDate(costume.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CostumeDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CostumeDetailContent />
    </Suspense>
  );
}
