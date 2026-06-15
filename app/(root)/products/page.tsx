import { Metadata } from "next";
import { getAllProducts, getAllCategories } from "@/lib/actions/product.action";
import ProductList from "@/components/shared/product/product-list";
import { Filter, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Shop All Products | Daggers",
  description: "Browse our collection of premium streetwear and fashion items at Daggers",
};

interface SearchParams {
  query?: string;
  category?: string;
  page?: string;
  price?: string;
  rating?: string;
  sort?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { 
    query = "all", 
    category = "all", 
    page: pageStr = "1", 
    price = "all", 
    rating = "all", 
    sort = "newest" 
  } = await searchParams;
  
  const page = Number(pageStr);
  
  const productData = await getAllProducts({
    query,
    category,
    page,
    price,
    rating,
    sort,
  });
  
  const categories = await getAllCategories();
  
  const isMobileFilterOpen = false;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gray-900 px-6 py-20 text-center sm:px-16 sm:py-24">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Shop Our Collection
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              Discover the perfect blend of style and comfort with our premium streetwear collection
            </p>
          </div>
          <div className="absolute inset-0 bg-[url('/images/brand/pattern.svg')] opacity-50"></div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="text-sm text-gray-500">
              {productData.data.length} result{productData.data.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 sm:hidden"
            >
              <Filter size={16} />
              <span>Filter</span>
            </Button>
            <div className="relative hidden sm:inline-block">
              <select 
                className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm focus:border-black focus:outline-none cursor-pointer"
                defaultValue="featured"
              >
                <option value="newest">Newest</option>
                <option value="lowest">Price: Low to High</option>
                <option value="highest">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <Sliders size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Mobile Filters (Hidden by Default) */}
        <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} sm:hidden border-t border-b py-4`}>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Categories</h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <a href="#" className="text-gray-500 hover:text-black">All Products</a>
                </li>
                {categories.map((category) => (
                  <li key={category.category}>
                    <a href="#" className="text-gray-500 hover:text-black">
                      {category.category} ({category._count})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium">Price Range</h3>
              <ul className="mt-2 space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-black">All Prices</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">Under ₦10,000</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">₦10,000 - ₦50,000</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">₦50,000 - ₦100,000</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">Over ₦100,000</a></li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium">Rating</h3>
              <ul className="mt-2 space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-black">All Ratings</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">4 Stars & Up</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">3 Stars & Up</a></li>
                <li><a href="#" className="text-gray-500 hover:text-black">2 Stars & Up</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Products Grid with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="text-sm font-medium">Categories</h3>
                <ul className="mt-2 space-y-2">
                  <li>
                    <a 
                      href="/products"
                      className={`text-sm ${category === 'all' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      All Products
                    </a>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.category}>
                      <a 
                        href={`/products?category=${cat.category}`}
                        className={`text-sm ${category === cat.category ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                      >
                        {cat.category} ({cat._count})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium">Price Range</h3>
                <ul className="mt-2 space-y-2">
                  <li>
                    <a 
                      href="/products"
                      className={`text-sm ${price === 'all' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      All Prices
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?price=0-10000"
                      className={`text-sm ${price === '0-10000' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      Under ₦10,000
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?price=10000-50000"
                      className={`text-sm ${price === '10000-50000' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      ₦10,000 - ₦50,000
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?price=50000-100000"
                      className={`text-sm ${price === '50000-100000' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      ₦50,000 - ₦100,000
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?price=100000-1000000"
                      className={`text-sm ${price === '100000-1000000' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      Over ₦100,000
                    </a>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium">Rating</h3>
                <ul className="mt-2 space-y-2">
                  <li>
                    <a 
                      href="/products"
                      className={`text-sm ${rating === 'all' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      All Ratings
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?rating=4"
                      className={`text-sm ${rating === '4' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      4 Stars & Up
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?rating=3"
                      className={`text-sm ${rating === '3' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      3 Stars & Up
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/products?rating=2"
                      className={`text-sm ${rating === '2' ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                      2 Stars & Up
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="md:col-span-3">
            <ProductList 
              data={productData.data} 
            />
            
            {/* Pagination */}
            {productData.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: productData.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <a
                      key={pageNum}
                      href={`/products?page=${pageNum}&query=${query}&category=${category}&price=${price}&rating=${rating}&sort=${sort}`}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${
                        pageNum === page
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 