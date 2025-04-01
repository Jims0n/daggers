import { ShieldCheck, Truck, Repeat, CreditCard } from "lucide-react";

const IconBoxes = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Free Shipping */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 mb-4">
              <Truck className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-lg font-medium">Free Shipping</h3>
            <p className="mt-2 text-sm text-gray-600">On orders over ₦100,000</p>
          </div>
          
          {/* Secure Payment */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 mb-4">
              <CreditCard className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-lg font-medium">Secure Payment</h3>
            <p className="mt-2 text-sm text-gray-600">100% secure transactions</p>
          </div>
          
          {/* Quality Guarantee */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 mb-4">
              <ShieldCheck className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-lg font-medium">Quality Guarantee</h3>
            <p className="mt-2 text-sm text-gray-600">30-day satisfaction guarantee</p>
          </div>
          
          {/* Easy Returns */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 mb-4">
              <Repeat className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-lg font-medium">Easy Returns</h3>
            <p className="mt-2 text-sm text-gray-600">14-day hassle-free returns</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IconBoxes;