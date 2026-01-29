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

// Process single transaction message
export const processTransactionMessage = async (message, bankAddress, userId) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/transactions/process`,
            { 
                message, 
                bankAddress,
                userId: Number(userId)
            },
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Process bulk transaction messages
export const processBulkTransactionMessages = async (userId, messages) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/transactions/process-bulk`,
            { 
                userId: Number(userId),
                messages: messages
            },
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get user transactions
export const getUserTransactions = async (userId) => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/transactions/user/${userId}/getTransactions`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get transactions by type
export const getUserTransactionsByType = async (userId, transactionType) => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/transactions/user/${userId}/type/${transactionType}`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get transactions by category
export const getUserTransactionsByCategory = async (userId, category) => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/transactions/user/${userId}/category/${category}`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get unverified transactions
export const getUnverifiedTransactions = async (userId) => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/transactions/user/${userId}/unverified`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Get transaction by ID
export const getTransactionById = async (transactionId) => {
    try {
        const response = await apiConnector(
            "GET",
            `${BACKEND_API}/transactions/${transactionId}`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Update transaction
export const updateTransaction = async (transactionId, updateData) => {
    try {
        const response = await apiConnector(
            "PUT",
            `${BACKEND_API}/transactions/${transactionId}`,
            updateData,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Delete transaction
export const deleteTransaction = async (transactionId) => {
    try {
        const response = await apiConnector(
            "DELETE",
            `${BACKEND_API}/transactions/${transactionId}`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};

// Verify transaction
export const verifyTransaction = async (transactionId) => {
    try {
        const response = await apiConnector(
            "POST",
            `${BACKEND_API}/transactions/${transactionId}/verify`,
            null,
            getAuthHeaders()
        );
        return response;
    } catch (error) {
        throw error;
    }
};
