import { Search as SearchIcon } from "lucide-react";

const Search = async () => {
    return (
        <form action="/search" method="GET" className="w-full">
            <div className="relative">
                <input
                    name="q"
                    type="text"
                    placeholder="Search..."
                    className="w-full h-9 pl-9 pr-4 text-sm bg-secondary border-0 focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
                />
                <input type="hidden" name="category" value="all" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon size={14} className="text-muted-foreground" />
                </div>
            </div>
        </form>
    );
}
 
export default Search;