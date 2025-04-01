import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.action";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
    title: `Shopping Cart | ${APP_NAME}`,
    description: 'View and manage items in your Daggers shopping cart'
}

const CartPage = async () => {
    const cart = await getMyCart();
    
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">Review and manage your selected items</p>
                </div>
                <CartTable cart={cart} />      
            </div>
        </section>
    );
}
 
export default CartPage;