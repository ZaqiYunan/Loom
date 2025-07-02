"use client";

import { useState } from 'react';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#", label: "Home" },
    { href: "#", label: "Shop" },
    { href: "#", label: "For You" },
    { href: "#", label: "Customize" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="#" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
            <path d="M12 2L1 21h22L12 2zm-1.21 15L12 11.67 13.21 17h-2.42z"/>
          </svg>
          <span className="text-2xl font-bold font-headline text-primary">ACHATS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Input type="search" placeholder="Search products..." className="h-9 w-40 lg:w-64" />
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                    <Link href="#" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary">
                          <path d="M12 2L1 21h22L12 2zm-1.21 15L12 11.67 13.21 17h-2.42z"/>
                        </svg>
                        <span className="text-xl font-bold font-headline text-primary">ACHATS</span>
                    </Link>
                </div>
                <nav className="flex-grow p-4">
                  <ul className="space-y-4">
                    {navLinks.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-lg font-medium text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="p-4 border-t">
                    <Input type="search" placeholder="Search products..." className="w-full" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
