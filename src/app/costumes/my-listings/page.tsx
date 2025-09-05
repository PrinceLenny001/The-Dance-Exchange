"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Edit, Trash2, Eye, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

interface CostumeImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

interface Costume {
  id: string;
  title: string;
  price: string | number; // Prisma Decimal comes as string
  size: string;
  condition: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: CostumeImage[];
}

function MyListingsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "sold">("active");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [costumeToDelete, setCostumeToDelete] = useState<Costume | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchCostumes();
    }
  }, [user, authLoading, router]);

  const fetchCostumes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/me/costumes", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCostumes(data.costumes);
      } else {
        toast.error("Failed to load your listings");
      }
    } catch (error) {
      console.error("Error fetching costumes:", error);
      toast.error("An error occurred while loading your listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (costume: Costume) => {
    setCostumeToDelete(costume);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!costumeToDelete) return;

    try {
      const response = await fetch(`/api/costumes/${costumeToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        toast.success("Listing deleted successfully");
        fetchCostumes(); // Refresh the list
      } else {
        toast.error("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting costume:", error);
      toast.error("An error occurred while deleting the listing");
    } finally {
      setShowDeleteModal(false);
      setCostumeToDelete(null);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCostumes = costumes.filter(costume => 
    activeTab === "active" ? costume.status === "available" : costume.status === "sold"
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/profile"
          className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Profile
        </Link>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                My Listings
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage your costume listings and track their status
              </p>
            </div>
            
            <Link
              href="/costumes/create"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
            >
              <Plus className="h-5 w-5" />
              Create New Listing
            </Link>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-neutral-200 dark:border-neutral-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "active"
                      ? "border-brandBlue-500 text-brandBlue-600 dark:text-brandBlue-400"
                      : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  Active Listings ({costumes.filter(c => c.status === "available").length})
                </button>
                <button
                  onClick={() => setActiveTab("sold")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "sold"
                      ? "border-brandBlue-500 text-brandBlue-600 dark:text-brandBlue-400"
                      : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  Sold Listings ({costumes.filter(c => c.status === "sold").length})
                </button>
              </nav>
            </div>
          </div>

          {/* Listings Grid */}
          {filteredCostumes.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                No {activeTab} listings
              </h3>
              <p className="text-neutral-500 dark:text-neutral-500 mb-6">
                {activeTab === "active" 
                  ? "You haven't created any listings yet." 
                  : "You haven't sold any costumes yet."
                }
              </p>
              {activeTab === "active" && (
                <Link
                  href="/costumes/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Listing
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCostumes.map((costume) => (
                <div
                  key={costume.id}
                  className="group rounded-2xl bg-white dark:bg-neutral-800/50 shadow-xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  {/* Image */}
                  <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                    {costume.images.length > 0 ? (
                      <img
                        src={costume.images.find(img => img.isPrimary)?.imageUrl || costume.images[0].imageUrl}
                        alt={costume.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-neutral-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2">
                        {costume.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        costume.status === "available"
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      }`}>
                        {costume.status === "available" ? "Active" : "Sold"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-brandBlue-600 dark:text-brandBlue-400">
                          ${Number(costume.price).toFixed(2)}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {costume.size}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {getConditionLabel(costume.condition)} • Listed {formatDate(costume.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/costumes/${costume.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                      
                      {costume.status === "available" && (
                        <>
                          <Link
                            href={`/costumes/edit/${costume.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(costume)}
                            className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && costumeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Delete Listing
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete "{costumeToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCostumeToDelete(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyListings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyListingsContent />
    </Suspense>
  );
}
