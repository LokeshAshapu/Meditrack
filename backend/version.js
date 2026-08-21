/**
 * MediTrack Single Source of Truth for Product Versioning (Phase 1)
 */
const MEDITRACK_VERSION = {
    version: "2.4.0-pilot",
    environment: process.env.PILOT_MODE === "true" ? "pilot" : (process.env.NODE_ENV || "development"),
    buildDate: "2026-08-21",
    productName: "MediTrack Healthcare SaaS",
    entitlements: ["FREE", "PRO", "CLINIC"]
};

module.exports = MEDITRACK_VERSION;
