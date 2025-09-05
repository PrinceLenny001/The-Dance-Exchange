# 🚀 Production Deployment Guide

## From Development to Production - Complete Checklist

### 📋 **Pre-Deployment Checklist**

#### **1. Environment Variables Setup**
```env
# Production Environment Variables Needed:

# Database (Supabase)
DATABASE_URL="postgresql://postgres.hxaurxmxrsobqgctrihc:wpXBJfxZgwYooLhZ@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.hxaurxmxrsobqgctrihc:wpXBJfxZgwYooLhZ@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hxaurxmxrsobqgctrihc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Production Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QrVqGFaZWv3fFv1oyMI1qKZ3hgDf1de8kNy8PX9hvOFwxtTEMF6YGi3pHP2X4wtzQrmlDgfcrPt9zlcC16FytxX00koqn3oGw
STRIPE_SECRET_KEY=sk_live_your_production_secret_key_here
STRIPE_CONNECT_CLIENT_ID=ca_your_production_connect_client_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here
STRIPE_COMMISSION_PERCENTAGE=12

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secure-secret-key-32-chars-minimum

# Email (Resend)
RESEND_API_KEY=re_your_production_resend_key_here
EMAIL_FROM=noreply@your-domain.com

# AI (Optional)
GEMINI_API_KEY=your_production_gemini_key_here
```

#### **2. Stripe Production Setup**
1. **Get Production Keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to "Live" mode
   - Get your live publishable and secret keys
   - Create a Stripe Connect application for marketplace

2. **Configure Stripe Connect**:
   - Set up Connect application in Stripe Dashboard
   - Get your Connect Client ID
   - Configure webhook endpoints for production

3. **Test Payment Flow**:
   - Use real test cards in live mode
   - Verify commission collection works
   - Test seller payouts

#### **3. Database Migration**
```bash
# Run production database migration
npx prisma migrate deploy

# Or if using Supabase directly
npx prisma db push
```

#### **4. Email Configuration**
1. **Set up Resend**:
   - Create production Resend account
   - Verify your domain
   - Get production API key
   - Update email templates

2. **Configure Email Templates**:
   - Welcome emails
   - Password reset emails
   - Order confirmation emails
   - Seller notification emails

---

## 🌐 **Deployment Options**

### **Option 1: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

**Vercel Configuration**:
- Automatic deployments from GitHub
- Built-in Next.js optimization
- Edge functions for API routes
- Automatic HTTPS

### **Option 2: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=out
```

### **Option 3: AWS/Google Cloud/Azure**
- Use containerized deployment
- Set up load balancers
- Configure auto-scaling
- Set up monitoring

---

## 🔧 **Production Configuration**

#### **1. Next.js Production Settings**
```javascript
// next.config.ts
const nextConfig = {
  output: 'standalone', // For containerized deployment
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}
```

#### **2. Security Headers**
```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

#### **3. Performance Optimization**
```javascript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
}
```

---

## 🛡️ **Security Checklist**

#### **1. Environment Security**
- [ ] All secrets in environment variables
- [ ] No hardcoded API keys
- [ ] Production keys different from development
- [ ] Secure secret generation for NextAuth

#### **2. Database Security**
- [ ] Row Level Security (RLS) enabled on Supabase
- [ ] Proper user permissions
- [ ] Database backups configured
- [ ] Connection pooling enabled

#### **3. API Security**
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Authentication required for sensitive endpoints

#### **4. Payment Security**
- [ ] Stripe webhooks properly configured
- [ ] Payment data never stored locally
- [ ] PCI compliance maintained
- [ ] Fraud detection enabled

---

## 📊 **Monitoring & Analytics**

#### **1. Error Tracking**
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.ts
const { withSentry } = require('@sentry/nextjs');
```

#### **2. Performance Monitoring**
- Vercel Analytics (if using Vercel)
- Google Analytics
- Web Vitals monitoring

#### **3. Database Monitoring**
- Supabase dashboard monitoring
- Query performance tracking
- Connection monitoring

---

## 🚀 **Deployment Steps**

### **Step 1: Prepare Code**
```bash
# Final build test
npm run build

# Run tests
npm test

# Check for TypeScript errors
npx tsc --noEmit
```

### **Step 2: Set Up Production Environment**
1. Create production Supabase project
2. Set up production Stripe account
3. Configure domain and DNS
4. Set up SSL certificates

### **Step 3: Deploy Application**
```bash
# Deploy to Vercel
vercel --prod

# Or deploy to your chosen platform
```

### **Step 4: Configure Production Services**
1. Set up Stripe webhooks
2. Configure email templates
3. Set up monitoring
4. Test all functionality

### **Step 5: Go Live**
1. Update DNS to point to production
2. Test all user flows
3. Monitor for errors
4. Announce launch!

---

## 🔄 **Post-Deployment Tasks**

#### **1. Immediate (First 24 hours)**
- [ ] Monitor error logs
- [ ] Test payment processing
- [ ] Verify email delivery
- [ ] Check user registration flow

#### **2. First Week**
- [ ] Monitor performance metrics
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Optimize based on usage

#### **3. Ongoing**
- [ ] Regular security updates
- [ ] Performance monitoring
- [ ] Backup verification
- [ ] Feature updates

---

## 💰 **Cost Estimation**

### **Monthly Costs (Estimated)**
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Stripe**: 2.9% + 30¢ per transaction
- **Resend**: $20/month
- **Domain**: $12/year
- **Total**: ~$65/month + transaction fees

### **Scaling Costs**
- As you grow, costs will scale with usage
- Stripe fees are per-transaction
- Supabase scales with database usage
- Vercel scales with bandwidth

---

## 🎯 **Launch Checklist**

### **Pre-Launch**
- [ ] All features tested
- [ ] Payment processing verified
- [ ] Email delivery working
- [ ] Mobile responsiveness checked
- [ ] Performance optimized
- [ ] Security measures in place

### **Launch Day**
- [ ] Deploy to production
- [ ] Update DNS
- [ ] Test all functionality
- [ ] Monitor error logs
- [ ] Announce to users

### **Post-Launch**
- [ ] Monitor for 24 hours
- [ ] Gather user feedback
- [ ] Fix any critical issues
- [ ] Plan next features

---

## 🆘 **Troubleshooting Common Issues**

#### **1. Build Failures**
- Check TypeScript errors
- Verify all dependencies
- Check environment variables

#### **2. Database Issues**
- Verify connection strings
- Check RLS policies
- Monitor connection limits

#### **3. Payment Issues**
- Verify Stripe keys
- Check webhook configuration
- Test with real cards

#### **4. Email Issues**
- Verify Resend configuration
- Check domain verification
- Test email templates

---

## 📞 **Support Resources**

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Ready to launch your dance costume marketplace! 🎭✨**
