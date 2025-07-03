import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a sample seller user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const sellerUser = await prisma.user.create({
    data: {
      username: 'seller1',
      email: 'seller@example.com',
      password: hashedPassword,
      fullName: 'John Seller',
      role: 'seller',
    },
  })

  // Create seller profile
  const seller = await prisma.seller.create({
    data: {
      userId: sellerUser.id,
      storeName: "John's Fashion Store",
      description: 'High quality fashion items and custom designs',
    },
  })

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        sellerId: seller.id,
        name: 'Custom T-Shirt',
        description: 'High quality custom t-shirt with your design',
        price: 25.99,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      },
      {
        sellerId: seller.id,
        name: 'Designer Jacket',
        description: 'Stylish designer jacket for all seasons',
        price: 89.99,
        imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400',
      },
      {
        sellerId: seller.id,
        name: 'Custom Hoodie',
        description: 'Comfortable hoodie with custom prints',
        price: 45.50,
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      },
      {
        sellerId: seller.id,
        name: 'Designer Jeans',
        description: 'Premium quality designer jeans',
        price: 79.99,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      },
    ],
  })

  // Create a sample regular user
  const regularUser = await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user@example.com',
      password: hashedPassword,
      fullName: 'Jane Customer',
      role: 'user',
    },
  })

  console.log('Sample data created successfully!')
  console.log('Seller user:', sellerUser)
  console.log('Regular user:', regularUser)
  console.log('Products created:', products.count)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
