"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Grid, List, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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
}

interface Costume {
  id: string;
  title: string;
  price: string | number;
  size: string;
  condition: string;
  status: string;
  createdAt: string;
  images: CostumeImage[];
  categories: { category: Category }[];
  seller: Seller;
}

interface SearchFilters {
  query: string;
  categories: string[];
  sizes: string[];
  conditions: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: string;
}

const initialFilters: SearchFilters = {
  query: "",
  categories: [],
  sizes: [],
  conditions: [],
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const sizeOptions = [
  "Child S", "Child M", "Child L",
  "Adult XS", "Adult S", "Adult M", "Adult L", "Adult XL"
];

const conditionOptions = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const sortOptions = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price: Low to High" },
  { value: "price", label: "Price: High to Low" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Initialize filters from URL params
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    
    setFilters(prev => ({
      ...prev,
      query,
      categories: category ? [category] : [],
    }));

    fetchCategories();
  }, [searchParams]);

  useEffect(() => {
    if (categories.length > 0) {
      performSearch();
    }
  }, [filters, categories]);

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

  const performSearch = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.query) params.append("q", filters.query);
      if (filters.categories.length > 0) params.append("categories", filters.categories.join(","));
      if (filters.sizes.length > 0) params.append("sizes", filters.sizes.join(","));
      if (filters.conditions.length > 0) params.append("conditions", filters.conditions.join(","));
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      params.append("page", currentPage.toString());
      params.append("limit", "24");

      const response = await fetch(`/api/costumes/search?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setCostumes(data.costumes);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
      } else {
        toast.error("Failed to search costumes");
      }
    } catch (error) {
      console.error("Error searching costumes:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleConditionToggle = (condition: string) => {
    setFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const getConditionLabel = (condition: string) => {
    const option = conditionOptions.find(opt => opt.value === condition);
    return option ? option.label : condition;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Search Costumes
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {totalResults > 0 ? `${totalResults} costumes found` : "Find your perfect costume"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-brandBlue-600 dark:text-brandBlue-400 hover:text-brandBlue-700 dark:hover:text-brandBlue-300"
                >
                  Clear All
                </button>
              </div>

              {/* Search Query */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search costumes..."
                    value={filters.query}
                    onChange={(e) => updateFilters({ query: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Categories
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded border-neutral-300 text-brandBlue-600 focus:ring-brandBlue-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Sizes
                </label>
                <div className="space-y-2">
                  {sizeOptions.map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size)}
                        onChange={() => handleSizeToggle(size)}
                        className="rounded border-neutral-300 text-brandBlue-600 focus:ring-brandBlue-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Condition
                </label>
                <div className="space-y-2">
                  {conditionOptions.map((condition) => (
                    <label key={condition.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.conditions.includes(condition.value)}
                        onChange={() => handleConditionToggle(condition.value)}
                        className="rounded border-neutral-300 text-brandBlue-600 focus:ring-brandBlue-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {condition.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    className="px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    updateFilters({ sortBy, sortOrder });
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brandBlue-500"
                >
                  <option value="createdAt-desc">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {totalResults} results
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-brandBlue-100 dark:bg-brandBlue-900/20 text-brandBlue-600 dark:text-brandBlue-400" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? "bg-brandBlue-100 dark:bg-brandBlue-900/20 text-brandBlue-600 dark:text-brandBlue-400" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Results Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="aspect-square bg-neutral-200 dark:bg-neutral-700" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded" />
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                      <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : costumes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No costumes found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white hover:from-brandBlue-600 hover:to-brandBlue-700 transition-all"
                >
                  Browse All Costumes
                </Link>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {costumes.map((costume) => (
                  <Link
                    key={costume.id}
                    href={`/costumes/${costume.id}`}
                    className="group bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className={`${viewMode === "grid" ? "aspect-square" : "h-48"} bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center overflow-hidden`}>
                      {costume.images.length > 0 ? (
                        <img
                          src={costume.images.find(img => img.isPrimary)?.imageUrl || costume.images[0].imageUrl}
                          alt={costume.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-600 rounded-full flex items-center justify-center">
                          <Search className="h-8 w-8 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-brandBlue-600 dark:group-hover:text-brandBlue-400 transition-colors">
                          {costume.title}
                        </h3>
                        <span className="text-2xl font-bold text-brandBlue-600 dark:text-brandBlue-400">
                          ${Number(costume.price).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {costume.size}
                        </span>
                        <span className="text-sm text-neutral-300 dark:text-neutral-600">•</span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {getConditionLabel(costume.condition)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                        <span>by @{costume.seller.username}</span>
                        <span>{formatDate(costume.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-brandBlue-500 text-white"
                        : "border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
