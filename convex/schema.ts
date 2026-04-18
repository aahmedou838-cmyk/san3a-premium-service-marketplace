import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
const applicationTables = {
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()), // Primary identifier for Mauritania
    role: v.optional(v.union(v.literal("client"), v.literal("worker"), v.literal("admin"))),
    isFrozen: v.optional(v.boolean()),
    kycStatus: v.optional(v.union(v.literal("none"), v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
    kycRejectedReason: v.optional(v.string()),
    idFileId: v.optional(v.id("files")),
    avatar: v.optional(v.string()),
    trustScore: v.optional(v.number()),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    lastSeen: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
    // === Digital Trust Profile fields ===
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experienceYears: v.optional(v.number()),
    city: v.optional(v.string()),
    portfolioFileIds: v.optional(v.array(v.id("files"))),
    trustHandle: v.optional(v.string()), // short public slug (e.g. "ahmed-plumber")
    profileViews: v.optional(v.number()),
  })
    .index("by_role", ["role"])
    .index("by_phone", ["phone"])
    .index("by_kycStatus", ["kycStatus"])
    .index("by_online_status", ["role", "isOnline", "kycStatus"])
    .index("by_trustHandle", ["trustHandle"]),
  service_requests: defineTable({
    clientId: v.id("users"),
    workerId: v.optional(v.id("users")),
    serviceType: v.string(),
    description: v.optional(v.string()),
    voiceNoteFileId: v.optional(v.id("files")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("arrived"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    price: v.optional(v.number()),
    priceRange: v.optional(v.object({ min: v.number(), max: v.number() })),
    address: v.optional(v.string()),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    workerLocation: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    workerETA: v.optional(v.number()),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    contractUrl: v.optional(v.string()),
    hasDispute: v.optional(v.boolean()),
  }).index("by_client", ["clientId"])
    .index("by_worker", ["workerId"])
    .index("by_status", ["status"]),
  reviews: defineTable({
    requestId: v.id("service_requests"),
    clientId: v.id("users"),
    workerId: v.id("users"),
    rating: v.number(),
    comment: v.string(),
    timestamp: v.number(),
  }).index("by_requestId", ["requestId"])
    .index("by_workerId", ["workerId"]),
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning")),
    isRead: v.boolean(),
    timestamp: v.number(),
  }).index("by_userId_status", ["userId", "isRead"])
    .index("by_userId_timestamp", ["userId", "timestamp"]),
  payouts: defineTable({
    workerId: v.id("users"),
    amount: v.number(),
    method: v.union(v.literal("Bankily"), v.literal("Masrivi"), v.literal("Bank")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("rejected")),
    timestamp: v.number(),
  }).index("by_workerId", ["workerId"]),
  audit_logs: defineTable({
    action: v.string(),
    userId: v.id("users"),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),
  files: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
    uploadedAt: v.number(),
  })
    .index("by_userId_uploadedAt", ["userId", "uploadedAt"])
    .index("by_userId_storageId", ["userId", "storageId"]),
};
export default defineSchema({
  ...authTables,
  ...applicationTables,
});
