"use client";
import {
  Home,
  List,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  X,
  UserPlus,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";



const publicNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Items", href: "/items", icon: Package },
];

const privateNavigation = [{ name: "My Lists", href: "/lists", icon: List }];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // const currentUserData = useQuery(api.users.getCurrentUser, { clerkId: user?.id });
  const currentUserData = useQuery(api.users.getCurrentUser, 
    user?.id ? { clerkId: user.id } : "skip"
   );

   console.log(currentUserData?.role)

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 glass  z-50 border-b backdrop-blur-m">
      <div className="mx-auto max-w-7xl section-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-scale">
            <div className="gradient-primary p-2 rounded-xl shadow-medium">
              <ShoppingCart className="h-6 w-6 text-blue-800" />
            </div>
            <span className="font-poppins font-bold text-xl bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">
              ListItem
            </span>
          </Link>

          {/* Desktop Navigation - Always show public links, private links only when signed in */}
          <div className="hidden md:flex items-center space-x-1">
            {publicNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300
                      ${isActive(item.href) ? "bg-blue-600 text-white" : "text-gray-600"}`}
                  href={item.href}
                  key={item.name}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {isSignedIn &&
              privateNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300
                     ${isActive(item.href) ? "bg-blue-600 text-white" : "text-gray-600"}`}
                    href={item.href}
                    key={item.name}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </div>

          {/* Right side - User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4 ">
            {isSignedIn ? (
              // User Menu for signed in users
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="destructive"
                    className="relative h-10 w-10  rounded-full hover-scale"
                  >
                    <Avatar className="h-10 w-10 shadow-medium">
                      <AvatarImage src={user?.imageUrl} alt="User" />
                      <AvatarFallback className=" font-semibold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {currentUserData?.role === "admin" && (
                    <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                 )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Sign In/Sign Up buttons for guests
              <div className="hidden md:flex items-center space-x-2">

                <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Sign In</DialogTitle>
                      <DialogDescription>
                        Sign in to your account to access your lists
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <SignInButton mode="modal">
                        <Button className="w-full">
                          Continue with Sign In
                        </Button>
                      </SignInButton>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Sign Up</DialogTitle>
                      <DialogDescription>
                        Create a new account to get started
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <SignUpButton mode="modal">
                        <Button className="w-full">
                          Continue with Sign Up
                        </Button>
                      </SignUpButton>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {/* Always show public navigation */}
              {publicNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300
                                        ${isActive(item.href) ? "bg-blue-600 text-white" : "text-gray-600"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Show private navigation only when signed in */}
              {isSignedIn &&
                privateNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300
                                        ${isActive(item.href) ? "bg-blue-600 text-white" : "text-gray-600"}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

              {isSignedIn ? (
                // Additional menu items for signed in users
                <div className="pt-2 border-t">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 text-red-600 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              ) : (
                // Auth buttons for guests
                <div className="pt-2 border-t">
                  <SignInButton mode="modal">
                    <button
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300 text-gray-600 w-full text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors duration-300 text-blue-600 w-full text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
