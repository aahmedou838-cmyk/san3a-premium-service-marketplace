import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
export const createRequest = mutation({
  args: {
    serviceType: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.isFrozen) throw new Error("تم تجميد حسابك، يرجى التواصل مع الإدارة.");
    const requestId = await ctx.db.insert("service_requests", {
      clientId: userId,
      serviceType: args.serviceType,
      description: args.description,
      address: args.address,
      location: args.location,
      status: "pending",
      price: 250, 
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
export const reportSOS = mutation({
  args: {
    requestId: v.id("service_requests"),
    location: v.object({ lat: v.number(), lng: v.number() }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.insert("audit_logs", {
      action: "EMERGENCY_SOS",
      userId,
      metadata: { 
        requestId: args.requestId, 
        location: args.location,
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now(),
    });
    // In a real app, this would trigger an SMS/Push to admins
    return { success: true };
  },
});
export const acceptContract = mutation({
  args: { requestId: v.id("service_requests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (user?.isFrozen) throw new Error("حسابك مجمد");
    if (user?.role !== "worker") throw new Error("يجب أن تكون فني لقبول الطلبات");
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("الطلب غير موجود");
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      workerId: userId,
      workerLocation: user.location,
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
    // Centralized trust score update using internal mutation
    await ctx.runMutation(internal.users.updateTrustScore, {
      userId: request.workerId,
      increment: args.rating
    });
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
    if (!userId) return { total: 0, weekly: 0, chartData: [] };
    const requests = await ctx.db
      .query("service_requests")
      .withIndex("by_worker", (q) => q.eq("workerId", userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
    const total = requests.reduce((sum, r) => sum + (r.price || 0), 0);
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyRequests = requests.filter(r => (r.actualEndTime || 0) > oneWeekAgo);
    const weekly = weeklyRequests.reduce((sum, r) => sum + (r.price || 0), 0);
    const arabicDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayName = arabicDays[d.getDay()];
      const dayTotal = weeklyRequests
        .filter(r => {
          const reqDate = new Date(r.actualEndTime!);
          return reqDate.getDate() === d.getDate() &&
                 reqDate.getMonth() === d.getMonth() &&
                 reqDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, r) => sum + (r.price || 0), 0);
      chartData.push({ day: dayName, amount: dayTotal });
    }
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