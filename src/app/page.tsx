"use client";

import React, { useState, useEffect } from "react";
import ClientProvider from "@/components/ClientProvider";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowRight, Search, Package, Star, Users, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

function HomePageContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/costumes/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories.slice(0, 8)); // Show first 8 categories
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 flex flex-col w-full mx-auto">
        <ClientProvider>
          <div className="flex-1 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
            {/* Hero Section */}
            <section className="relative py-20 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
                      Second Act
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                      The marketplace for used dance costumes. Buy, sell, and discover beautiful costumes for your next performance.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSearch} className="relative">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search for costumes, styles, or designers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 text-lg border border-neutral-200 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:border-transparent shadow-lg"
                        />
                      </div>
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 hover:from-brandBlue-600 hover:to-brandBlue-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Search
                      </button>
                    </form>
                  </div>

                  {!user && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <Link
                        href="/auth/register"
                        className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 hover:from-brandBlue-600 hover:to-brandBlue-700 text-white rounded-lg px-8 py-4 text-lg font-medium shadow-lg shadow-brandBlue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-brandBlue-500/30"
                      >
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/auth/login"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg px-8 py-4 text-lg font-medium shadow-sm transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                    Browse by Category
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400">
                    Find the perfect costume for your dance style
                  </p>
                </div>

                {isLoadingCategories ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category: any) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.name)}
                        className="group aspect-square bg-gradient-to-br from-brandBlue-50 to-brandBlue-100 dark:from-brandBlue-900/20 dark:to-brandBlue-800/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:from-brandBlue-100 hover:to-brandBlue-200 dark:hover:from-brandBlue-900/40 dark:hover:to-brandBlue-800/40 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      >
                        <Package className="h-8 w-8 text-brandBlue-600 dark:text-brandBlue-400 mb-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-brandBlue-700 dark:text-brandBlue-300 group-hover:text-brandBlue-800 dark:group-hover:text-brandBlue-200">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-center mt-8">
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-brandBlue-600 dark:text-brandBlue-400 hover:text-brandBlue-700 dark:hover:text-brandBlue-300 font-medium transition-colors"
                  >
                    View all categories
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brandBlue-100 dark:bg-brandBlue-900/20 rounded-2xl mb-4">
                      <Package className="h-8 w-8 text-brandBlue-600 dark:text-brandBlue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">1000+</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Costumes Available</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl mb-4">
                      <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">500+</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Happy Customers</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl mb-4">
                      <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">15+</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Dance Styles</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            {!user && (
              <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                    Ready to Start Your Dance Journey?
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                    Join thousands of dancers who have found their perfect costumes on Second Act.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Link
                      href="/auth/register"
                      className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 hover:from-brandBlue-600 hover:to-brandBlue-700 text-white rounded-lg px-8 py-4 text-lg font-medium shadow-lg shadow-brandBlue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-brandBlue-500/30"
                    >
                      Start Shopping
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/costumes/create"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg px-8 py-4 text-lg font-medium shadow-sm transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      Sell Your Costumes
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>
        </ClientProvider>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} All Rights Reserved
          </span>
          <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            <Link
              href="/privacy"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return <HomePageContent />;
}
