"use client";

import React, { Suspense, useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
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
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Password reset link sent to your email!");
      } else {
        toast.error(data.error || "Failed to send reset link. Please try again.");
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  if (isSubmitted) {
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Check Your Email
            </h1>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
            <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                <strong>What's next?</strong>
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Check your email inbox for the reset link</li>
                <li>Click the link to reset your password</li>
                <li>The link will expire in 1 hour for security</li>
                <li>If you don't see the email, check your spam folder</li>
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                className="w-full rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-4 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
              >
                Send Another Email
              </button>
              
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
              Forgot Password?
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleInputChange}
                className={`mt-2 block w-full rounded-lg border px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:ring-2 focus:ring-offset-2 ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-neutral-300 dark:border-neutral-600 focus:border-brandBlue-500 dark:focus:border-brandBlue-400 focus:ring-brandBlue-500 dark:focus:ring-brandBlue-400"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-4 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 focus:outline-none focus:ring-2 focus:ring-brandBlue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-5 w-5" />
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-brandBlue-600 dark:text-brandBlue-400 hover:text-brandBlue-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
