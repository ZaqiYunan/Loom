import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight, Gift, UserCheck, Users } from "lucide-react";
import Image from "next/image";

const products = [
  { id: 1, name: "Premium Linen Shirt", category: "Men's Apparel", price: "$49.99", image: "https://placehold.co/400x400.png", aiHint: "linen shirt" },
  { id: 2, name: "Summer Breeze Dress", category: "Women's Apparel", price: "$89.99", image: "https://placehold.co/400x400.png", aiHint: "summer dress" },
  { id: 3, name: "Handcrafted Leather Bag", category: "Accessories", price: "$120.00", image: "https://placehold.co/400x400.png", aiHint: "leather bag" },
  { id: 4, name: "Athletic Running Shoes", category: "Footwear", price: "$99.99", image: "https://placehold.co/400x400.png", aiHint: "running shoes" },
  { id: 5, name: "Classic Timepiece", category: "Accessories", price: "$299.00", image: "https://placehold.co/400x400.png", aiHint: "classic watch" },
  { id: 6, name: "Modern Fit Blazer", category: "Men's Apparel", price: "$150.00", image: "https://placehold.co/400x400.png", aiHint: "modern blazer" },
  { id: 7, name: "Gemstone Necklace", category: "Jewelry", price: "$210.00", image: "https://placehold.co/400x400.png", aiHint: "gemstone necklace" },
  { id: 8, name: "High-Waisted Jeans", category: "Women's Apparel", price: "$75.00", image: "https://placehold.co/400x400.png", aiHint: "high waisted jeans" },
];

const categories = [
  { name: "Urban Explorer", image: "https://placehold.co/400x500.png", aiHint: "urban fashion" },
  { name: "Modern Minimalist", image: "https://placehold.co/400x500.png", aiHint: "minimalist fashion" },
  { name: "Vintage Enthusiast", image: "https://placehold.co/400x500.png", aiHint: "vintage fashion" },
  { name: "Athleisure All-Day", image: "https://placehold.co/400x500.png", aiHint: "athleisure fashion" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center py-20 lg:py-32 bg-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4 animate-fade-in-down">
              Fashion, Woven For You
            </h1>
            <p className="text-lg md:text-xl text-primary/80 max-w-3xl mx-auto mb-8 animate-fade-in-up">
              Loom discovers your unique style profile to curate a personalized shopping experience you'll love.
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground animate-fade-in"
            >
              Discover Your Style <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <UserCheck className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">
                  Style Profiling
                </h3>
                <p className="text-muted-foreground">
                  Discover fashion that truly represents your unique style profile.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Gift className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">
                  Curated Collections
                </h3>
                <p className="text-muted-foreground">
                  Explore collections and offers tailored to your fashion segment.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">
                  Connect with Creators
                </h3>
                <p className="text-muted-foreground">
                  Collaborate with talented artisans to bring your unique vision to life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personalized Recommendations Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center text-primary mb-2">
              Recommended For You
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              Based on your style profile and recent activity.
            </p>
            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {products.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex left-[-20px]" />
              <CarouselNext className="hidden lg:flex right-[-20px]" />
            </Carousel>
          </div>
        </section>

        {/* Category/Segmentation Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center text-primary mb-10">
              Explore Your Style Segment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="group overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 border-border"
                >
                  <CardContent className="p-0 relative">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={400}
                      height={500}
                      className="object-cover w-full h-80 transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={category.aiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-2xl font-headline font-bold text-white">
                        {category.name}
                      </h3>
                      <Button
                        variant="link"
                        className="text-accent-foreground p-0 h-auto mt-2 hover:text-accent"
                      >
                        View Collection <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Creator CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold mb-4">
              Co-Create with Our Artisans
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-primary-foreground/80">
              Our platform connects you with skilled creators who can bring your unique designs to life. Start a collaboration today.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Meet the Creators <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
