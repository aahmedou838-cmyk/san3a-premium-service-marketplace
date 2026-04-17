import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const setUserRole = mutation({
  args: { role: v.union(v.literal("client"), v.literal("worker")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const existingUser = await ctx.db.get(userId);
    if (existingUser?.role) throw new Error("Role already set");
    await ctx.db.patch(userId, {
      role: args.role,
      kycStatus: "none",
      trustScore: 0,
      isOnline: false,
    });
    await ctx.db.insert("audit_logs", {
      action: "ROLE_SET",
      userId,
      metadata: { role: args.role },
      timestamp: Date.now(),
    });
  },
});
export const updateLocation = mutation({
  args: { location: v.object({ lat: v.number(), lng: v.number() }) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, {
      location: args.location,
      lastSeen: Date.now(),
    });
  },
});
export const toggleOnlineStatus = mutation({
  args: { isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, { isOnline: args.isOnline });
  },
});
export const listNearbyWorkers = query({
  args: {},
  handler: async (ctx) => {
    // Light filtering for Nouakchott area (approx bounds)
    return await ctx.db
      .query("users")
      .withIndex("by_online_status", (q) =>
        q.eq("role", "worker").eq("isOnline", true).eq("kycStatus", "verified")
      )
      .collect();
  },
});
export const submitKYC = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, {
      name: args.name,
      phone: args.phone,
      kycStatus: "pending",
    });
    await ctx.db.insert("audit_logs", {
      action: "KYC_SUBMISSION",
      userId,
      metadata: { skills: args.skills },
      timestamp: Date.now(),
    });
  },
});
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthorized");
    const adminUser = await ctx.db.get(adminId);
    if (adminUser?.role !== "admin") return [];
    return await ctx.db.query("users").collect();
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
      metadata: { targetUserId: args.userId, performedBy: adminId },
      timestamp: Date.now(),
    });
  },
});
export const updateTrustScore = internalMutation({
  args: { userId: v.id("users"), increment: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    const newScore = (user.trustScore ?? 0) + args.increment;
    await ctx.db.patch(args.userId, { trustScore: newScore });
  },
});
export const loggedInUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});