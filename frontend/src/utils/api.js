const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/**
 * Authenticated API Fetch Helper
 * Automatically attaches Authorization: Bearer <token> header to all requests.
 */
export const authFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("authToken");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        console.warn("⚠️ Authentication session expired. Redirecting to login...");
        // Handle unauthenticated state gracefully if needed
    }

    return response;
};
