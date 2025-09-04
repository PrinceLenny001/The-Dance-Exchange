"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Calendar, Star, Package, Heart, Edit, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface UserStats {
  totalCostumes: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
}

function ProfileContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchUserStats();
    }
  }, [user, authLoading, router]);

  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profile", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-neutral-300" />
      );
    }

    return stars;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading profile...</p>
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
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-neutral-400" />
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username}
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
                  @{user.username}
                </p>

                {/* Join Date */}
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.createdAt || new Date().toISOString())}</span>
                </div>

                {/* Rating */}
                {stats && stats.totalReviews > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(stats.averageRating)}
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {stats.averageRating.toFixed(1)} ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Link>
                
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-6 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 bg-brandBlue-100 dark:bg-brandBlue-900 rounded-lg">
                  <Package className="h-6 w-6 text-brandBlue-600 dark:text-brandBlue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">My Listings</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stats?.totalCostumes || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-6 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Sales</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stats?.totalSales || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-6 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Heart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Average Rating</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/costumes/create"
              className="group rounded-2xl bg-white dark:bg-neutral-800/50 p-6 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-brandBlue-100 dark:bg-brandBlue-900 rounded-lg">
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
              className="group rounded-2xl bg-white dark:bg-neutral-800/50 p-6 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
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
              href={`/profile/${user.username}`}
              className="group rounded-2xl bg-white dark:bg-neutral-800/50 p-6 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-neutral-900 dark:text-white">
                  Public Profile
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                View your public profile page
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
