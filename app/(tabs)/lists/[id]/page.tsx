"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,

  Check
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Spinner from "@/components/spinner";
import { Progress } from "@/components/ui/progress";
import {ItemCard} from "@/components/shopping/item-card";
import {AddItemDialog} from "@/components/shopping/add-item-dialog";



interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ListPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user, isLoaded } = useUser();
  const [addItemOpen, setAddItemOpen] = useState(false);
  
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const list = useQuery(
    api.shoppinglists.getListById,
    currentUser ? { 
      listId: resolvedParams.id as Id<"shopping_lists">, 
      userId: currentUser._id 
    } : "skip"
  );

  const completeList = useMutation(api.shoppinglists.completeList);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner   />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">List not found</h1>
          <p className="text-gray-600 mb-4">The shopping list you&aposs;re looking for doesn&aposs;t exist.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const completionPercentage = list.itemCount > 0 
    ? Math.round((list.completedCount / list.itemCount) * 100) 
    : 0;

  const priorityConfig = {
    low: { color: "bg-emerald-100 text-emerald-800", label: "Low" },
    medium: { color: "bg-amber-100 text-amber-800", label: "Medium" },
    high: { color: "bg-red-100 text-red-800", label: "High" },
  };

  const handleCompleteList = async () => {
    try {
      await completeList({
        listId: list._id,
        userId: currentUser._id,
      });
      toast.success("Shopping list completed!");
    } catch (error) {
        console.log(error)
      toast.error("Failed to complete list");
    }
  };

  const pendingItems = list.items.filter(item => !item.isCompleted);
  const completedItems = list.items.filter(item => item.isCompleted);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
            {list.description && (
              <p className="text-gray-600 mt-1">{list.description}</p>
            )}
          </div>
          <Badge className={cn("text-sm", priorityConfig[list.priority].color)}>
            {priorityConfig[list.priority].label}
          </Badge>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Progress
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">{completionPercentage}%</span>
                    <span className="text-sm text-gray-600">
                      {list.completedCount}/{list.itemCount}
                    </span>
                  </div>
                  <Progress
                    value={completionPercentage} 
                    className="h-2"
                    style={{ 
                      '--progress-background': list.color || '#10B981'
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  Items
                </div>
                <div className="text-lg font-semibold">{list.itemCount}</div>
              </div>

              {list.totalPrice > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    Total
                  </div>
                  <div className="text-lg font-semibold">${list.totalPrice.toFixed(2)}</div>
                </div>
              )}

              {list.scheduledDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Scheduled
                  </div>
                  <div className="text-lg font-semibold">
                    {format(new Date(list.scheduledDate), "MMM d")}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setAddItemOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          
          {pendingItems.length === 0 && list.itemCount > 0 && (
            <Button
              onClick={handleCompleteList}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete List
            </Button>
          )}
        </div>

        {/* Items */}
        <div className="space-y-6">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                To Buy ({pendingItems.length})
              </h2>
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    userId={currentUser._id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed ({completedItems.length})
              </h2>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <ItemCard
                    key={item._id} 
                    item={item} 
                    userId={currentUser._id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {list.itemCount === 0 && (
            <Card className="border-dashed border-2 border-gray-300 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No items yet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Start adding items to your shopping list.
                </p>
                <Button
                  onClick={() => setAddItemOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <AddItemDialog
          open={addItemOpen}
          onOpenChange={setAddItemOpen}
          listId={list._id}
          userId={currentUser._id}
        />
      </div>
    </div>
  );
}