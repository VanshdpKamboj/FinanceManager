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

// Test regex pattern
export const testRegexPattern = async (regexPattern, message) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/extract`,
            { 
                pattern: regexPattern, 
                text: message,
            },
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Submit regex pattern for approval
export const submitForApproval = async (regexPattern, message, patternId, bankAddress, bankName, merchantName, transactionCategory, transactionType ) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/save`,
            { 
                pattern: regexPattern, 
                text: message, 
                status: "PENDING", 
                id: patternId,
                bankAddress: bankAddress,
                bankName: bankName,
                merchantName: merchantName,
                transactionCategory: transactionCategory,
                transactionType: transactionType
            },
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Save regex pattern as draft
export const saveAsDraft = async (regexPattern, message, patternId, bankAddress, bankName, merchantName, transactionCategory, transactionType   ) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/save`,
            { 
                pattern: regexPattern, 
                text: message, 
                status: "DRAFT", 
                id: patternId,
                bankAddress: bankAddress,
                bankName: bankName,
                merchantName: merchantName,
                transactionCategory: transactionCategory,
                transactionType: transactionType
            },
            getAuthHeaders()
        );

        return response;
    } catch (error) {
        throw error;
    }
};

// Get drafted regex patterns
export const getDraftedPatterns = async () => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/regex/drafted`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get rejected regex patterns
export const getRejectedPatterns = async () => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/regex/rejected`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get accepted regex patterns
export const getAcceptedPatterns = async () => {
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

// Submit drafted/rejected pattern for approval (moves it from draft/rejected to pending)
export const resubmitPattern = async (patternId) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/regex/resubmit`,
            { patternId },
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};
