"use client"
import React, { useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Package, 

  TrendingUp, 
  Star,
  ShoppingCart,
  Calendar,
  BarChart3,
  Filter,
  ListChecks,
  Activity
} from "lucide-react";
// Using built-in date formatting instead of date-fns
import { toast } from "sonner";
import { ItemTemplate } from '@/lib/types';
import { Id } from '@/convex/_generated/dataModel';

export default function ItemDashboard() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  // const [selectedList, setSelectedList] = useState("");
  const [selectedList, setSelectedList] = useState<Id<"shopping_lists"> | "">("");

  // Queries
  const currentUser = useQuery(api.users.getCurrentUser, user ? { clerkId: user.id } : "skip");
  const itemTemplates = useQuery(api.listitems.getItemTemplates, 
    currentUser ? { userId: currentUser._id, search: searchQuery } : "skip"
  );
  const userLists = useQuery(api.shoppinglists.getUserLists, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  // const categories = useQuery(api.categories.getCategories);
  const categories = useQuery(
    api.categories.getCategories,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  const recentActivity = useQuery(api.activities.getRecentActivity,
    currentUser ? { userId: currentUser._id, limit: 10 } : "skip"
  );

  // Mutations
  const addItemToList = useMutation(api.listitems.addItem);

  // Loading state
  if (!currentUser || !itemTemplates || !userLists || !categories) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const totalTemplates = itemTemplates.length;
  const totalLists = userLists.length;
  const activeLists = userLists.filter(list => !list.isCompleted).length;
  const completedLists = userLists.filter(list => list.isCompleted).length;

  // Get most used templates
  const topTemplates = itemTemplates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 8);

  // Quick add item to selected list
  const handleQuickAdd = async (template : ItemTemplate) => {
    if (!selectedList) {
      toast.error("Please select a list first");
      return;
    }

    try {
      await addItemToList({
        listId: selectedList as Id<"shopping_lists">,
        userId: currentUser._id,
        name: template.name,
        quantity: template.defaultQuantity || 1,
        unit: template.defaultUnit,
        priority: "medium",
        categoryId: template.categoryId,
      });
      toast.success(`Added ${template.name} to list`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to add item");
    }
  };

  // Filter templates
  const filteredTemplates = itemTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Item Dashboard</h1>
          <p className="text-muted-foreground">Manage your shopping items and templates</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Select value={selectedList} 
          // onValueChange={setSelectedList}
          onValueChange={(value) => setSelectedList(value as Id<"shopping_lists">)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select list for quick add" />
            </SelectTrigger>
            <SelectContent>
              {userLists.filter(list => !list.isCompleted).map(list => (
                <SelectItem key={list._id} value={list._id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Templates</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Saved for quick access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lists</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeLists}</div>
            <p className="text-xs text-muted-foreground">Currently shopping</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Lists</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedLists}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLists}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Item Templates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Templates
              </CardTitle>
              <CardDescription>
                Your frequently used items - click to add to selected list
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredTemplates.map(template => {
                  const category = categories.find(c => c._id === template.categoryId);
                  return (
                    <Card key={template._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {category && (
                                <Badge variant="secondary" className="text-xs">
                                  {category.name}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Used {template.usageCount} times
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.defaultQuantity} {template.defaultUnit}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleQuickAdd(template)}
                            disabled={!selectedList}
                            className="ml-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Try adjusting your search" : "Add items to lists to create templates"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Most Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTemplates.slice(0, 5).map((template, index) => (
                  <div key={template._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.usageCount} uses
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleQuickAdd(template)}
                      disabled={!selectedList}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity?.slice(0, 5).map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {activity.action === 'add_item' && 'Added item'}
                        {activity.action === 'delete_item' && 'Removed item'}
                        {activity.action === 'toggle_item' && 'Completed item'}
                        {activity.action === 'update_item' && 'Updated item'}
                        {activity.details?.name && (
                          <span className="font-medium"> {activity.details.name}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {!recentActivity?.length && (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
                <Button className="w-full" variant="outline">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Categories
                </Button>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}