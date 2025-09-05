"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { toast } from "react-toastify";

interface StripeAccountStatus {
  hasAccount: boolean;
  accountId?: string;
  status?: {
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
  };
  canReceivePayments?: boolean;
}

export default function StripeConnectSetup() {
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAccountStatus();
  }, []);

  const fetchAccountStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/connect/account-status", {
        headers: {
          "x-user-id": localStorage.getItem("user_id") || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccountStatus(data);
      } else {
        console.error("Failed to fetch account status");
      }
    } catch (error) {
      console.error("Error fetching account status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createStripeAccount = async () => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
        headers: {
          "x-user-id": localStorage.getItem("user_id") || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.onboardingUrl) {
          // Redirect to Stripe onboarding
          window.location.href = data.onboardingUrl;
        } else {
          toast.error("Failed to create Stripe account");
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create Stripe account");
      }
    } catch (error) {
      console.error("Error creating Stripe account:", error);
      toast.error("Failed to create Stripe account");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = () => {
    if (!accountStatus?.hasAccount) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    
    if (accountStatus.canReceivePayments) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!accountStatus?.hasAccount) {
      return "Not Set Up";
    }
    
    if (accountStatus.canReceivePayments) {
      return "Active - Ready to receive payments";
    }
    
    return "Pending - Complete setup to receive payments";
  };

  const getStatusColor = () => {
    if (!accountStatus?.hasAccount) {
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    
    if (accountStatus.canReceivePayments) {
      return "text-green-600 bg-green-50 border-green-200";
    }
    
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-brandBlue-500" />
          <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading payment setup...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brandBlue-100 dark:bg-brandBlue-900 rounded-lg">
          <CreditCard className="h-6 w-6 text-brandBlue-600 dark:text-brandBlue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Payment Processing Setup
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Set up Stripe Connect to receive payments from your costume sales
          </p>
        </div>
      </div>

      {/* Status Display */}
      <div className={`rounded-lg border p-4 mb-6 ${getStatusColor()}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium">{getStatusText()}</p>
            {accountStatus?.hasAccount && !accountStatus.canReceivePayments && (
              <p className="text-sm mt-1">
                Complete the Stripe onboarding process to start receiving payments
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Commission Information */}
      <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
          Commission Structure
        </h4>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <p>• Platform commission: 12% of each sale</p>
          <p>• You receive: 88% of each sale</p>
          <p>• Payments are processed automatically via Stripe</p>
          <p>• Funds are transferred to your bank account</p>
        </div>
      </div>

      {/* Action Button */}
      {!accountStatus?.hasAccount ? (
        <button
          onClick={createStripeAccount}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          {isCreating ? "Creating Account..." : "Set Up Payment Processing"}
        </button>
      ) : !accountStatus.canReceivePayments ? (
        <button
          onClick={createStripeAccount}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/20 transition-all hover:from-yellow-600 hover:to-yellow-700 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <ExternalLink className="h-5 w-5" />
          )}
          {isCreating ? "Redirecting..." : "Complete Setup"}
        </button>
      ) : (
        <div className="text-center">
          <p className="text-green-600 dark:text-green-400 font-medium">
            ✓ Payment processing is active and ready!
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            You'll receive payments automatically when customers purchase your costumes
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
        <p>
          <strong>Need help?</strong> Stripe Connect allows you to receive payments directly to your bank account. 
          The setup process is secure and takes just a few minutes.
        </p>
      </div>
    </div>
  );
}
