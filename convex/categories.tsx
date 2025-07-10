/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCategories = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Get system categories
    const systemCategories = await ctx.db
      .query("categories")
      .withIndex("by_system", (q) => q.eq("isSystem", true))
      .collect();

    // Get user categories if userId provided
    let userCategories: any[] = [];
    if (args.userId) {
      userCategories = await ctx.db
        .query("categories")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }

    return [...systemCategories, ...userCategories];
  },
});

export const createCategory = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      isSystem: false,
      createdAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "create_category",
      entityType: "category",
      entityId: categoryId,
      details: { name: args.name },
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

export const initializeSystemCategories = mutation({
  handler: async (ctx) => {
    // Check if system categories already exist
    const existingCategories = await ctx.db
      .query("categories")
      .withIndex("by_system", (q) => q.eq("isSystem", true))
      .collect();

    if (existingCategories.length > 0) {
      return { message: "System categories already initialized" };
    }

    const systemCategories = [
      { name: "Fruits & Vegetables", color: "#10B981", icon: "apple" },
      { name: "Meat & Seafood", color: "#EF4444", icon: "beef" },
      { name: "Dairy & Eggs", color: "#F59E0B", icon: "milk" },
      { name: "Bakery", color: "#8B5CF6", icon: "wheat" },
      { name: "Pantry", color: "#6B7280", icon: "package" },
      { name: "Frozen", color: "#06B6D4", icon: "snowflake" },
      { name: "Beverages", color: "#3B82F6", icon: "coffee" },
      { name: "Snacks", color: "#F97316", icon: "cookie" },
      { name: "Health & Beauty", color: "#EC4899", icon: "heart" },
      { name: "Household", color: "#84CC16", icon: "home" },
      { name: "Other", color: "#6B7280", icon: "more-horizontal" },
    ];

    for (const category of systemCategories) {
      await ctx.db.insert("categories", {
        name: category.name,
        color: category.color,
        icon: category.icon,
        isSystem: true,
        createdAt: Date.now(),
      });
    }

    return { message: "System categories initialized successfully" };
  },
});