import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Palette } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  aiHint?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover w-full aspect-square"
            data-ai-hint={product.aiHint}
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h3 className="font-semibold text-lg text-primary truncate mt-1">{product.name}</h3>
          <p className="font-bold text-accent text-xl mt-2">{product.price}</p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Keranjang
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Palette className="mr-2 h-4 w-4" />
              Kustom
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
