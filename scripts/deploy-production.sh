#!/bin/bash

# Production Deployment Script for Second Act Dance Costume Marketplace
# Run this script to deploy to production

set -e  # Exit on any error

echo "🚀 Starting production deployment for Second Act..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_status "All dependencies are available"
}

# Run pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found. Please create it first."
        exit 1
    fi
    
    # Check if all required environment variables are set
    source .env.production
    
    required_vars=(
        "DATABASE_URL"
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        "STRIPE_SECRET_KEY"
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    print_status "All required environment variables are set"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Install dependencies
    npm ci
    
    # Run database migration
    print_status "Running database migration..."
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    # Build the application
    npm run build
    
    print_status "Application built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Please log in to Vercel first:"
        vercel login
    fi
    
    # Deploy to production
    vercel --prod --yes
    
    print_status "Deployment to Vercel completed"
}

# Post-deployment setup
post_deployment_setup() {
    print_status "Setting up post-deployment configuration..."
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_status "Deployment URL: $DEPLOYMENT_URL"
        
        # Update Stripe webhook URL
        print_warning "Please update your Stripe webhook URL to: $DEPLOYMENT_URL/api/stripe/webhook"
        
        # Update NextAuth URL
        print_warning "Please update NEXTAUTH_URL to: $DEPLOYMENT_URL"
    fi
    
    print_status "Post-deployment setup completed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Run build test
    npm run build
    
    # Run type check
    npx tsc --noEmit
    
    print_status "All tests passed"
}

# Main deployment function
main() {
    echo "🎭 Second Act Dance Costume Marketplace - Production Deployment"
    echo "================================================================="
    
    check_dependencies
    pre_deployment_checks
    run_tests
    build_application
    deploy_to_vercel
    post_deployment_setup
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update Stripe webhook URL in Stripe Dashboard"
    echo "2. Update NEXTAUTH_URL in Vercel environment variables"
    echo "3. Test all functionality on the production site"
    echo "4. Monitor error logs for the first 24 hours"
    echo ""
    echo "Happy selling! 🎭✨"
}

# Run main function
main "$@"
