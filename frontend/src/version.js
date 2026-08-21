/**
 * MediTrack Single Source of Truth for Product Versioning (Frontend Phase 1)
 */
export const MEDITRACK_VERSION = {
    version: "2.4.0-pilot",
    environment: import.meta.env.MODE === "production" ? "production" : "pilot",
    buildDate: "2026-08-21",
    productName: "MediTrack Healthcare SaaS"
};
