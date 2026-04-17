import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
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
      trustScore: 5.0, // Start with a default baseline
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
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, args);
    await ctx.db.insert("audit_logs", {
      action: "PROFILE_UPDATED",
      userId,
      metadata: args,
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
    idFileId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, {
      name: args.name,
      phone: args.phone,
      kycStatus: "pending",
      idFileId: args.idFileId,
    });
    await ctx.db.insert("audit_logs", {
      action: "KYC_SUBMISSION",
      userId,
      metadata: { skills: args.skills, idFileId: args.idFileId },
      timestamp: Date.now(),
    });
  },
});
export const listPendingKYC = query({
  args: {},
  handler: async (ctx) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthorized");
    const adminUser = await ctx.db.get(adminId);
    if (adminUser?.role !== "admin") return [];
    const pendingUsers = await ctx.db
      .query("users")
      .withIndex("by_kycStatus", (q) => q.eq("kycStatus", "pending"))
      .collect();
    return await Promise.all(
      pendingUsers.map(async (u) => {
        let fileUrl = null;
        if (u.idFileId) {
          const file = await ctx.db.get(u.idFileId);
          if (file) {
            fileUrl = await ctx.storage.getUrl(file.storageId);
          }
        }
        return { ...u, fileUrl };
      })
    );
  },
});
export const verifyWorker = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    const adminUser = adminId ? await ctx.db.get(adminId) : null;
    if (adminUser?.role !== "admin") throw new Error("Forbidden");
    await ctx.db.patch(args.userId, { kycStatus: "verified" });
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "تم توثيق حسابك",
      message: "تهانينا! تم التحقق من هويتك بنجاح.",
      type: "success",
      isRead: false,
      timestamp: Date.now(),
    });
    await ctx.db.insert("audit_logs", {
      action: "WORKER_VERIFIED",
      userId: adminId,
      metadata: { targetUserId: args.userId },
      timestamp: Date.now(),
    });
  },
});
export const rejectWorker = mutation({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    const adminUser = adminId ? await ctx.db.get(adminId) : null;
    if (adminUser?.role !== "admin") throw new Error("Forbidden");
    await ctx.db.patch(args.userId, { kycStatus: "rejected", kycRejectedReason: args.reason });
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "تم رفض التوثيق",
      message: `السبب: ${args.reason}`,
      type: "warning",
      isRead: false,
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
    if (adminUser?.role !== "admin") throw new Error("Forbidden");
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
export const updateTrustScore = internalMutation({
  args: { userId: v.id("users"), increment: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_workerId", (q) => q.eq("workerId", args.userId))
      .collect();
    const avg = reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : args.increment;
    await ctx.db.patch(args.userId, { trustScore: avg });
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