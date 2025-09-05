import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "✅ Set" : "❌ Missing",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "✅ Set" : "❌ Missing",
    STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID ? "✅ Set" : "❌ Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
  };

  return NextResponse.json({
    message: "Environment variables check",
    environment: envVars,
    timestamp: new Date().toISOString(),
  });
}
