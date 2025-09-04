"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

function ResetPasswordContent() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Validate token on component mount
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/validate-reset-token/${token}`, {
        method: "GET",
      });

      if (response.ok) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setIsValidToken(false);
    } finally {
      setIsValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        toast.error(data.error || "Failed to reset password. Please try again.");
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (isValidating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
        <Link
          href="/"
          className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-500">
              Invalid Reset Link
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
            <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <p>This could happen if:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>The link has expired (links expire after 1 hour)</li>
                <li>The link has already been used</li>
                <li>The link is malformed or corrupted</li>
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-4 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
              >
                Request New Reset Link
              </Link>
              
              <Link
                href="/auth/login"
                className="block w-full text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-neutral-700 dark:text-neutral-300 shadow-sm transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Password Reset Successfully!
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              Your password has been updated. You can now sign in with your new password.
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
            <div className="text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Redirecting to sign in page...
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-6 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
              Reset Password
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Enter your new password below
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                New Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full rounded-lg border px-4 py-3 pr-10 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm New Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full rounded-lg border px-4 py-3 pr-10 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-4 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="h-5 w-5" />
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
