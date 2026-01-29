import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../reducer/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import CheckerDashBoard from "./CheckerDashBoard";
import MakerDashboard from "./MakerDashboard";

const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:8080/api";

function Home() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [bankAddress, setBankAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [extractedData, setExtractedData] = useState(null);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    // Fetch transaction history on component mount
    const fetchTransactionHistory = async () => {
        setHistoryLoading(true);
        setHistoryError("");

        try {
            const token = JSON.parse(localStorage.getItem("token"));
            const userId = Number(user._id || user.id);

            const response = await apiConnector(
                "GET",
                `${BACKEND_API}/transactions/user/${userId}/getTransactions`,
                null,
                {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            );

            if (response.data) {
                setTransactionHistory(response.data || []);
            } else {
                setHistoryError(response.data.message || "Failed to fetch transaction history");
            }
        } catch (error) {
            setHistoryError(error.response?.data?.message || "Failed to fetch transaction history");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "Normal_user") {
            fetchTransactionHistory();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setExtractedData(null);

        try {
            const token = JSON.parse(localStorage.getItem("token"));

            if(token == null){
                setError("User not authenticated. Please log in again.");
                return ;
            }

            const bodyData = { 
                message: message, 
                bankAddress: bankAddress,
                userId: Number(user._id || user.id) 
            };

            const response = await apiConnector(
                "POST",
                `${BACKEND_API}/transactions/process`,
                bodyData,
                {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            );


            if (response.data) {
                setExtractedData(response.data);
                // Refresh transaction history after successful extraction
                fetchTransactionHistory();
            } else {
                setError(response.data.message || "Failed to extract transaction data");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to process message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setMessage("");
        setBankAddress("");
        setExtractedData(null);
        setError("");
    };

    const getTransactionIcon = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('credit') || lowerType.includes('salary')) {
            return (
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            );
        } else if (lowerType.includes('debit')) {
            return (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            );
        }
        return (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        );
    };

    const getTransactionColor = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('credit') || lowerType.includes('salary')) {
            return 'border-green-200 bg-green-50';
        } else if (lowerType.includes('debit')) {
            return 'border-red-200 bg-red-50';
        }
        return 'border-blue-200 bg-blue-50';
    };

    // Show different content based on user type
    const renderUserContent = () => {
        if (user?.role === "Normal_user") {
            return (
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction Message Extractor</h2>
                        <p className="text-gray-600">Paste your transaction message below to extract details automatically</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Paste Message
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r animate-pulse">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            {error}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="bankAddress" className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Address
                                    </label>
                                    <input
                                        id="bankAddress"
                                        name="bankAddress"
                                        type="text"
                                        required
                                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                        placeholder="Example: HDFC-CA-01"
                                        value={bankAddress}
                                        onChange={(e) => setBankAddress(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="8"
                                        required
                                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 font-mono text-sm"
                                        placeholder="Example: INR 2,500.00 debited from A/c XX5678 on 10-Jan-26 via UPI to Z. Avl Bal: INR 15,420.50. Ref: 60123456789"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !message.trim() || !bankAddress.trim()}
                                        className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Extract Data
                                            </>
                                        )}
                                    </button>
                                    {(message || extractedData) && (
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Results Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Extracted Details
                            </h3>
                            
                            {!extractedData ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">No data extracted yet</p>
                                    <p className="text-sm mt-2">Paste a transaction message and click extract</p>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-fadeIn">
                                    {/* Transaction Type Banner */}
                                    {extractedData.transactionType && (
                                        <div className={`border-2 rounded-xl p-4 ${getTransactionColor(extractedData.transactionType)} transition duration-300`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {getTransactionIcon(extractedData.transactionType)}
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Transaction Type</p>
                                                        <p className="text-lg font-bold text-gray-900 capitalize">{extractedData.transactionType}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Amount */}
                                    {extractedData.amount && (
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                                            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Amount</p>
                                            <p className="text-2xl font-bold text-indigo-900">₹ {extractedData.amount}</p>
                                        </div>
                                    )}

                                    {/* Grid of Details */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {extractedData.date && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</p>
                                                <p className="text-sm font-semibold text-gray-900">{extractedData.date}</p>
                                            </div>
                                        )}

                                        {extractedData.via && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment Mode</p>
                                                <p className="text-sm font-semibold text-gray-900">{extractedData.via}</p>
                                            </div>
                                        )}

                                        {extractedData.accountNumber && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Account Number</p>
                                                <p className="text-sm font-semibold text-gray-900 font-mono">XXXX-{extractedData.accountNumber}</p>
                                            </div>
                                        )}

                                        {extractedData.to && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payed To / From</p>
                                                <p className="text-sm font-semibold text-gray-900">{extractedData.to}</p>
                                            </div>
                                        )}

                                        {extractedData.merchantName && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Merchant Name</p>
                                                <p className="text-sm font-semibold text-gray-900">{extractedData.merchantName}</p>
                                            </div>
                                        )}

                                        {extractedData.category && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</p>
                                                <p className="text-sm font-semibold text-gray-900">{extractedData.category}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Available Balance */}
                                    {extractedData.availableBalance && (
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                                            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Available Balance</p>
                                            <p className="text-xl font-bold text-emerald-900">₹ {extractedData.availableBalance}</p>
                                        </div>
                                    )}

                                    {/* Reference Number & Bank Name */}
                                    <div className="space-y-3">
                                        {extractedData.referenceNumber && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reference Number</p>
                                                <p className="text-sm font-semibold text-gray-900 font-mono">{extractedData.referenceNumber}</p>
                                            </div>
                                        )}

                                        {extractedData.bankName && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bank Name</p>
                                                <p className="text-sm font-semibold text-gray-900">{extractedData.bankName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                            </div>
                            <button
                                onClick={fetchTransactionHistory}
                                disabled={historyLoading}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-200"
                            >
                                <svg className={`w-4 h-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {historyLoading ? (
                            <div className="bg-white rounded-xl shadow-lg p-12">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-gray-600 font-medium">Loading transaction history...</p>
                                </div>
                            </div>
                        ) : historyError ? (
                            <div className="bg-white rounded-xl shadow-lg p-12">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-red-600 font-medium">{historyError}</p>
                                </div>
                            </div>
                        ) : transactionHistory.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-12">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 font-medium text-lg">No transactions yet</p>
                                    <p className="text-gray-400 text-sm mt-2">Submit your first transaction message above</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {transactionHistory.map((transaction, index) => (
                                    <div
                                        key={transaction._id || transaction.id || index}
                                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                                    >
                                        {/* Header with Transaction Type */}
                                        <div className={`p-4 ${getTransactionColor(transaction.transactionType)} border-b-2`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {getTransactionIcon(transaction.transactionType)}
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Transaction Type</p>
                                                        <p className="text-base font-bold text-gray-900 capitalize">{transaction.transactionType || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body with Transaction Details */}
                                        <div className="p-4 space-y-3">
                                            {/* Amount - Prominent */}
                                            {transaction.amount && (
                                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Amount</p>
                                                    <p className="text-xl font-bold text-indigo-900">₹ {transaction.amount}</p>
                                                </div>
                                            )}

                                            {/* Date and Via */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {transaction.date && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</p>
                                                        <p className="text-xs font-semibold text-gray-900">{transaction.date}</p>
                                                    </div>
                                                )}
                                                {transaction.via && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Via</p>
                                                        <p className="text-xs font-semibold text-gray-900">{transaction.via}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Account and To */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {transaction.accountNumber && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Account</p>
                                                        <p className="text-xs font-semibold text-gray-900 font-mono">{transaction.accountNumber}</p>
                                                    </div>
                                                )}
                                                {transaction.to && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">To</p>
                                                        <p className="text-xs font-semibold text-gray-900">{transaction.to}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Merchant Name and Category */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {transaction.merchantName && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Merchant</p>
                                                        <p className="text-xs font-semibold text-gray-900">{transaction.merchantName}</p>
                                                    </div>
                                                )}
                                                {transaction.category && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</p>
                                                        <p className="text-xs font-semibold text-gray-900">{transaction.category}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Available Balance */}
                                            {transaction.availableBalance && (
                                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Available Balance</p>
                                                    <p className="text-base font-bold text-emerald-900">₹ {transaction.availableBalance}</p>
                                                </div>
                                            )}

                                            {/* Reference Number */}
                                            {transaction.referenceNumber && (
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reference Number</p>
                                                    <p className="text-xs font-semibold text-gray-900 font-mono break-all">{transaction.referenceNumber}</p>
                                                </div>
                                            )}

                                            {/* Bank Name */}
                                            {transaction.bankName && (
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bank Name</p>
                                                    <p className="text-xs font-semibold text-gray-900">{transaction.bankName}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer with timestamp if available */}
                                        {transaction.createdAt && (
                                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    {new Date(transaction.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        } else if (user?.role.toLowerCase() == "maker" ) {
            return <MakerDashboard />;
        } else if (user?.role === "checker") {
            return (
                <CheckerDashBoard />
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Personal Finance Manager
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user?.username || user?.email}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {user?.role || "User"}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {renderUserContent()}
                </div>
            </main>
        </div>
    );
}

export default Home;