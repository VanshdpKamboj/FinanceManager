import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../reducer/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { processBulkTransactionMessages } from "../services/operations/transactionAPI";
import CheckerDashBoard from "./CheckerDashBoard";
import MakerDashboard from "./MakerDashboard";

// Theme hook
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'green';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, setTheme];
};

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
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    
    // Bulk message parser states
    const [jsonFile, setJsonFile] = useState(null);
    const [jsonFileName, setJsonFileName] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkError, setBulkError] = useState("");
    const [bulkResponse, setBulkResponse] = useState(null);
    const [showBulkParser, setShowBulkParser] = useState(false);
    
    // Active tab state - 'message-parser' | 'json-parser' | 'transactions'
    const [activeTab, setActiveTab] = useState('message-parser');
    
    // Theme state
    const [theme, setTheme] = useTheme();

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

            if (response.data.matchFound) {
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

    // Handle JSON file upload
    const handleJsonFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/json" || file.name.endsWith('.json')) {
                setJsonFile(file);
                setJsonFileName(file.name);
                setBulkError("");
            } else {
                setBulkError("Please upload a valid JSON file");
                setJsonFile(null);
                setJsonFileName("");
            }
        }
    };

    // Handle bulk message processing
    const handleBulkProcess = async () => {
        if (!jsonFile) {
            setBulkError("Please select a JSON file");
            return;
        }

        setBulkLoading(true);
        setBulkError("");
        setBulkResponse(null);

        try {
            // Read JSON file
            const fileContent = await jsonFile.text();
            const jsonData = JSON.parse(fileContent);

            // Validate JSON structure
            if (!Array.isArray(jsonData)) {
                setBulkError("JSON file must contain an array of messages");
                return;
            }

            // Validate each message has required fields
            const validMessages = jsonData.filter(item => {
                return item.message && item.bankAddress;
            });

            if (validMessages.length === 0) {
                setBulkError("No valid messages found. Each message must have 'message' and 'bankAddress' fields");
                return;
            }

            // Get user ID from reducer
            const userId = user._id || user.id;

            // Call the API
            const response = await processBulkTransactionMessages(userId, validMessages);

            if (response.data) {
                setBulkResponse(response.data);
                // Refresh transaction history after bulk processing
                fetchTransactionHistory();
            }
        } catch (error) {
            console.error("Error processing bulk messages:", error);
            if (error.message && error.message.includes("JSON")) {
                setBulkError("Invalid JSON file format");
            } else {
                setBulkError(error.response?.data?.error || "Failed to process bulk messages. Please try again.");
            }
        } finally {
            setBulkLoading(false);
        }
    };

    // Clear bulk upload
    const handleClearBulk = () => {
        setJsonFile(null);
        setJsonFileName("");
        setBulkError("");
        setBulkResponse(null);
    };

    const getTransactionIcon = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('credit') || lowerType.includes('salary')) {
            return (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            );
        } else if (lowerType.includes('debit') || lowerType.includes('withdrawal')) {
            return (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            return 'border-green-300 bg-green-100';
        } else if (lowerType.includes('debit') || lowerType.includes('withdrawal')) {
            return 'border-red-300 bg-red-100';
        }
        return 'border-blue-200 bg-blue-50';
    };

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setSelectedTransaction(null);
    };

    // Show different content based on user type
    const renderUserContent = () => {
        if (user?.role === "Normal_user") {
            return (
                <div className="max-w-5xl mx-auto">
                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setActiveTab('message-parser')}
                                className={`flex items-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === 'message-parser'
                                        ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-lg'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Message Parser
                            </button>
                            <button
                                onClick={() => setActiveTab('json-parser')}
                                className={`flex items-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === 'json-parser'
                                        ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-lg'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                JSON Parser
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`flex items-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === 'transactions'
                                        ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-lg'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Recent Transactions
                            </button>
                        </div>
                    </div>

                    {/* Message Parser Tab */}
                    {activeTab === 'message-parser' && (
                        <div>
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
                                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition duration-200"
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
                                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition duration-200 font-mono text-sm"
                                        placeholder="Example: INR 2,500.00 debited from A/c XX5678 on 10-Jan-26 via UPI to Z. Avl Bal: INR 15,420.50. Ref: 60123456789"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || !message.trim() || !bankAddress.trim()}
                                        className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg"
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
                                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-xl p-4">
                                            <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide mb-1">Amount</p>
                                            <p className="text-2xl font-bold text-emerald-900">₹ {extractedData.amount}</p>
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
                        </div>
                    )}

                    {/* JSON Parser Tab */}
                    {activeTab === 'json-parser' && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bulk Message Parser</h2>
                                <p className="text-gray-600">Upload a JSON file with multiple transaction messages to process them in bulk</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>JSON Format:</strong> Upload a JSON file with an array of objects. Each object must have <code className="bg-blue-100 px-1 rounded">message</code> and <code className="bg-blue-100 px-1 rounded">bankAddress</code> fields.
                                    </p>
                                    <div className="mt-2 bg-blue-100 rounded p-2 text-xs font-mono text-blue-900">
                                        {`[
  {
    "message": "INR 2,500.00 debited from A/c...",
    "bankAddress": "HDFC-CA-01"
  },
  {
    "message": "INR 5,000.00 credited to A/c...",
    "bankAddress": "ICICI-SA-01"
  }
]`}
                                    </div>
                                </div>

                                {bulkError && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            {bulkError}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-4">
                                    <label className="flex-1">
                                        <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-purple-400 focus:outline-none">
                                            <div className="flex flex-col items-center space-y-2">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="font-medium text-gray-600">
                                                    {jsonFileName || "Click to upload JSON file"}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    JSON files only
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".json,application/json"
                                                onChange={handleJsonFileChange}
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleBulkProcess}
                                        disabled={bulkLoading || !jsonFile}
                                        className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-lg"
                                    >
                                        {bulkLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing Bulk Messages...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                Process Bulk Messages
                                            </>
                                        )}
                                    </button>
                                    {(jsonFile || bulkResponse) && (
                                        <button
                                            type="button"
                                            onClick={handleClearBulk}
                                            className="px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Bulk Processing Results */}
                                {bulkResponse && (
                                    <div className="mt-6 space-y-4">
                                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-xl p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <svg className="w-6 h-6 mr-2 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Processing Summary
                                            </h4>
                                            
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Messages</p>
                                                    <p className="text-2xl font-bold text-gray-900">{bulkResponse.totalMessages}</p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
                                                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Successful</p>
                                                    <p className="text-2xl font-bold text-green-700">{bulkResponse.successfullyProcessed}</p>
                                                </div>
                                                <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
                                                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">Failed</p>
                                                    <p className="text-2xl font-bold text-red-700">{bulkResponse.failed}</p>
                                                </div>
                                            </div>

                                            {/* Successful Transactions */}
                                            {bulkResponse.successfulTransactions && bulkResponse.successfulTransactions.length > 0 && (
                                                <div className="mb-6">
                                                    <h5 className="text-md font-semibold text-green-700 mb-3 flex items-center">
                                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Successful Transactions ({bulkResponse.successfulTransactions.length})
                                                    </h5>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {bulkResponse.successfulTransactions.map((transaction, index) => (
                                                            <div key={index} className="bg-white border border-green-200 rounded-lg p-3 flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900">₹ {transaction.amount}</p>
                                                                        <p className="text-xs text-gray-600">{transaction.transactionType} - {transaction.bankName}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">Success</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Failed Messages */}
                                            {bulkResponse.failedMessages && bulkResponse.failedMessages.length > 0 && (
                                                <div>
                                                    <h5 className="text-md font-semibold text-red-700 mb-3 flex items-center">
                                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        Failed Messages ({bulkResponse.failedMessages.length})
                                                    </h5>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {bulkResponse.failedMessages.map((failed, index) => (
                                                            <div key={index} className="bg-white border border-red-200 rounded-lg p-3">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                                                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">Failed</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600 mb-1"><strong>Bank:</strong> {failed.bankAddress}</p>
                                                                <p className="text-xs text-red-600"><strong>Error:</strong> {failed.error}</p>
                                                                <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-50 p-2 rounded truncate">{failed.message}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        </div>
                    )}

                    {/* Recent Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h2>
                                <p className="text-gray-600">View all your extracted transactions</p>
                            </div>

                            <div className="flex justify-end mb-6">
                                <button
                                    onClick={fetchTransactionHistory}
                                    disabled={historyLoading}
                                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:opacity-50 transition duration-200"
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
                                    <svg className="animate-spin h-12 w-12 text-emerald-700 mb-4" fill="none" viewBox="0 0 24 24">
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
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {transactionHistory.map((transaction, index) => {
                                    const isCredit = transaction.transactionType?.toLowerCase().includes('credit') || 
                                                   transaction.transactionType?.toLowerCase().includes('salary');
                                    const isDebit = transaction.transactionType?.toLowerCase().includes('debit');
                                    
                                    return (
                                    <div
                                        key={transaction._id || transaction.id || index}
                                        onClick={() => handleTransactionClick(transaction)}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-emerald-400"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    {getTransactionIcon(transaction.transactionType)}
                                                    <div className="flex-1">
                                                        <p className="text-base font-semibold text-gray-900">
                                                            Paid to {transaction.to || transaction.merchantName || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {transaction.date || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className={`text-lg font-bold ${
                                                        isCredit ? 'text-green-600' : 
                                                        isDebit ? 'text-red-600' : 
                                                        'text-gray-900'
                                                    }`}>
                                                        ₹ {transaction.amount || 'N/A'}
                                                    </p>
                                                    {transaction.availableBalance && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Avl. Bal: ₹ {transaction.availableBalance}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Transaction Details Dialog */}
                        {showDialog && selectedTransaction && (
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                                onClick={closeDialog}
                            >
                                <div 
                                    className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Dialog Header */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                                        <button
                                            onClick={closeDialog}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Dialog Body */}
                                    <div className="p-6 space-y-4">
                                        {/* Transaction Type Banner */}
                                        {selectedTransaction.transactionType && (
                                            <div className={`border-2 rounded-xl p-4 ${getTransactionColor(selectedTransaction.transactionType)}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {getTransactionIcon(selectedTransaction.transactionType)}
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Transaction Type</p>
                                                            <p className="text-lg font-bold text-gray-900 capitalize">{selectedTransaction.transactionType}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Amount */}
                                        {selectedTransaction.amount && (
                                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-xl p-4">
                                                <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide mb-1">Amount</p>
                                                <p className="text-2xl font-bold text-emerald-900">₹ {selectedTransaction.amount}</p>
                                            </div>
                                        )}

                                        {/* Grid of Details */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedTransaction.date && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Date</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.date}</p>
                                                </div>
                                            )}

                                            {selectedTransaction.via && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment Mode</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.via}</p>
                                                </div>
                                            )}

                                            {selectedTransaction.accountNumber && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Account Number</p>
                                                    <p className="text-sm font-semibold text-gray-900 font-mono">XXXX-{selectedTransaction.accountNumber}</p>
                                                </div>
                                            )}

                                            {selectedTransaction.to && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Paid To / From</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.to}</p>
                                                </div>
                                            )}

                                            {selectedTransaction.merchantName && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Merchant Name</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.merchantName}</p>
                                                </div>
                                            )}

                                            {selectedTransaction.category && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.category}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Available Balance */}
                                        {selectedTransaction.availableBalance && (
                                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Available Balance</p>
                                                <p className="text-xl font-bold text-emerald-900">₹ {selectedTransaction.availableBalance}</p>
                                            </div>
                                        )}

                                        {/* Reference Number & Bank Name */}
                                        <div className="space-y-3">
                                            {selectedTransaction.referenceNumber && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reference Number</p>
                                                    <p className="text-sm font-semibold text-gray-900 font-mono">{selectedTransaction.referenceNumber}</p>
                                                </div>
                                            )}

                                            {selectedTransaction.bankName && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bank Name</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.bankName}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        {selectedTransaction.createdAt && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Created At</p>
                                                <p className="text-sm font-semibold text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    )}
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
        <div className="min-h-screen" style={{ backgroundColor: 'var(--primary-bg)' }}>
            <nav style={{ backgroundColor: 'var(--navbar-bg)' }} className="shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold" style={{ color: 'var(--navbar-text)' }}>
                                Personal Finance Manager
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Theme Switcher */}
                            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                onClick={() => setTheme('green')}
                                className={`p-2 rounded-md transition-all ${
                                    theme === 'green' ? 'bg-emerald-700 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                                    title="Green Theme"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setTheme('white')}
                                    className={`p-2 rounded-md transition-all ${
                                        theme === 'white' ? 'bg-white text-gray-900 shadow-md border border-gray-300' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title="White Theme"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setTheme('black')}
                                    className={`p-2 rounded-md transition-all ${
                                        theme === 'black' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                    title="Black Theme"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                    </svg>
                                </button>
                            </div>
                            <span className="text-sm" style={{ color: 'var(--navbar-text)' }}>
                                Welcome, {user?.username || user?.email}
                            </span>
                            <span className="text-xs px-2 py-1 rounded" style={{ 
                                backgroundColor: 'var(--secondary-bg)', 
                                color: 'var(--text-secondary)' 
                            }}>
                                {user?.role || "User"}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm transition-colors"
                                style={{ color: theme === 'green' || theme === 'black' ? 'white' : '#00704A' }}
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