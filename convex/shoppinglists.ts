/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";


export const getUserLists = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("shopping_lists")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isCompleted", false)
      )
      .order("desc")
      .collect();

    const listsWithDetails = await Promise.all(
      lists.map(async (list) => {
        const items = await ctx.db
          .query("list_items")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .collect();

        const completedItems = items.filter((item) => item.isCompleted);
        const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

        return {
          ...list,
          priority: list.priority as "low" | "medium" | "high",
          itemCount: items.length,
          completedCount: completedItems.length,
          totalPrice,
        };
      })
    );

    return listsWithDetails;
  },
});

export const getListById = query({
  args: { listId: v.id("shopping_lists"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    
    if (!list || list.userId !== args.userId) {
      return null;
    }

    const items = await ctx.db
      .query("list_items")
      .withIndex("by_list_completed", (q) => 
        q.eq("listId", args.listId)
      )
      .collect();

    const itemsWithCategory = await Promise.all(
      items.map(async (item) => {
        let category = null;
        if (item.categoryId) {
          category = await ctx.db.get(item.categoryId);
        }
        return { 
          ...item, 
          priority: item.priority as "low" | "medium" | "high",
          category 
        };
      })
    );

    return {
      ...list,
      priority: list.priority as "low" | "medium" | "high",
      items: itemsWithCategory,
      itemCount: items.length,
      completedCount: items.filter((item) => item.isCompleted).length,
      totalPrice: items.reduce((sum, item) => sum + (item.price || 0), 0),
    };
  },
});

export const createList = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    priority: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const listId = await ctx.db.insert("shopping_lists", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      isCompleted: false,
      scheduledDate: args.scheduledDate,
      priority: args.priority as "low" | "medium" | "high",
      color: args.color,
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "create_list",
      entityType: "shopping_list",
      entityId: listId,
      details: { name: args.name },
      createdAt: now,
    });

    return listId;
  },
});

export const updateList = mutation({
  args: {
    listId: v.id("shopping_lists"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    priority: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    
    if (!list || list.userId !== args.userId) {
      throw new Error("List not found or unauthorized");
    }

    const updateData: any = { updatedAt: Date.now() };
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.scheduledDate !== undefined) updateData.scheduledDate = args.scheduledDate;
    if (args.priority !== undefined) updateData.priority = args.priority;
    if (args.color !== undefined) updateData.color = args.color;

    await ctx.db.patch(args.listId, updateData);

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "update_list",
      entityType: "shopping_list",
      entityId: args.listId,
      details: updateData,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteList = mutation({
  args: {
    listId: v.id("shopping_lists"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    
    if (!list || list.userId !== args.userId) {
      throw new Error("List not found or unauthorized");
    }

    // Delete all items in the list
    const items = await ctx.db
      .query("list_items")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete the list
    await ctx.db.delete(args.listId);

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "delete_list",
      entityType: "shopping_list",
      entityId: args.listId,
      details: { name: list.name },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const completeList = mutation({
  args: {
    listId: v.id("shopping_lists"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const list = await ctx.db.get(args.listId);
    
    if (!list || list.userId !== args.userId) {
      throw new Error("List not found or unauthorized");
    }

    const now = Date.now();
    
    await ctx.db.patch(args.listId, {
      isCompleted: true,
      completedAt: now,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "complete_list",
      entityType: "shopping_list",
      entityId: args.listId,
      details: { name: list.name },
      createdAt: now,
    });

    return { success: true };
  },
});

export const getCompletedLists = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("shopping_lists")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", args.userId).eq("isCompleted", true)
      )
      .order("desc")
      .collect();

    const listsWithDetails = await Promise.all(
      lists.map(async (list) => {
        const items = await ctx.db
          .query("list_items")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .collect();

        const completedItems = items.filter((item) => item.isCompleted);
        const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

        return {
          ...list,
          priority: list.priority as "low" | "medium" | "high",
          itemCount: items.length,
          completedCount: completedItems.length,
          totalPrice,
        };
      })
    );

    return listsWithDetails;
  },
});