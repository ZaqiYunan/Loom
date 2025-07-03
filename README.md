# Create T3 App

# Loom - Designer Marketplace

A modern e-commerce platform connecting talented designers with customers, built with Next.js 14, tRPC, and Prisma.

## 🚀 Features

- **Product Marketplace**: Browse and purchase unique designer products
- **User Authentication**: Secure login/register with NextAuth.js
- **Shopping Cart**: Full cart functionality with quantity management
- **Order Management**: Track orders and purchase history
- **Seller Dashboard**: Product management for designers/sellers
- **Payment Integration**: Midtrans payment gateway
- **Responsive Design**: Mobile-first responsive interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: NextAuth.js
- **Payment**: Midtrans
- **Deployment**: Vercel

## 🚀 Deployment to Vercel

### Method 1: Via Vercel Website (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/loom.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `AUTH_SECRET`: Generate with `npx auth secret`
     - `MIDTRANS_SERVER_KEY`: Your Midtrans server key
     - `MIDTRANS_CLIENT_KEY`: Your Midtrans client key

3. **Set up Database**: Use services like:
   - [Supabase](https://supabase.com) (Free PostgreSQL)
   - [PlanetScale](https://planetscale.com) (MySQL)
   - [Railway](https://railway.app) (PostgreSQL)

### Method 2: Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 📦 Local Development

1. Clone and install:
```bash
git clone https://github.com/yourusername/loom.git
cd loom
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Set up database:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

4. Start development:
```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
