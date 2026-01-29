import { getAcceptedPatterns, getDraftedPatterns, getRejectedPatterns, resubmitPattern, saveAsDraft, submitForApproval, testRegexPattern } from "../services/operations/makerAPI";
import toast from "react-hot-toast";
import { use, useEffect, useState } from "react";

// Maker Dashboard Component
function MakerDashboard() {
    const [regexPattern, setRegexPattern] = useState("");
    const [message, setMessage] = useState("");
    const [testResult, setTestResult] = useState({
        matchFound: false,
        accountNumber: "-1",
        transactionType: "-1",
        amount: "-1",
        date: "-1",
        via: "-1",
        to: "-1",
        availableBalance: "-1",
        referenceNumber: "-1"
    });
    const [draftedPatterns, setDraftedPatterns] = useState([]);
    const [rejectedPatterns, setRejectedPatterns] = useState([]);
    const [acceptedPatterns, setAcceptedPatterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeSection, setActiveSection] = useState("normal");
    const [patternId, setPatternId] = useState(-1);
    const [showSaveButtons, setShowSaveButtons] = useState(true);

    // New fields for bank and merchant details
    const [bankAddress, setBankAddress] = useState("");
    const [bankName, setBankName] = useState("");
    const [merchantName, setMerchantName] = useState("");
    const [transactionCategory, setTransactionCategory] = useState("");
    const [transactionType, setTransactionType] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    // Dropdown options
    const transactionCategories = [
        "Food & Dining",
        "Shopping",
        "Transportation",
        "Entertainment",
        "Bills & Utilities",
        "Healthcare",
        "Travel",
        "Education",
        "Investment",
        "Others"
    ];

    const transactionTypes = [
        "Credit",
        "Debit",
        "Transfer",
        "Payment",
        "Refund",
        "Withdrawal",
        "Deposit"
    ];

    // Fetch all patterns on component mount
    useEffect(() => {
        fetchAllPatterns();
    }, []);

    const fetchAllPatterns = async () => {
        try {
            const [draftedRes, rejectedRes, acceptedRes] = await Promise.all([
                getDraftedPatterns(),
                getRejectedPatterns(),
                getAcceptedPatterns()
            ]);

            if (draftedRes?.data) {
                setDraftedPatterns(draftedRes.data || []);
            }
            if (rejectedRes?.data) {
                setRejectedPatterns(rejectedRes.data || []);
            }
            if (acceptedRes?.data) {
                setAcceptedPatterns(acceptedRes.data || []);
            }
        } catch (error) {
            console.error("Error fetching patterns:", error);
        }
    };

    // Validate additional fields
    const validateFields = () => {
        const errors = {};
        
        if (!bankAddress.trim()) {
            errors.bankAddress = "Bank Address is required";
        }
        
        if (!bankName.trim()) {
            errors.bankName = "Bank Name is required";
        }
        
        if (!merchantName.trim()) {
            errors.merchantName = "Merchant Name is required";
        }
        
        if (!transactionCategory) {
            errors.transactionCategory = "Transaction Category is required";
        }
        
        if (!transactionType) {
            errors.transactionType = "Transaction Type is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleTestRegex = async () => {
        if (!regexPattern.trim() || !message.trim()) {
            setError("Please provide both regex pattern and message");
            return;
        }

        // if (!validateFields()) {
        //     setError("Please fill in all required fields");
        //     return;
        // }

        setTestLoading(true);
        setError("");
        setTestResult({
            matchFound: false,
            accountNumber: "-1",
            transactionType: "-1",
            amount: "-1",
            date: "-1",
            via: "-1",
            to: "-1",
            availableBalance: "-1",
            referenceNumber: "-1"
        });

        try {
            const response = await testRegexPattern(
                regexPattern, 
                message,
                // {
                //     bankAddress,
                //     bankName,
                //     merchantName,
                //     transactionCategory,
                //     transactionType
                // }
            );

            if (response?.data?.matchFound) {
                setTestResult(response.data);
            }
            else{
                toast("No match found, invalid regex pattern or message");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to test regex pattern");
        } finally {
            setTestLoading(false);
        }
    };

    const handleSubmitForApproval = async () => {
        if (!regexPattern.trim() || !message.trim()) {
            setError("Please provide both regex pattern and message");
            return;
        }

        if (!validateFields()) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await submitForApproval(
                regexPattern, 
                message, 
                patternId,
                bankAddress,
                bankName,
                merchantName,
                transactionCategory,
                transactionType
            );

            if (response?.data?.text || response?.status === 200) {
                toast.success("Pattern submitted for approval successfully!");
                setSuccess("Pattern submitted for approval successfully!");
                setRegexPattern("");
                setMessage("");
                setBankAddress("");
                setBankName("");
                setMerchantName("");
                setTransactionCategory("");
                setTransactionType("");
                setFieldErrors({});
                setTestResult({
                    matchFound: false,
                    accountNumber: "-1",
                    transactionType: "-1",
                    amount: "-1",
                    date: "-1",
                    via: "-1",
                    to: "-1",
                    availableBalance: "-1",
                    referenceNumber: "-1"
                });
                await fetchAllPatterns();
                setActiveSection("normal");
            } else {
                toast.error(response?.data?.error || "Failed to submit for approval");
                setError(response?.data?.error || "Failed to submit for approval");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to submit for approval");
        } finally {
            setLoading(false);
        } 
    };

    const handleSaveAsDraft = async () => {
        if (!regexPattern.trim() || !message.trim()) {
            setError("Please provide both regex pattern and message");
            return;
        }

        if (!validateFields()) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await saveAsDraft(
                regexPattern, 
                message, 
                patternId,
                bankAddress,
                bankName,
                merchantName,
                transactionCategory,
                transactionType
            );

            if (response?.data?.text || response?.status === 201) {
                toast.success("Pattern saved as draft successfully!");
                setSuccess("Pattern saved as draft successfully!");
                setRegexPattern("");
                setMessage("");
                setBankAddress("");
                setBankName("");
                setMerchantName("");
                setTransactionCategory("");
                setTransactionType("");
                setFieldErrors({});
                setTestResult({
                    matchFound: false,
                    accountNumber: "-1",
                    transactionType: "-1",
                    amount: "-1",
                    date: "-1",
                    via: "-1",
                    to: "-1",
                    availableBalance: "-1",
                    referenceNumber: "-1"
                });
                await fetchAllPatterns();
                setActiveSection("drafted");
            } else {
                toast.error(response?.data?.error || "Failed to save as draft");
                setError(response.data?.error || "Failed to save as draft");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save as draft");
        } finally {
            setLoading(false);
        }
    };

    const handlePatternClick = (pattern) => {

        setRegexPattern(pattern.regexPattern || pattern.pattern || "");
        setMessage(pattern.message || pattern.text || "");
        setPatternId(pattern.id || pattern._id || null);
        
        // Populate additional fields if available
        setBankAddress(pattern.bankAddress || "");
        setBankName(pattern.bankName || "");
        setMerchantName(pattern.merchantName || "");
        setTransactionCategory(pattern.transactionCategory || "");
        setTransactionType(pattern.transactionType || "");
        setFieldErrors({});

        if(pattern.status == "APPROVED") {
            setShowSaveButtons(false);
        } else {
            setShowSaveButtons(true);
        }

        setTestResult({
            matchFound: false,
            accountNumber: "-1",
            transactionType: "-1",
            amount: "-1",
            date: "-1",
            via: "-1",
            to: "-1",
            availableBalance: "-1",
            referenceNumber: "-1"
        });
        setActiveSection("normal");
    };

    // const handleResubmitPattern = async (patternId) => {
    //     setLoading(true);
    //     setError("");
    //     setSuccess("");

    //     try {
    //         const response = await resubmitPattern(patternId);
    //         if (response?.data || response.status === 200) {
    //             setSuccess("Pattern resubmitted for approval successfully!");
    //             await fetchAllPatterns();
    //             setActiveSection("normal");
    //         } else {
    //             setError(response.data?.message || "Failed to resubmit pattern");
    //         }
    //     } catch (error) {
    //         setError(error.response?.data?.message || "Failed to resubmit pattern");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const renderPatternList = (patterns, type) => {
        if (!patterns || patterns.length === 0) {
            return (
                <div className="text-gray-500 text-center py-8">
                    No {type} patterns found.
                </div>
            );
        }

        // Group patterns by bank address
        const groupedByBankAddress = patterns.reduce((acc, pattern) => {
            const bankAddr = pattern.bankAddress || "Unknown Bank Address";
            if (!acc[bankAddr]) {
                acc[bankAddr] = [];
            }
            acc[bankAddr].push(pattern);
            return acc;
        }, {});

        return (
            <div className="space-y-6">
                {Object.entries(groupedByBankAddress).map(([bankAddr, bankPatterns]) => (
                    <div key={bankAddr} className="border-2 border-indigo-200 rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
                        {/* Bank Address Header */}
                        <div className="mb-4 pb-3 border-b-2 border-indigo-300">
                            <h4 className="text-lg font-bold text-indigo-900 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Bank Address: {bankAddr}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {bankPatterns.length} pattern{bankPatterns.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {/* Patterns for this bank address */}
                        <div className="space-y-3">
                            {bankPatterns.map((data, index) => (
                                <div
                                    key={data.id || data._id || index}
                                    className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:border-indigo-400"
                                    onClick={() => handlePatternClick(data)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            {/* Bank Details */}
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {data.bankName && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {data.bankName}
                                                    </span>
                                                )}
                                                {data.merchantName && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {data.merchantName}
                                                    </span>
                                                )}
                                                {data.transactionCategory && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {data.transactionCategory}
                                                    </span>
                                                )}
                                                {data.transactionType && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        {data.transactionType}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Pattern */}
                                            <div className="mb-2">
                                                <span className="text-xs font-semibold text-gray-500">Regex Pattern:</span>
                                                <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1 break-all border border-gray-200">
                                                    {data.regexPattern || data.pattern || "N/A"}
                                                </p>
                                            </div>

                                            {/* Message */}
                                            <div>
                                                <span className="text-xs font-semibold text-gray-500">Sample Message:</span>
                                                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded border border-gray-200">
                                                    {data.text || data.message || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Maker Dashboard</h2>

            {/* Bank and Merchant Details Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank & Merchant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Address */}
                    <div>
                        <label htmlFor="bankAddress" className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="bankAddress"
                            type="text"
                            value={bankAddress}
                            onChange={(e) => {
                                setBankAddress(e.target.value);
                                if (fieldErrors.bankAddress) {
                                    setFieldErrors({...fieldErrors, bankAddress: ""});
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                fieldErrors.bankAddress ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter bank address..."
                        />
                        {fieldErrors.bankAddress && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.bankAddress}</p>
                        )}
                    </div>

                    {/* Bank Name */}
                    <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="bankName"
                            type="text"
                            value={bankName}
                            onChange={(e) => {
                                setBankName(e.target.value);
                                if (fieldErrors.bankName) {
                                    setFieldErrors({...fieldErrors, bankName: ""});
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                fieldErrors.bankName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter bank name..."
                        />
                        {fieldErrors.bankName && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.bankName}</p>
                        )}
                    </div>

                    {/* Merchant Name */}
                    <div>
                        <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                            Merchant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="merchantName"
                            type="text"
                            value={merchantName}
                            onChange={(e) => {
                                setMerchantName(e.target.value);
                                if (fieldErrors.merchantName) {
                                    setFieldErrors({...fieldErrors, merchantName: ""});
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                fieldErrors.merchantName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter merchant name..."
                        />
                        {fieldErrors.merchantName && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.merchantName}</p>
                        )}
                    </div>

                    {/* Transaction Category */}
                    <div>
                        <label htmlFor="transactionCategory" className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="transactionCategory"
                            value={transactionCategory}
                            onChange={(e) => {
                                setTransactionCategory(e.target.value);
                                if (fieldErrors.transactionCategory) {
                                    setFieldErrors({...fieldErrors, transactionCategory: ""});
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                fieldErrors.transactionCategory ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select a category...</option>
                            {transactionCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.transactionCategory && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.transactionCategory}</p>
                        )}
                    </div>

                    {/* Transaction Type */}
                    <div>
                        <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="transactionType"
                            value={transactionType}
                            onChange={(e) => {
                                setTransactionType(e.target.value);
                                if (fieldErrors.transactionType) {
                                    setFieldErrors({...fieldErrors, transactionType: ""});
                                }
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                fieldErrors.transactionType ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select a type...</option>
                            {transactionTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.transactionType && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.transactionType}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {/* Section 1: Normal - Create New Regex Pattern */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Regex Pattern</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="regexPattern" className="block text-sm font-medium text-gray-700 mb-2">
                            Regex Pattern
                        </label>
                        <textarea
                            id="regexPattern"
                            type="text"
                            value={regexPattern}
                            onChange={(e) => setRegexPattern(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter regex pattern..."
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows="4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter message to test..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleTestRegex}
                            disabled={testLoading || !regexPattern.trim() || !message.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {testLoading ? "Testing..." : "Test Regex"}
                        </button>
                        {
                            setShowSaveButtons && (
                                <>
                                <button
                                    onClick={handleSubmitForApproval}
                                    disabled={loading || !regexPattern.trim() || !message.trim()}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Submitting..." : "Submit for Approval"}
                                </button>
                                <button
                                    onClick={handleSaveAsDraft}
                                    disabled={loading || !regexPattern.trim() || !message.trim()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Save as Draft"}
                                </button>
                                </>
                            )
                        }
                        
                    </div>

                    {/* Test Results */}
                    {/* {testResult && ( */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h4>
                            <div className="mb-2">
                                <span className="text-sm font-medium text-gray-700">Match Found: </span>
                                <span className={`text-sm font-semibold ${testResult?.matchFound ? 'text-green-600' : 'text-red-600'}`}>
                                    {testResult?.matchFound ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {/* {testResult.matchFound && ( */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {/* {testResult.accountNumber && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Account Number:</span>
                                            <p className="text-sm text-gray-900">{testResult?.accountNumber}</p>
                                        </div>
                                    {/* )} */}
                                    {/* {testResult.transactionType && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Transaction Type:</span>
                                            <p className="text-sm text-gray-900">{testResult.transactionType}</p>
                                        </div>
                                    {/* )} */}
                                    {/* {testResult.amount && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Amount:</span>
                                            <p className="text-sm text-gray-900">{testResult.amount}</p>
                                        </div>
                                    {/* )} */}  
                                    {/* {testResult.date && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Date:</span>
                                            <p className="text-sm text-gray-900">{testResult.date}</p>
                                        </div>
                                    {/* )} */}
                                    {/* {testResult.via && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Payment Method:</span>
                                            <p className="text-sm text-gray-900">{testResult.via}</p>
                                        </div>
                                    {/* )} */}  
                                    {/* {testResult.to && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Payed To/ From:</span>
                                            <p className="text-sm text-gray-900">{testResult.to}</p>
                                        </div>
                                    {/* )} */}
                                    {/* {testResult.availableBalance && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Available Balance:</span>
                                            <p className="text-sm text-gray-900">{testResult.availableBalance}</p>
                                        </div>
                                    {/* )} */}
                                    {/* {testResult.referenceNumber && ( */}
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Reference Number:</span>
                                            <p className="text-sm text-gray-900">{testResult.referenceNumber}</p>
                                        </div>
                                    {/* )} */}
                                </div>
                            {/* )} */}
                        </div>
                    {/* )} */}
                </div>
            </div>

            {/* Section 2: Drafted Regex Patterns */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Drafted Regex Patterns</h3>
                {renderPatternList(draftedPatterns, "drafted")}
            </div>

            {/* Section 3: Rejected Regex Patterns */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rejected Regex Patterns</h3>
                {renderPatternList(rejectedPatterns, "rejected")}
            </div>

            {/* Section 4: Accepted Regex Patterns */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Accepted Regex Patterns</h3>
                {renderPatternList(acceptedPatterns, "accepted")}
            </div>
        </div>
    );
}

export default MakerDashboard;