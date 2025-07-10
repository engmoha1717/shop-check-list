// components/HeroSection.jsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white py-24 px-6 sm:px-12 lg:px-24 text-center rounded-3xl shadow-xl border border-gray-200">
      {/* Decorative Circles */}
      <div className="absolute top-[-4rem] left-[-4rem] w-48 h-48 bg-blue-200 rounded-full opacity-30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-3rem] right-[-3rem] w-32 h-32 bg-purple-300 rounded-full opacity-30 blur-2xl pointer-events-none"></div>

      {/* Main Content */}
      <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 max-w-3xl mx-auto font-poppins">
        Simplify Your Shopping, <br className="hidden sm:block" />
        Organize Like a Pro 🛒
      </h1>

      <p className="text-lg sm:text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
        Create, manage, and share your lists effortlessly. Save time, money, and hassle.
      </p>

      <Button
        size="lg"
        className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
        asChild
      >
        <Link href="/lists/new">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First List
        </Link>
      </Button>

      {/* Subtext */}
      <p className="mt-4 text-sm text-gray-500">
        No account needed. It’s free and always will be.
      </p>
    </section>
  );
}
