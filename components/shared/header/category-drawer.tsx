import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { getAllCategories } from "@/lib/actions/product.action";
import { Grid } from "lucide-react";
import Link from "next/link";

const CategoryDrawer = async () => {
    const categories = await getAllCategories();

    return ( 
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Grid size={20} />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="text-left px-4">
                    <DrawerTitle className="text-xl font-bold">Categories</DrawerTitle>
                    <div className="grid grid-cols-2 gap-2 mt-6">
                        <DrawerClose asChild>
                            <Link 
                                href="/products" 
                                className="flex items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                            >
                                <span className="font-medium">All Products</span>
                            </Link>
                        </DrawerClose>
                        
                        {categories.map((category) => (
                            <DrawerClose asChild key={category.category}>
                                <Link 
                                    href={`/products?category=${category.category}`}
                                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                                >
                                    <span className="font-medium">{category.category}</span>
                                    <span className="text-xs text-gray-500 mt-1">{category._count} items</span>
                                </Link>
                            </DrawerClose>
                        ))}
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    );
}
 
export default CategoryDrawer;