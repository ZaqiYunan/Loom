#!/bin/bash

# Production deployment script for Vercel

echo "🚀 Setting up production environment..."

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed the database (comment out if not needed)
# npx prisma db seed

echo "✅ Production setup complete!"
