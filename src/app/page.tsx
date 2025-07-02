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
import { ArrowRight, Gift, Zap, Palette } from "lucide-react";
import Image from "next/image";

const products = [
  { id: 1, name: "Kemeja Linen Premium", category: "Pakaian Pria", price: "Rp 750.000", image: "https://placehold.co/400x400.png", aiHint: "linen shirt" },
  { id: 2, name: "Gaun Musim Panas", category: "Pakaian Wanita", price: "Rp 1.250.000", image: "https://placehold.co/400x400.png", aiHint: "summer dress" },
  { id: 3, name: "Headphone Nirkabel", category: "Elektronik", price: "Rp 2.100.000", image: "https://placehold.co/400x400.png", aiHint: "wireless headphones" },
  { id: 4, name: "Tas Kulit Buatan Tangan", category: "Aksesoris", price: "Rp 1.800.000", image: "https://placehold.co/400x400.png", aiHint: "leather bag" },
  { id: 5, name: "Sepatu Lari Atletik", category: "Sepatu", price: "Rp 1.500.000", image: "https://placehold.co/400x400.png", aiHint: "running shoes" },
  { id: 6, name: "Jam Tangan Klasik", category: "Aksesoris", price: "Rp 4.500.000", image: "https://placehold.co/400x400.png", aiHint: "classic watch" },
  { id: 7, name: "Blazer Modern", category: "Pakaian Pria", price: "Rp 1.950.000", image: "https://placehold.co/400x400.png", aiHint: "modern blazer" },
  { id: 8, name: "Kalung Permata", category: "Perhiasan", price: "Rp 3.200.000", image: "https://placehold.co/400x400.png", aiHint: "gemstone necklace" },
];

const categories = [
  { name: "Gaya Pria", image: "https://placehold.co/400x500.png", aiHint: "mens fashion" },
  { name: "Gaya Wanita", image: "https://placehold.co/400x500.png", aiHint: "womens fashion" },
  { name: "Aksesoris", image: "https://placehold.co/400x500.png", aiHint: "fashion accessories" },
  { name: "Elektronik", image: "https://placehold.co/400x500.png", aiHint: "consumer electronics" },
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
              Belanja Disesuaikan, Hanya Untuk Anda
            </h1>
            <p className="text-lg md:text-xl text-primary/80 max-w-3xl mx-auto mb-8 animate-fade-in-up">
              ACHATS: Platform e-commerce dengan personalisasi dan efisiensi
              untuk pengalaman belanja yang tak terlupakan.
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground animate-fade-in"
            >
              Mulai Belanja <ArrowRight className="ml-2 h-5 w-5" />
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
                    <Gift className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">
                  Rekomendasi Cerdas
                </h3>
                <p className="text-muted-foreground">
                  Produk pilihan yang sesuai dengan selera dan preferensi Anda.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Zap className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">
                  Pengalaman Terpersonalisasi
                </h3>
                <p className="text-muted-foreground">
                  Tampilan konten dan penawaran yang disesuaikan untuk Anda.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Palette className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-headline font-semibold text-primary mb-2">
                  Kustomisasi Produk
                </h3>
                <p className="text-muted-foreground">
                  Ubah produk sesuai keinginan dengan opsi kustomisasi yang
                  fleksibel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personalized Recommendations Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center text-primary mb-2">
              Rekomendasi Untuk Anda
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              Berdasarkan aktivitas dan minat Anda baru-baru ini.
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
              Jelajahi Berdasarkan Kategori
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
                        Lihat Koleksi <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Product Customization CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold mb-4">
              Buat Sesuatu yang Unik Milik Anda
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-primary-foreground/80">
              Gunakan alat kustomisasi kami untuk menyesuaikan produk agar
              sesuai dengan gaya dan kebutuhan Anda.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Mulai Kustomisasi <Palette className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
