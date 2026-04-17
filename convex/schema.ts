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
    avatar: v.optional(v.string()),
    trustScore: v.optional(v.number()),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    lastSeen: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
  })
    .index("by_role", ["role"])
    .index("by_phone", ["phone"])
    .index("by_online_status", ["role", "isOnline", "kycStatus"]),
  service_requests: defineTable({
    clientId: v.id("users"),
    workerId: v.optional(v.id("users")),
    serviceType: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("arrived"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    price: v.optional(v.number()),
    address: v.optional(v.string()),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    workerLocation: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    workerETA: v.optional(v.number()),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    contractUrl: v.optional(v.string()),
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