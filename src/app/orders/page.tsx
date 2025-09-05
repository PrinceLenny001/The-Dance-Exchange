"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  ArrowLeft,
  Eye
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

interface OrderItem {
  id: string;
  costumeId: string;
  priceAtPurchase: number;
  quantity: number;
  costume: {
    id: string;
    title: string;
    images: Array<{
      id: string;
      imageUrl: string;
      isPrimary: boolean;
    }>;
    seller: {
      id: string;
      username: string;
    };
  };
}

interface Order {
  id: string;
  totalPrice: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/me/orders");
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        setError("Failed to fetch orders");
        toast.error("Failed to load your orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("An error occurred while loading orders");
      toast.error("An error occurred while loading orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address: any) => {
    return `${address.address}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">
            Error Loading Orders
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {error}
          </p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-brandBlue-500 hover:bg-brandBlue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              My Orders
            </h1>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-neutral-400" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                No Orders Yet
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                You haven't made any purchases yet. Start shopping to find your perfect costume!
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 text-white hover:from-brandBlue-600 hover:to-brandBlue-700 transition-all"
              >
                <Package className="h-5 w-5" />
                Browse Costumes
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                          ${order.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                      Items ({order.orderItems.length})
                    </h3>
                    <div className="space-y-4">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                        >
                          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-600 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.costume.images.length > 0 ? (
                              <img
                                src={item.costume.images.find(img => img.isPrimary)?.imageUrl || item.costume.images[0].imageUrl}
                                alt={item.costume.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-neutral-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900 dark:text-white">
                              {item.costume.title}
                            </h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              Sold by @{item.costume.seller.username}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Quantity: {item.quantity}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-neutral-900 dark:text-white">
                              ${item.priceAtPurchase.toFixed(2)}
                            </div>
                            <Link
                              href={`/costumes/${item.costume.id}`}
                              className="inline-flex items-center gap-1 text-sm text-brandBlue-600 dark:text-brandBlue-400 hover:text-brandBlue-700 dark:hover:text-brandBlue-300 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View Item
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="px-6 pb-6">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      Shipping Address
                    </h3>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </div>
                      <div>{formatAddress(order.shippingAddress)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
