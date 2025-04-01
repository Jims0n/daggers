import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { Instagram } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return ( 
        <footer className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Brand & Copyright */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold">{APP_NAME}</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Premium Nigerian streetwear.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Shop
                        </Link>
                        <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Contact
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                            Privacy
                        </Link>
                    </div>

                    {/* Social & Copyright */}
                    <div className="flex flex-col items-start md:items-end">
                        <Link 
                            href="https://instagram.com/daggersxx_" 
                            className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            <Instagram size={16} className="mr-2" />
                            @daggersxx_
                        </Link>
                        <p className="text-gray-500 text-xs mt-2">
                            © {currentYear} {APP_NAME}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
 
export default Footer;