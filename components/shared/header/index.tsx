import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import Search from "./search";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href='/' className="flex items-center">
                        <Image 
                            src='/images/logo.svg' 
                            alt={`${APP_NAME} logo`}
                            height={40}
                            width={40}
                            priority={true}
                        />
                    </Link>

                    {/* Search - desktop */}
                    <div className="hidden md:block flex-1 max-w-sm mx-8">
                        <Search />
                    </div>

                    {/* Navigation */}
                    <Menu />
                </div>

                {/* Search - mobile */}
                <div className="block md:hidden pb-3">
                    <Search />
                </div>
            </div>
        </header>
    );
}
 
export default Header;