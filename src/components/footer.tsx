import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Send, Twitter, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary/5 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-1 lg:col-span-1">
            <h3 className="text-lg font-semibold text-primary mb-4">STYLESYNC</h3>
            <p className="text-muted-foreground text-sm">Your personalized shopping experience.</p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-primary mb-4">Account</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">My Profile</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Orders</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Wishlist</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Compare Products</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-primary mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Get the latest updates and special offers.</p>
            <form className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Your Email" />
              <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StyleSync. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
