import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Link } from "react-router";


export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Link to="https://github.com/JavaProgrammerLB/awesome-blogs"  className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors group">
            <GitHubLogoIcon className="w-12 h-12 text-gray-700 group-hover:text-black transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}