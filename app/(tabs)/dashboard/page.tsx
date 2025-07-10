"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import LoadingSpinner  from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ShoppingCart, 
  Calendar, 

  Clock,


  Package
} from "lucide-react";
import { CreateListDialog } from "@/components/shopping/create-list-dialog";


import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ListCard } from "@/components/shopping/list-card";


export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [createListOpen, setCreateListOpen] = useState(false); 
  const [showWelcome, setShowWelcome] = useState(false);
  
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  
  const userLists = useQuery(
    api.shoppinglists.getUserLists,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const userStats = useQuery(
    api.users.getUserStats,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const initializeCategories = useMutation(api.categories.initializeSystemCategories);

  useEffect(() => {
    // Initialize system categories on first load
    initializeCategories();
  }, [initializeCategories]);

  // 🎯 KEY ONBOARDING LOGIC: Check if user has no lists
  // Check if this is a new user (no lists) and show welcome flow
  useEffect(() => {
    if (userLists !== undefined && userLists.length === 0 && currentUser) {
      // If user has no shopping lists, show welcome flow
      setShowWelcome(true);
    }
  }, [userLists, currentUser]);
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 🎯 SHOW WELCOME FLOW for new users
  // Show welcome flow for new users
  if (showWelcome) {
    return (
      <WelcomeFlow 
        userId={currentUser._id} 
        onComplete={() => setShowWelcome(false)} 
      />
    );
  }
  const todayLists = userLists?.filter(list => {
  // Regular dashboard for existing users
    if (!list.scheduledDate) return false;
    const today = new Date();
    const listDate = new Date(list.scheduledDate);
    return listDate.toDateString() === today.toDateString();
  }) || [];

  const upcomingLists = userLists?.filter(list => {
    if (!list.scheduledDate) return false;
    const today = new Date();
    const listDate = new Date(list.scheduledDate);
    return listDate > today && listDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }) || [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-gray-600">
              {userLists && userLists.length > 0 
                ? "Manage your shopping lists and never forget an item again."
                : "Ready to create your first shopping list?"
              }
            </p>
          </div>
          <Button
            onClick={() => setCreateListOpen(true)}
            className="mt-4 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create List
          </Button>
        </div>

        {/* Stats Cards */}
        {userStats && <StatsCards stats={userStats} />}

        {/* Today's Lists */}
        {todayLists.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-emerald-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Shopping</h2>
              <Badge variant="secondary" className="ml-2">
                {todayLists.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayLists.map((list) => (
                <ListCard key={list._id} list={list} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Lists */}
        {upcomingLists.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">This Week</h2>
              <Badge variant="secondary" className="ml-2">
                {upcomingLists.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingLists.map((list) => (
                <ListCard key={list._id} list={list} />
              ))}
            </div>
          </div>
        )}

        {/* All Lists */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">All Lists</h2>
              <Badge variant="secondary" className="ml-2">
                {userLists?.length || 0}
              </Badge>
            </div>
          </div>

          {userLists && userLists.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userLists.map((list) => (
                <ListCard key={list._id} list={list} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No shopping lists yet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first shopping list to get started organizing your trips to the market.
                </p>
                <Button
                  onClick={() => setCreateListOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First List
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <CreateListDialog
          open={createListOpen}
          onOpenChange={setCreateListOpen}
          userId={currentUser._id}
        />
      </div>
    </div>
  );
}