
import { v } from "convex/values";
import { query } from "./_generated/server";

export const getRecentActivity = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 10 } = args;

    const activities = await ctx.db
      .query("activity_logs")
      .withIndex("by_user") // assumes the index is on userId field
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")        // order by createdAt descending
      .take(limit)


    return activities;
  },
});
