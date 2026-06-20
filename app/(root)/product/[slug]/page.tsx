import ProductGalleryWithColors from "@/components/shared/product/product-gallery-with-colors";
import ProductPrice from "@/components/shared/product/product-price";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/actions/product.action";
import { notFound } from "next/navigation";
import { getMyCart } from "@/lib/actions/cart.action";
import ReviewList from "./review-list";
import { auth } from "@/auth";
import Rating from "@/components/shared/product/rating";
import { ShieldCheck, Truck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export async function generateMetadata(props: {
  params: Promise<{ 
    slug: string 
  }>
}) {
  const { slug } = await props.params;
  
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Product Not Found | Daggers",
      description: "The product you're looking for could not be found.",
    };
  }
  
  return {
    title: `${product.name} | Daggers`,
    description: product.description || "Shop premium streetwear from Daggers",
  };
}

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await getMyCart();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
        <ProductGalleryWithColors
          images={product.images}
          cart={cart}
          item={{
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            qty: 1,
            image: product.images![0]
          }}
          colors={product.colors}
          footer={
            <div className="mb-8 space-y-4 rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium">Free shipping</p>
                  <p className="text-sm text-gray-500">For orders over ₦200,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium">Quality guarantee</p>
                  <p className="text-sm text-gray-500">30-day satisfaction guarantee</p>
                </div>
              </div>
            </div>
          }
        >
          {/* Category and Product Name */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wider">{product.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

            {/* Rating and Review Count */}
            <div className="mt-3 flex items-center">
              <Rating value={Number(product.rating)} />
              <a href="#reviews" className="ml-3 text-sm text-gray-500 hover:text-black">
                {product.numReviews} reviews
              </a>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="mb-8">
            <div className="flex items-center">
              <ProductPrice
                value={Number(product.price)}
                className="text-2xl font-bold"
              />

              {product.stock > 0 ? (
                <Badge variant="outline" className="ml-4 border-green-600 text-green-700">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-4">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>

          {/* Description Short */}
          <div className="mb-8 prose prose-sm">
            <p className="text-gray-700">{product.description}</p>
          </div>
        </ProductGalleryWithColors>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-8">
            <div className="prose max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1">{product.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Material</dt>
                <dd className="mt-1">Premium Cotton</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Stock</dt>
                <dd className="mt-1">{product.stock} units</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Product ID</dt>
                <dd className="mt-1">{product.id}</dd>
              </div>
            </dl>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-8" id="reviews">
            <ReviewList 
              userId={userId || ''}
              productId={product.id}
              productSlug={product.slug}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
 
export default ProductDetailsPage; 