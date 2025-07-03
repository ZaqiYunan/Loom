import { ProductList } from "./_components/product-list";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Loom
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Bridging the Gap Between Talented Designers and Customers
            </p>
            <div className="text-lg md:text-xl mb-8 opacity-80 space-y-4">
              <p>
                We empower creative designers to showcase their unique products and reach more customers than ever before. 
                Our platform provides designers with the tools and visibility they need to grow their business.
              </p>
              <p>
                For customers, we offer a curated marketplace of high-quality, creative products from talented designers 
                around the world. Discover unique items you won't find anywhere else.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <h3 className="font-semibold mb-2">For Designers</h3>
                <p className="text-sm opacity-90">Increase your sales reach and grow your business</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <h3 className="font-semibold mb-2">For Customers</h3>
                <p className="text-sm opacity-90">Discover unique products from talented creators</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-16">
        <ProductList />
      </section>
    </div>
  );
}
