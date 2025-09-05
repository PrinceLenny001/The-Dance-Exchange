#!/bin/bash

# Script to help set up Vercel environment variables
# Run this script and follow the instructions

echo "🚀 Setting up Vercel Environment Variables for Second Act"
echo "=================================================="
echo ""

echo "1. Go to your Vercel dashboard: https://vercel.com"
echo "2. Find your 'secondact' project and click on it"
echo "3. Go to Settings > Environment Variables"
echo "4. Add the following variables:"
echo ""

echo "Required Variables:"
echo "-------------------"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "NEXTAUTH_URL=https://secondact.vercel.app"
echo "DATABASE_URL=postgresql://postgres:wpXBJfxZgwYooLhZ@db.hxaurxmxrsobqgctrihc.supabase.co:5432/postgres"
echo "NEXT_PUBLIC_SUPABASE_URL=https://hxaurxmxrsobqgctrihc.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YXVyeG14cnNvYnFnY3RyaWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzE3OTYsImV4cCI6MjA3MjYwNzc5Nn0.ekxVB6covhSXMnn7IAr7Kg4uwQcImWF6jGPNCLUPf4"
echo ""

echo "Stripe Variables:"
echo "-----------------"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QrVqGFaZWv3fFv1oyMI1qKZ3hgDf1de8kNy8PX9hvOFwxtTEMF6YGi3pHP2X4wtzQrmlDgfcrPt9zlcC16FytxX00koqn3oGw"
echo "STRIPE_SECRET_KEY=sksk_live_51QrVqGFaZWv3fFv1SmnkN2tRTMBFG53OBh173mGmVHPyqAHybAvNedCtjGvSjhaAVmKAswxNU4FN5AjaFPgyjTIA00ESZwlJRY"
echo "STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here"
echo "STRIPE_CONNECT_CLIENT_ID=ca_your_stripe_connect_client_id_here"
echo "STRIPE_COMMISSION_PERCENTAGE=12"
echo ""

echo "Email Variables:"
echo "----------------"
echo "RESEND_API_KEY=your_resend_api_key_here"
echo ""

echo "5. After adding all variables, redeploy your app"
echo "6. Your app should now work correctly!"
echo ""
echo "✅ Done! Your app should be working after redeployment."
