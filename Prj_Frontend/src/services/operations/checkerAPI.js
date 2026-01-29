import { apiConnector } from "../apiConnector";

const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:8080/api";

// Get auth token from localStorage
const getAuthHeaders = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

// Test regex pattern (same as maker)
export const testRegexPattern = async (regexPattern, message) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/extract`,
            { pattern: regexPattern, text: message },
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get pending regex patterns
export const getPendingPatterns = async () => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/regex/pending`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get approved regex patterns
export const getApprovedPatterns = async () => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/regex/approved`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Approve regex pattern
export const approvePattern = async (patternId) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/pending-to-approved`,
            patternId,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        
        throw error;
    }
};

// Reject regex pattern
export const rejectPattern = async (patternId) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/pending-to-rejected`,
            patternId,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};
