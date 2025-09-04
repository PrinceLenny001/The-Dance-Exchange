"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Package, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Welcome back, {user.firstName || user.username}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your dance costume marketplace account
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center">
              <div className="p-2 bg-brandBlue-100 dark:bg-brandBlue-900 rounded-lg">
                <Package className="h-6 w-6 text-brandBlue-600 dark:text-brandBlue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">My Listings</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Orders</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Wishlist</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Profile</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/costumes/create"
            className="group bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-brandBlue-100 dark:bg-brandBlue-900 rounded-lg">
                <Package className="h-6 w-6 text-brandBlue-600 dark:text-brandBlue-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                Create Listing
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              List a new dance costume for sale
            </p>
          </Link>

          <Link
            href="/costumes/my-listings"
            className="group bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                My Listings
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your costume listings
            </p>
          </Link>

          <Link
            href="/orders"
            className="group bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                My Orders
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              View your purchase history
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="group bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                Wishlist
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              View your saved costumes
            </p>
          </Link>

          <Link
            href="/profile"
            className="group bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                Profile Settings
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Update your profile information
            </p>
          </Link>

          <Link
            href="/costumes"
            className="group bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                Browse Costumes
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Discover new dance costumes
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
