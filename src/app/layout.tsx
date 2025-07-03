import { type PropsWithChildren } from "react";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
// import { Providers } from "./providers";
import { Providers } from "~/app/providers";
import { Navigation } from "./_components/navigation";
import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export { metadata } from "./metadata";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <title>Loom - Creative Marketplace</title>
        <meta name="description" content="Discover the best creative services for your needs" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <Providers>
          <TRPCReactProvider>
            <Navigation />
            <main>
              {children}
            </main>
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
