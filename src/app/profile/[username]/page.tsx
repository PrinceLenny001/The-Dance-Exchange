"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, Star, Package, Heart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface PublicUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  profilePictureUrl: string | null;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
}

interface Costume {
  id: string;
  title: string;
  price: number;
  primaryImageUrl: string | null;
  condition: string;
  createdAt: string;
}

function PublicProfileContent() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  
  const [user, setUser] = useState<PublicUser | null>(null);
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${username}`);
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCostumes(data.costumes || []);
      } else if (response.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-500 mb-4">
            {error || "User Not Found"}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 mb-8">
            The user you're looking for doesn't exist or has been removed.
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
          Back
        </Link>

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
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>

                {/* Rating */}
                {user.totalReviews > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(user.averageRating)}
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {user.averageRating.toFixed(1)} ({user.totalReviews} review{user.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>

              {/* Edit Profile Button (if viewing own profile) */}
              {currentUser?.username === user.username && (
                <Link
                  href="/profile/edit"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {/* Costumes Section */}
          <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Costumes for Sale
              </h2>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Package className="h-4 w-4" />
                <span>{costumes.length} item{costumes.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {costumes.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  No costumes available
                </h3>
                <p className="text-neutral-500 dark:text-neutral-500">
                  This user hasn't listed any costumes yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {costumes.map((costume) => (
                  <Link
                    key={costume.id}
                    href={`/costumes/${costume.id}`}
                    className="group rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                      {costume.primaryImageUrl ? (
                        <img
                          src={costume.primaryImageUrl}
                          alt={costume.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-neutral-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-neutral-900 dark:text-white mb-2 line-clamp-2">
                        {costume.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-brandBlue-600 dark:text-brandBlue-400">
                          ${costume.price}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                          {costume.condition}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicProfile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicProfileContent />
    </Suspense>
  );
}
