/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";


export const addItem = mutation({
  args: {
    listId: v.id("shopping_lists"),
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    quantity: v.number(),
    unit: v.optional(v.string()),
    price: v.optional(v.number()),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify list ownership
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== args.userId) {
      throw new Error("List not found or unauthorized");
    }

    const now = Date.now();

    const itemId = await ctx.db.insert("list_items", {
      listId: args.listId,
      userId: args.userId,
      name: args.name,
      description: args.description,
      categoryId: args.categoryId,
      quantity: args.quantity,
      unit: args.unit,
      price: args.price,
      priority: args.priority as "low" | "medium" | "high",
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update list timestamp
    await ctx.db.patch(args.listId, { updatedAt: now });

    // Create/update item template for future use
    const existingTemplate = await ctx.db
      .query("item_templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingTemplate) {
      await ctx.db.patch(existingTemplate._id, {
        usageCount: existingTemplate.usageCount + 1,
        lastUsed: now,
      });
    } else {
      await ctx.db.insert("item_templates", {
        name: args.name,
        categoryId: args.categoryId,
        userId: args.userId,
        defaultQuantity: args.quantity,
        defaultUnit: args.unit,
        usageCount: 1,
        lastUsed: now,
        createdAt: now,
      });
    }

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "add_item",
      entityType: "list_item",
      entityId: itemId,
      details: { name: args.name, listId: args.listId },
      createdAt: now,
    });

    return itemId;
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("list_items"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    price: v.optional(v.number()),
    priority: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    
    if (!item || item.userId !== args.userId) {
      throw new Error("Item not found or unauthorized");
    }

    const now = Date.now();
    const updateData: any = { updatedAt: now };
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.categoryId !== undefined) updateData.categoryId = args.categoryId;
    if (args.quantity !== undefined) updateData.quantity = args.quantity;
    if (args.unit !== undefined) updateData.unit = args.unit;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.priority !== undefined) updateData.priority = args.priority;
    
    if (args.isCompleted !== undefined) {
      updateData.isCompleted = args.isCompleted;
      if (args.isCompleted) {
        updateData.completedAt = now;
      } else {
        updateData.completedAt = undefined;
      }
    }

    await ctx.db.patch(args.itemId, updateData);

    // Update list timestamp
    await ctx.db.patch(item.listId, { updatedAt: now });

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: args.isCompleted !== undefined ? "toggle_item" : "update_item",
      entityType: "list_item",
      entityId: args.itemId,
      details: updateData,
      createdAt: now,
    });

    return { success: true };
  },
});

export const deleteItem = mutation({
  args: {
    itemId: v.id("list_items"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    
    if (!item || item.userId !== args.userId) {
      throw new Error("Item not found or unauthorized");
    }

    const now = Date.now();

    // Update list timestamp
    await ctx.db.patch(item.listId, { updatedAt: now });

    // Delete the item
    await ctx.db.delete(args.itemId);

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "delete_item",
      entityType: "list_item",
      entityId: args.itemId,
      details: { name: item.name, listId: item.listId },
      createdAt: now,
    });

    return { success: true };
  },
});

export const getItemTemplates = query({
  args: { userId: v.id("users"), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let templates = await ctx.db
      .query("item_templates")
      .withIndex("by_user_usage", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      templates = templates.filter((template) =>
        template.name.toLowerCase().includes(searchLower)
      );
    }

    return templates;
  },
});

export const bulkAddItems = mutation({
  args: {
    listId: v.id("shopping_lists"),
    userId: v.id("users"),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        unit: v.optional(v.string()),
        priority: v.string(),
        categoryId: v.optional(v.id("categories")),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify list ownership
    const list = await ctx.db.get(args.listId);
    if (!list || list.userId !== args.userId) {
      throw new Error("List not found or unauthorized");
    }

    const now = Date.now();
    const itemIds = [];

    for (const itemData of args.items) {
      const itemId = await ctx.db.insert("list_items", {
        listId: args.listId,
        userId: args.userId,
        name: itemData.name,
        categoryId: itemData.categoryId,
        quantity: itemData.quantity,
        unit: itemData.unit,
        priority: itemData.priority as "low" | "medium" | "high",
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      });

      itemIds.push(itemId);
    }

    // Update list timestamp
    await ctx.db.patch(args.listId, { updatedAt: now });

    // Log activity
    await ctx.db.insert("activity_logs", {
      userId: args.userId,
      action: "bulk_add_items",
      entityType: "shopping_list",
      entityId: args.listId,
      details: { itemCount: args.items.length },
      createdAt: now,
    });

    return itemIds;
  },
});