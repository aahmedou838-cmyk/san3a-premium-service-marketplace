import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
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
      price: 250, // Default estimate
    });
    await ctx.db.insert("audit_logs", {
      action: "REQUEST_CREATED",
      userId,
      metadata: { requestId, serviceType: args.serviceType },
      timestamp: Date.now(),
    });
    return requestId;
  },
});
export const acceptContract = mutation({
  args: { requestId: v.id("service_requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.isFrozen) throw new Error("Account is frozen");
    if (user?.role !== "worker") throw new Error("Only workers can accept jobs");
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      workerId: userId,
      workerLocation: { lat: 24.7136, lng: 46.6753 },
      workerETA: 15
    });
    await ctx.db.insert("audit_logs", {
      action: "JOB_ACCEPTED",
      userId,
      metadata: { requestId: args.requestId },
      timestamp: Date.now(),
    });
  },
});
export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("service_requests"),
    status: v.union(v.literal("arrived"), v.literal("in_progress"), v.literal("completed"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const patch: any = { status: args.status };
    if (args.status === "in_progress") patch.actualStartTime = Date.now();
    if (args.status === "completed") patch.actualEndTime = Date.now();
    await ctx.db.patch(args.requestId, patch);
    await ctx.db.insert("audit_logs", {
      action: `STATUS_CHANGE_${args.status.toUpperCase()}`,
      userId,
      metadata: { requestId: args.requestId },
      timestamp: Date.now(),
    });
  },
});
export const submitReview = mutation({
  args: {
    requestId: v.id("service_requests"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const request = await ctx.db.get(args.requestId);
    if (!request || !request.workerId) throw new Error("Invalid request");
    await ctx.db.insert("reviews", {
      requestId: args.requestId,
      clientId: userId,
      workerId: request.workerId,
      rating: args.rating,
      comment: args.comment,
      timestamp: Date.now(),
    });
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_workerId", (q) => q.eq("workerId", request.workerId!))
      .collect();
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await ctx.db.patch(request.workerId, { trustScore: avg });
  },
});
export const getJobDetails = query({
  args: { requestId: v.id("service_requests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;
    const worker = request.workerId ? await ctx.db.get(request.workerId) : null;
    const client = await ctx.db.get(request.clientId);
    return { ...request, worker, client };
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
    } else {
      return await ctx.db
        .query("service_requests")
        .withIndex("by_worker", (q) => q.eq("workerId", userId))
        .filter((q) => q.neq(q.field("status"), "completed"))
        .collect();
    }
  },
});
export const listCompletedRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user) return [];
    if (user.role === "client") {
      const requests = await ctx.db
        .query("service_requests")
        .withIndex("by_client", (q) => q.eq("clientId", userId))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();
      return await Promise.all(requests.map(async r => {
        const worker = r.workerId ? await ctx.db.get(r.workerId) : null;
        return { ...r, worker };
      }));
    } else {
      const requests = await ctx.db
        .query("service_requests")
        .withIndex("by_worker", (q) => q.eq("workerId", userId))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();
      return await Promise.all(requests.map(async r => {
        const client = await ctx.db.get(r.clientId);
        return { ...r, client };
      }));
    }
  },
});
export const getWorkerEarnings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, weekly: 0, data: [] };
    const requests = await ctx.db
      .query("service_requests")
      .withIndex("by_worker", (q) => q.eq("workerId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
    const total = requests.reduce((sum, r) => sum + (r.price || 0), 0);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekly = requests
      .filter(r => (r.actualEndTime || 0) > oneWeekAgo)
      .reduce((sum, r) => sum + (r.price || 0), 0);
    const chartData = [
      { day: "السبت", amount: 0 },
      { day: "الأحد", amount: 0 },
      { day: "الاثنين", amount: 0 },
      { day: "الثلاثاء", amount: 0 },
      { day: "الأربعاء", amount: 0 },
      { day: "الخميس", amount: 0 },
      { day: "الجمعة", amount: 0 },
    ];
    return { total, weekly, chartData };
  },
});
export const reportDispute = mutation({
  args: { requestId: v.id("service_requests"), reason: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.insert("audit_logs", {
      action: "DISPUTE_REPORTED",
      userId,
      metadata: { requestId: args.requestId, reason: args.reason },
      timestamp: Date.now(),
    });
  },
});
export const getAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Unauthorized");
    const adminUser = await ctx.db.get(adminId);
    if (adminUser?.role !== "admin") throw new Error("Forbidden");
    return await ctx.db.query("audit_logs").order("desc").take(args.limit ?? 20);
  },
});