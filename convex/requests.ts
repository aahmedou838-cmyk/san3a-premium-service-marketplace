import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const createRequest = mutation({
  args: {
    serviceType: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.isFrozen) throw new Error("Account is frozen");
    const requestId = await ctx.db.insert("service_requests", {
      clientId: userId,
      serviceType: args.serviceType,
      description: args.description,
      address: args.address,
      status: "pending",
    });
    return requestId;
  },
});
export const listActiveRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    if (user.role === "client") {
      return await ctx.db
        .query("service_requests")
        .withIndex("by_client", (q) => q.eq("clientId", userId))
        .filter((q) => q.neq(q.field("status"), "completed"))
        .collect();
    } else if (user.role === "worker") {
      return await ctx.db
        .query("service_requests")
        .withIndex("by_worker", (q) => q.eq("workerId", userId))
        .filter((q) => q.neq(q.field("status"), "completed"))
        .collect();
    }
    return [];
  },
});
export const getAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthorized");
    const adminUser = await ctx.db.get(adminId);
    if (adminUser?.role !== "admin") throw new Error("Forbidden");
    return await ctx.db
      .query("audit_logs")
      .order("desc")
      .take(args.limit ?? 20);
  },
});