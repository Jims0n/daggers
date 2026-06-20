'use client';

import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { useTransition } from "react";


const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem}) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = async () => {
        startTransition(async () => {
            const res = await addItemToCart(item);

            if (!res.success) { 
                toast({
                    variant: 'destructive',
                    description: res.message,
                });
                return;
            }
    
            // Handle success add to cart
            toast({
                description: res.message,
                action: (
                    <ToastAction className="bg-primary text-white hover:bg-gray-800" altText="Go to Cart"
                    onClick={() => router.push('/cart') }>
                        Go to Cart
                    </ToastAction>
                )
            })
        })

    }

    const handleRemoveFromcart = async () => {
        startTransition(async () => {
            const res = await removeItemFromCart(item.productId, item.color);

            toast({
                variant: res.success ? 'default' : 'destructive',
                description: res.message
            });

            return;
        });

    }

    // Check if item is in cart
    const existItem = cart && cart.items.find((x) => x.productId === item.productId && x.color === item.color);

    return existItem ? (
        <div>
            <Button type="button" variant="outline" disabled={isPending} onClick={handleRemoveFromcart}>
            {isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (
                <Minus className="h-4 w-4" />
            )}  
            </Button>
            <span className="px-2">{existItem.qty}</span>
            <Button type="button" variant='outline' disabled={isPending} onClick={handleAddToCart}>
            {isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (
                <Plus className="h-4 w-4" />
            )} 
            </Button>
        </div>
    )  : (
        <Button className="w-full type='button" disabled={isPending} onClick={handleAddToCart}>
      {isPending ? (<Loader className="w-4 h-4 animate-spin" />
      ) : (
         <Plus className="h-4 w-4" />
         )}  
            Add To Cart
    </Button>
    );
}
 
export default AddToCart;