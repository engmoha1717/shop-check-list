import { defineSchema, defineTable} from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users : defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    role: v.optional(v.string()),
    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
    })
    .index("by_clerk_id", ["clerkId"])
    .index("by_active", ["isActive"]),


    shopping_lists: defineTable({
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        isCompleted: v.boolean(),
        scheduledDate: v.optional(v.number()),
        priority: v.string(),
        color: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        completedAt: v.optional(v.number()),
      })
        .index("by_user", ["userId"])
        .index("by_user_active", ["userId", "isCompleted"])
        .index("by_user_scheduled", ["userId", "scheduledDate"])
        .index("by_priority", ["priority"])
        .index("by_created", ["createdAt"]),
    
      list_items: defineTable({
        listId: v.id("shopping_lists"),
        userId: v.id("users"),
        name: v.string(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id("categories")),
        quantity: v.number(),
        unit: v.optional(v.string()),
        price: v.optional(v.number()),
        priority: v.string(),
        isCompleted: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
        completedAt: v.optional(v.number()),
      })
        .index("by_list", ["listId"])
        .index("by_user", ["userId"])
        .index("by_list_completed", ["listId", "isCompleted"]),
    
      categories: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        icon: v.string(),
        userId: v.optional(v.id("users")),
        isSystem: v.boolean(),
        createdAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_system", ["isSystem"]),
    
      item_templates: defineTable({
        name: v.string(),
        categoryId: v.optional(v.id("categories")),
        userId: v.id("users"),
        defaultQuantity: v.number(),
        defaultUnit: v.optional(v.string()),
        usageCount: v.number(),
        lastUsed: v.number(),
        createdAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_user_usage", ["userId", "usageCount"]),
    
      shared_lists: defineTable({
        listId: v.id("shopping_lists"),
        sharedWithUserId: v.id("users"),
        sharedByUserId: v.id("users"),
        permission: v.string(),
        acceptedAt: v.optional(v.number()),
        createdAt: v.number(),
      })
        .index("by_shared_with", ["sharedWithUserId"])
        .index("by_shared_by", ["sharedByUserId"])
        .index("by_list", ["listId"]),
    
      notifications: defineTable({
        userId: v.id("users"),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        data: v.optional(v.any()),
        isRead: v.boolean(),
        createdAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_user_read", ["userId", "isRead"]),
    
      activity_logs: defineTable({
        userId: v.id("users"),
        action: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        details: v.optional(v.any()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        createdAt: v.number(),
      })
        .index("by_user", ["userId"])
        .index("by_action", ["action"])
        .index("by_entity", ["entityType", "entityId"]),
    
})