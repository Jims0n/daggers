import { Search as SearchIcon } from "lucide-react";

const Search = async () => {
    return (
        <form action="/search" method="GET" className="w-full">
            <div className="relative">
                <input
                    name="q"
                    type="text"
                    placeholder="Search products..."
                    className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <input type="hidden" name="category" value="all" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon size={16} className="text-gray-400" />
                </div>
            </div>
        </form>
    );
}
 
export default Search;