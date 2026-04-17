import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
const applicationTables = {
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("client"), v.literal("worker"), v.literal("admin"))),
    isFrozen: v.optional(v.boolean()),
    kycStatus: v.optional(v.union(v.literal("none"), v.literal("pending"), v.literal("verified"), v.literal("rejected"))),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    trustScore: v.optional(v.number()),
  }).index("by_role", ["role"]),
  service_requests: defineTable({
    clientId: v.id("users"),
    workerId: v.optional(v.id("users")),
    serviceType: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    price: v.optional(v.number()),
    address: v.optional(v.string()),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    contractUrl: v.optional(v.string()),
  }).index("by_client", ["clientId"])
    .index("by_worker", ["workerId"])
    .index("by_status", ["status"]),
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