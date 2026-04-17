import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const setUserRole = mutation({
  args: { role: v.union(v.literal("client"), v.literal("worker")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, { role: args.role, kycStatus: "none" });
    await ctx.db.insert("audit_logs", {
      action: "ROLE_SET",
      userId,
      metadata: { role: args.role },
      timestamp: Date.now(),
    });
  },
});
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
export const toggleUserFreeze = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthorized");
    const adminUser = await ctx.db.get(adminId);
    if (adminUser?.role !== "admin") throw new Error("Forbidden: Admin only");
    const user = await ctx.db.get(args.userId);
    const newStatus = !user?.isFrozen;
    await ctx.db.patch(args.userId, { isFrozen: newStatus });
    await ctx.db.insert("audit_logs", {
      action: newStatus ? "USER_FROZEN" : "USER_UNFROZEN",
      userId: adminId,
      metadata: { targetUserId: args.userId },
      timestamp: Date.now(),
    });
  },
});