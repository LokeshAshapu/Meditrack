const crypto = require("crypto");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const JWT_SECRET = process.env.JWT_SECRET || process.env.FIREBASE_SERVICE_ACCOUNT || "MediTrack_Secure_Default_App_Secret_2026";

/**
 * Generates a secure HMAC-SHA256 signed Auth token containing user claims.
 */
function generateAuthToken(payload, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
    const header = { alg: "HS256", typ: "JWT" };
    const exp = Date.now() + expiresInMs;
    const data = { ...payload, exp };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(data)).toString("base64url");
    
    const signature = crypto
        .createHmac("sha256", JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies signed Auth tokens and Firebase ID tokens.
 */
async function verifyToken(token) {
    if (!token) return null;

    // 1. Try Firebase Admin ID Token Verification if available
    try {
        const decodedFirebaseToken = await getAuth().verifyIdToken(token);
        if (decodedFirebaseToken && decodedFirebaseToken.email) {
            return {
                email: decodedFirebaseToken.email.toLowerCase(),
                uid: decodedFirebaseToken.uid,
                role: decodedFirebaseToken.role || null
            };
        }
    } catch (e) {
        // Fall through to custom signed token verification
    }

    // 2. Custom Signed HMAC-SHA256 Token Verification
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const [encodedHeader, encodedPayload, signature] = parts;
        const expectedSignature = crypto
            .createHmac("sha256", JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest("base64url");

        if (signature !== expectedSignature) {
            return null;
        }

        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
        if (payload.exp && Date.now() > payload.exp) {
            return null; // Token expired
        }

        return payload;
    } catch (err) {
        return null;
    }
}

/**
 * Authentication Middleware: Validates Bearer Token and attaches req.user
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required. Missing Bearer token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.email) {
        return res.status(401).json({ message: "Invalid, expired, or untrusted authentication token." });
    }

    const normalizedEmail = decoded.email.trim().toLowerCase();

    try {
        const db = getFirestore();
        const userDoc = await db.collection("users").doc(normalizedEmail).get();

        if (!userDoc.exists) {
            return res.status(401).json({ message: "Authenticated user record no longer exists." });
        }

        const userData = userDoc.data();
        req.user = {
            email: normalizedEmail,
            role: userData.role || "patient",
            name: userData.name || "",
            phoneNumber: userData.phoneNumber || "",
            isVerified: userData.isVerified !== undefined ? userData.isVerified : true,
            uid: decoded.uid || normalizedEmail
        };

        next();
    } catch (error) {
        console.error("❌ Authentication Middleware Error:", error);
        return res.status(500).json({ message: "Internal authentication error." });
    }
};

/**
 * Authorization Middleware: Enforces specified user roles.
 */
const requireRole = (allowedRoles) => {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }

        if (!rolesArray.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of the following roles: [${rolesArray.join(", ")}]. Your role: '${req.user.role}'`
            });
        }

        next();
    };
};

/**
 * IDOR Protection Helper: Ensures user accesses only their own resource unless Admin or authorized Doctor.
 */
const checkResourceOwnership = (req, targetEmail) => {
    if (!req.user) return false;
    if (req.user.role === "admin") return true;
    if (targetEmail && req.user.email === targetEmail.trim().toLowerCase()) return true;
    return false;
};

/**
 * Lightweight In-Memory Sliding Window Rate Limiter
 */
const rateLimitMap = new Map();

const rateLimiter = ({ windowMs = 15 * 60 * 1000, maxRequests = 100, message = "Too many requests. Please try again later." }) => {
    return (req, res, next) => {
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global";
        const key = `${ip}:${req.path}`;
        const now = Date.now();

        const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
        } else {
            record.count += 1;
        }

        rateLimitMap.set(key, record);

        if (record.count > maxRequests) {
            return res.status(429).json({ message, retryAfter: Math.ceil((record.resetTime - now) / 1000) });
        }

        next();
    };
};

module.exports = {
    generateAuthToken,
    verifyToken,
    authenticateToken,
    requireRole,
    checkResourceOwnership,
    rateLimiter
};
