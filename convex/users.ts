import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
    args:{
        clerkId : v.string(),
        name : v.string(),
        email: v.string(),
        image: v.optional(v.string()),
    },
    handler : async(ctx,args)=>{
        const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id",(q)=>q.eq("clerkId",args.clerkId))
        .unique();

        if(existingUser){
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                image: args.image,
                lastActiveAt: Date.now(),
              });
              return existingUser._id;
        }else {
             return await ctx.db.insert("users", {
                clerkId: args.clerkId,
                name: args.name,
                email: args.email,
                image: args.image,
                isActive: true,
                role: "user",
                createdAt: Date.now(),
                lastActiveAt: Date.now(),
              });
              
        }
    }
})


export const getCurrentUser = query({
    args:{clerkId: v.string()},
    handler: async(ctx,args)=>{
        const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (Q)=>Q.eq("clerkId",args.clerkId) )
        .unique();

        
        return user;
    }
})




export const getAllUsers = query({
    args: {
  
      adminId: v.string(),
      search: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
      const admin = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminId))
        .unique();
    
      if (!admin || admin.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
    
      const query = args.isActive !== undefined
        ? ctx.db.query("users").withIndex("by_active", (q) => q.eq("isActive", args.isActive))
        : ctx.db.query("users").fullTableScan();
    
      const users = await query.collect();
    
      if (args.search) {
        const searchLower = args.search.toLowerCase();
        return users.filter(
          (user) =>
            user.email.toLowerCase().includes(searchLower) ||
            user.name.toLowerCase().includes(searchLower)
        );
      }
    
      return users;
    }
  });

  
  export const suspendUser = mutation({
    args: {
      adminId: v.string(),
      userId: v.id("users"),
    },
    handler: async (ctx, args) => {
      // Verify admin access
      const admin = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminId))
        .unique();
  
      if (!admin || admin.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
  
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }
  
      await ctx.db.patch(args.userId, {
        isActive: false,
      });
  
      // Log activity
      await ctx.db.insert("activity_logs", {
        userId: admin._id,
        action: "suspend_user",
        entityType: "user",
        entityId: args.userId,
        details: { targetUser: user.email },
        createdAt: Date.now(),
      });
  
      return { success: true };
    },
  });
  
  export const deleteUser = mutation({
    args: {
      adminId: v.string(),
      userId: v.id("users"),
    },
    handler: async (ctx, args) => {
      // Verify admin access
      const admin = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminId))
        .unique();
  
      if (!admin || admin.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
  
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }
  
      // Delete user's lists and items
      const userLists = await ctx.db
        .query("shopping_lists")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
  
      for (const list of userLists) {
        // Delete list items
        const items = await ctx.db
          .query("list_items")
          .withIndex("by_list", (q) => q.eq("listId", list._id))
          .collect();
  
        for (const item of items) {
          await ctx.db.delete(item._id);
        }
  
        await ctx.db.delete(list._id);
      }
  
      // Delete user's templates
      const templates = await ctx.db
        .query("item_templates")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
  
      for (const template of templates) {
        await ctx.db.delete(template._id);
      }
  
      // Delete user's notifications
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
  
      for (const notification of notifications) {
        await ctx.db.delete(notification._id);
      }
  
      // Log activity before deleting user
      await ctx.db.insert("activity_logs", {
        userId: admin._id,
        action: "delete_user",
        entityType: "user",
        entityId: args.userId,
        details: { targetUser: user.email },
        createdAt: Date.now(),
      });
  
      // Finally delete the user
      await ctx.db.delete(args.userId);
  
      return { success: true };
    },
  });
  
  export const reactivateUser = mutation({
    args: {
      adminId: v.string(),
      userId: v.id("users"),
    },
    handler: async (ctx, args) => {
      // Verify admin access
      const admin = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminId))
        .unique();
  
      if (!admin || admin.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
  
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }
  
      await ctx.db.patch(args.userId, {
        isActive: true,
      });
  
      // Log activity
      await ctx.db.insert("activity_logs", {
        userId: admin._id,
        action: "reactivate_user",
        entityType: "user",
        entityId: args.userId,
        details: { targetUser: user.email },
        createdAt: Date.now(),
      });
  
      return { success: true };
    },
  });
  
  export const getUserStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
      const lists = await ctx.db
        .query("shopping_lists")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
  
      const completedLists = lists.filter((list) => list.isCompleted);
  
      const items = await ctx.db
        .query("list_items")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
  
      const completedItems = items.filter((item) => item.isCompleted);
  
      const categoriesUsed = new Set(items.map((item) => item.categoryId).filter(Boolean)).size;
  
      return {
        totalLists: lists.length,
        completedLists: completedLists.length,
        totalItems: items.length,
        completedItems: completedItems.length,
        categoriesUsed,
        avgItemsPerList: lists.length > 0 ? items.length / lists.length : 0,
      };
    },
  });



  export const toggleUserStatus = mutation({
    args: {
      userId: v.id("users")
    },
    handler: async (ctx, args) => {
      const user = await ctx.db.get(args.userId)
  
      if (!user) {
        throw new Error("User not found")
      }
  
      await ctx.db.patch(args.userId, {
        isActive: !user.isActive
      })
    }
  })