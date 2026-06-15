import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return ( 
        <footer className="border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Top row: logo, links, social */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <Link href="/">
                        <Image 
                            src='/images/logo.svg'
                            alt={APP_NAME}
                            height={32}
                            width={32}
                        />
                    </Link>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        <Link href="/search" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
                        <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
                        <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                        <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                    </div>

                    <Link 
                        href="https://instagram.com/daggersxx_" 
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Instagram size={18} />
                    </Link>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t border-border/40 text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {currentYear} {APP_NAME}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
 
export default Footer;