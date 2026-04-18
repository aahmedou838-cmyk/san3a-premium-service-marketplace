import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Public Digital Trust Profile — returns a curated, shareable worker reputation
 * card that can be viewed without authentication. This is the heart of San3a's
 * "سمعته الرقمية" (Digital Reputation) concept.
 */
export const getPublicProfile = query({
  args: { workerId: v.id("users") },
  handler: async (ctx, args) => {
    const worker = await ctx.db.get(args.workerId);
    if (!worker || worker.role !== "worker") return null;
    // Only expose profiles of verified workers publicly.
    if (worker.kycStatus !== "verified") {
      return { notVerified: true as const };
    }

    // Reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_workerId", (q) => q.eq("workerId", args.workerId))
      .collect();
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews
        : worker.trustScore ?? 5.0;

    // Completed jobs stats
    const completedJobs = await ctx.db
      .query("service_requests")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const allJobs = await ctx.db
      .query("service_requests")
      .withIndex("by_worker", (q) => q.eq("workerId", args.workerId))
      .collect();

    const disputedJobs = allJobs.filter((j) => j.hasDispute === true).length;
    const completionRate =
      allJobs.length > 0
        ? Math.round((completedJobs.length / allJobs.length) * 100)
        : 100;
    const disputeFreeRate =
      completedJobs.length > 0
        ? Math.round(
            ((completedJobs.length - disputedJobs) / completedJobs.length) * 100
          )
        : 100;

    // Average response time (accepted - created)
    const responseDurations = allJobs
      .filter((j) => j.workerId && j.status !== "pending")
      .map((j) => (j.actualStartTime || j._creationTime) - j._creationTime)
      .filter((d) => d > 0 && d < 24 * 3600 * 1000);
    const avgResponseMs =
      responseDurations.length > 0
        ? responseDurations.reduce((a, b) => a + b, 0) / responseDurations.length
        : 0;
    const avgResponseMinutes = Math.max(1, Math.round(avgResponseMs / 60000));

    // Portfolio URLs (resolve storage)
    const portfolioUrls: string[] = [];
    if (worker.portfolioFileIds) {
      for (const fid of worker.portfolioFileIds) {
        const f = await ctx.db.get(fid);
        if (f) {
          const url = await ctx.storage.getUrl(f.storageId);
          if (url) portfolioUrls.push(url);
        }
      }
    }

    // Recent anonymized reviews (limit 6, hide last name)
    const recentReviews = [...reviews]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
    const anonymizedReviews = await Promise.all(
      recentReviews.map(async (r) => {
        const client = await ctx.db.get(r.clientId);
        const fullName = client?.name || "عميل";
        const parts = fullName.trim().split(/\s+/);
        const displayName =
          parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
        return {
          rating: r.rating,
          comment: r.comment,
          timestamp: r.timestamp,
          clientName: displayName,
        };
      })
    );

    // Per-skill rating approximation: distribute avg across declared skills
    const skills = worker.skills || [];
    const skillStats = skills.map((s) => ({ name: s, rating: avgRating }));

    return {
      notVerified: false as const,
      _id: worker._id,
      name: worker.name || "فني صنعة",
      city: worker.city || "نواكشوط",
      bio: worker.bio || "",
      skills,
      skillStats,
      experienceYears: worker.experienceYears || 0,
      avatarInitial: (worker.name || "ف").charAt(0),
      kycVerified: worker.kycStatus === "verified",
      joinedAt: worker._creationTime,
      trustScore: Number(avgRating.toFixed(2)),
      totalReviews,
      completedJobsCount: completedJobs.length,
      completionRate,
      disputeFreeRate,
      avgResponseMinutes,
      portfolioUrls,
      reviews: anonymizedReviews,
      profileViews: worker.profileViews || 0,
    };
  },
});

/**
 * Increment a lightweight view counter when a public trust profile is opened.
 * Anyone (even anonymous) can ping this; abuse mitigation is out of scope for MVP.
 */
export const incrementProfileView = mutation({
  args: { workerId: v.id("users") },
  handler: async (ctx, args) => {
    const worker = await ctx.db.get(args.workerId);
    if (!worker || worker.role !== "worker") return;
    await ctx.db.patch(args.workerId, {
      profileViews: (worker.profileViews || 0) + 1,
    });
  },
});

/**
 * Fetch the current authenticated worker's shareable trust URL + QR payload.
 */
export const getMyShareLink = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "worker") return null;
    return {
      workerId: user._id,
      kycStatus: user.kycStatus,
      name: user.name || "فني صنعة",
    };
  },
});

/**
 * Recalculate the worker's trust score from the full review history.
 * Called from review submission for accuracy.
 */
export const recalcTrustScore = internalMutation({
  args: { workerId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_workerId", (q) => q.eq("workerId", args.workerId))
      .collect();
    if (reviews.length === 0) return;
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await ctx.db.patch(args.workerId, {
      trustScore: Number(avg.toFixed(2)),
    });
  },
});
