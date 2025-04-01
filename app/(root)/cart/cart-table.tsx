'use client';
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { ArrowRight, Loader, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Cart } from "@/types";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const CartTable = ({ cart }: { cart?: Cart}) => {
    const router = useRouter();
    const {toast} = useToast();
    const [isPending, startTransition] = useTransition();

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-6 bg-gray-100 rounded-full mb-6">
                    <ShoppingBag size={32} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Looks like you haven&apos;t added any items to your cart yet.
                </p>
                <Link href='/'>
                    <Button className="bg-black hover:bg-gray-800 text-white px-8 py-6 rounded-none">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return ( 
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="overflow-hidden border-0 shadow-md">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="px-6 py-4 font-medium">Product</TableHead>
                                        <TableHead className="px-6 py-4 font-medium text-center">Quantity</TableHead>
                                        <TableHead className="px-6 py-4 font-medium text-right">Price</TableHead>
                                    </TableRow>    
                                </TableHeader>
                                <TableBody>
                                    {cart.items.map((item) => (
                                        <TableRow key={item.slug} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="px-6 py-4">
                                                <Link href={`/product/${item.slug}`} className="flex items-center group">
                                                    <div className="relative w-16 h-16 overflow-hidden rounded border border-gray-200 mr-4">
                                                        <Image 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            fill
                                                            sizes="64px"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <span className="font-medium group-hover:text-black/70 transition-colors">{item.name}</span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Button 
                                                        disabled={isPending} 
                                                        variant='outline' 
                                                        size="icon"
                                                        className="rounded-full h-8 w-8 border border-gray-300"
                                                        onClick={() => startTransition(async () => {
                                                            const res = await removeItemFromCart(item.productId);
                                                            if (!res.success) {
                                                                toast({
                                                                    variant: 'destructive',
                                                                    description: res.message,
                                                                })
                                                            }
                                                        })}
                                                    >
                                                        {isPending ? (
                                                            <Loader className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Minus className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                    <span className="font-medium text-lg min-w-[20px]">{item.qty}</span>
                                                    <Button 
                                                        disabled={isPending} 
                                                        variant='outline' 
                                                        size="icon"
                                                        className="rounded-full h-8 w-8 border border-gray-300"
                                                        onClick={() => startTransition(async () => {
                                                            const res = await addItemToCart(item);
                                                            if (!res.success) {
                                                                toast({
                                                                    variant: 'destructive',
                                                                    description: res.message,
                                                                })
                                                            }
                                                        })}
                                                    >
                                                        {isPending ? (
                                                            <Loader className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Plus className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right font-medium">
                                                {formatCurrency(Number(item.price))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div>
                <Card className="sticky top-8 border-0 shadow-md overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 bg-black text-white">
                            <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
                            <p className="text-gray-300 text-sm">Review your order before checkout</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)} items)</span>
                                <span className="font-medium">{formatCurrency(cart.itemsPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Shipping</span>
                                <span className="font-medium">{formatCurrency(cart.shippingPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-4 border-t">
                                <span>Total</span>
                                <span>{formatCurrency(cart.totalPrice)}</span>
                            </div>
                            
                            <Button 
                                className="w-full mt-6 bg-black hover:bg-gray-800 text-white py-6 rounded-none"
                                disabled={isPending} 
                                onClick={() => startTransition(() => router.push("/shipping-address"))}
                            >
                                {isPending ? (
                                    <span className="flex items-center">
                                        <Loader className="w-4 h-4 animate-spin mr-2"/>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        Proceed to Checkout
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </span>
                                )}
                            </Button>
                            
                            <p className="text-xs text-gray-500 text-center mt-4">
                                By proceeding, you agree to our terms and conditions
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
 
export default CartTable;