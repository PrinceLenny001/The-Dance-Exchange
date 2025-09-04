"use client";

import React from "react";
import ClientProvider from "@/components/ClientProvider";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* {session && <NavigationBar />} */}

      <main className="flex-1 flex flex-col w-full mx-auto">
        <ClientProvider>
          <div className="flex-1 flex items-start justify-center  bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
                  <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
                </div>
              </div>
            ) : user ? (
              // Authenticated View
              <section className="max-w-7xl w-full space-y-8 animate-fade-in">
                <h1> Welcome {user.firstName || user.username}</h1>
              </section>
            ) : (
              // Marketing View
              <section className="max-w-7xl w-full space-y-8 animate-fade-in">
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brandBlue-500 to-brandBlue-700 dark:from-brandBlue-400 dark:to-brandBlue-600">
                      Second Act
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                      The marketplace for used dance costumes. Buy, sell, and discover beautiful costumes for your next performance.
                    </p>
                  </div>
                  
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
