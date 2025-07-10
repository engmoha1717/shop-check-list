import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Brand & Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SmartCart</h2>
            <p className="mt-2 text-sm text-gray-600">
              Simplify your shopping. Track budgets, lists, and favorites all in one place.
            </p>
          </div>

          {/* Middle: Navigation */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><Link href="/lists" className="hover:text-primary">My Lists</Link></li>
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Right: Social & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Stay Connected</h3>
            <div className="flex items-center space-x-4 mt-3">
              <Link href="https://github.com" target="_blank" className="text-gray-600 hover:text-black">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="text-gray-600 hover:text-sky-500">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="mailto:support@smartcart.com" className="text-gray-600 hover:text-rose-500">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-10 border-t pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} SmartCart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
