import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { Menu as MenuIcon, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UserButton from "./user-button";

const Menu = () => {
    return ( 
        <div className="flex items-center space-x-1">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
                <Link 
                    href="/products" 
                    className="text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    Shop
                </Link>
                <Link
                    href="/cart"
                    className="relative px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ShoppingCart size={18} className="inline-block mr-1" />
                    <span>Cart</span>
                    {/* Optional: Add cart count badge */}
                    {/*<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center">
                        0
                    </span>*/}
                </Link>
                <UserButton />
                <ModeToggle />
            </nav>
            
            {/* Mobile Menu */}
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MenuIcon size={20} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetTitle className="text-left mb-6">Menu</SheetTitle>
                        <div className="flex flex-col space-y-4">
                            <Link 
                                href="/products" 
                                className="text-base font-medium px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                Shop
                            </Link>
                            <Link 
                                href="/cart" 
                                className="text-base font-medium px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex items-center"
                            >
                                <ShoppingCart size={18} className="mr-2" />
                                Cart
                            </Link>
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Account</span>
                                    <UserButton />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                                    <ModeToggle />
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
     );
}
 
export default Menu;