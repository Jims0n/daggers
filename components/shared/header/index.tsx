import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import CategoryDrawer from "./category-drawer";
import Search from "./search";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-white border-b backdrop-blur-sm bg-white/90 dark:bg-black/90 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <CategoryDrawer />
                        <Link href='/' className="flex items-center ml-3">
                            <Image 
                                src='/images/logo.svg' 
                                alt={`${APP_NAME} logo`}
                                height={40}
                                width={40}
                                priority={true}
                                className="h-10 w-10" 
                            />
                            
                        </Link>
                    </div>

                    {/* Search - Hidden on mobile */}
                    <div className="hidden md:block mx-4 flex-1 max-w-md">
                        <Search />
                    </div>

                    {/* Navigation Menu */}
                    <Menu />
                </div>

                {/* Mobile Search - Visible only on mobile */}
                <div className="block md:hidden pb-3">
                    <Search />
                </div>
            </div>
        </header>
    );
}
 
export default Header;