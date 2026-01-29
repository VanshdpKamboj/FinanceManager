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
    const [currentPattern, setCurrentPattern] = useState(null);
    
    // Dialog state for pattern details
    const [showPatternDialog, setShowPatternDialog] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState(null);
    
    // Dropdown states for pagination
    const [draftedDropdownOpen, setDraftedDropdownOpen] = useState(false);
    const [rejectedDropdownOpen, setRejectedDropdownOpen] = useState(false);
    const [acceptedDropdownOpen, setAcceptedDropdownOpen] = useState(false);
    const [draftedPage, setDraftedPage] = useState(1);
    const [rejectedPage, setRejectedPage] = useState(1);
    const [acceptedPage, setAcceptedPage] = useState(1);
    const [currentPatternPage, setCurrentPatternPage] = useState(1);
    const itemsPerPage = 7;
    const currentPatternItemsPerPage = 10;

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

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.pattern-dropdown-container')) {
                setDraftedDropdownOpen(false);
                setRejectedDropdownOpen(false);
                setAcceptedDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
            // Reset to first page when patterns are fetched
            setCurrentPatternPage(1);
        } catch (error) {
            console.error("Error fetching patterns:", error);
        }
    };

    // Auto-extract information from message text (only fills empty fields)
    const extractInfoFromMessage = (messageText, forceExtract = false) => {
        if (!messageText || !messageText.trim()) {
            return;
        }

        const text = messageText.toUpperCase();
        
        // Common bank names to look for
        const bankNames = [
            "HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "PNB", "BOI", "BOB", 
            "CANARA", "UNION", "INDUSIND", "YES", "IDFC", "FEDERAL", "SOUTH INDIAN",
            "BANK OF BARODA", "BANK OF INDIA", "STATE BANK", "PUNJAB NATIONAL"
        ];
        
        // Extract bank name (only if field is empty or forceExtract is true)
        if (forceExtract || !bankName) {
            for (const bank of bankNames) {
                if (text.includes(bank)) {
                    setBankName(bank);
                    break;
                }
            }
        }
        
        // Extract bank address (look for common patterns like "from", "via", "to")
        if (forceExtract || !bankAddress) {
            const addressPatterns = [
                /(?:FROM|VIA|TO|BANK)\s*:?\s*([A-Z0-9\s,.-]+)/i,
                /(?:ACCOUNT|ACC)\s*:?\s*([A-Z0-9\s,.-]+)/i
            ];
            
            for (const pattern of addressPatterns) {
                const match = messageText.match(pattern);
                if (match && match[1]) {
                    const extracted = match[1].trim();
                    if (extracted.length > 5 && extracted.length < 100) {
                        setBankAddress(extracted);
                        break;
                    }
                }
            }
        }
        
        // Extract merchant name (look for patterns like "paid to", "merchant", "to", etc.)
        if (forceExtract || !merchantName) {
            const merchantPatterns = [
                /(?:PAID\s+TO|MERCHANT|TO|PAYMENT\s+TO|DEBIT\s+TO)\s*:?\s*([A-Z\s&.,-]+)/i,
                /(?:AT|FROM)\s+([A-Z\s&.,-]+?)(?:\s+(?:ON|DATE|AMOUNT|RS|INR))/i
            ];
            
            for (const pattern of merchantPatterns) {
                const match = messageText.match(pattern);
                if (match && match[1]) {
                    const extracted = match[1].trim();
                    // Filter out common words that aren't merchant names
                    if (extracted.length > 2 && extracted.length < 50 && 
                        !extracted.match(/^(ACCOUNT|BANK|CARD|DEBIT|CREDIT|PAYMENT)$/i)) {
                        setMerchantName(extracted);
                        break;
                    }
                }
            }
        }
        
        // Extract transaction type
        if (forceExtract || !transactionType) {
            if (text.includes("DEBIT") || text.includes("DEBITED") || text.includes("PAID")) {
                setTransactionType("Debit");
            } else if (text.includes("CREDIT") || text.includes("CREDITED") || text.includes("RECEIVED")) {
                setTransactionType("Credit");
            } else if (text.includes("TRANSFER")) {
                setTransactionType("Transfer");
            } else if (text.includes("PAYMENT")) {
                setTransactionType("Payment");
            } else if (text.includes("REFUND")) {
                setTransactionType("Refund");
            } else if (text.includes("WITHDRAWAL") || text.includes("WITHDRAW")) {
                setTransactionType("Withdrawal");
            } else if (text.includes("DEPOSIT")) {
                setTransactionType("Deposit");
            }
        }
        
        // Extract transaction category based on merchant name or keywords
        if (forceExtract || !transactionCategory) {
            const merchant = (merchantName || "").toUpperCase();
            const messageUpper = text;
            
            if (merchant.match(/(?:RESTAURANT|FOOD|CAFE|PIZZA|BURGER|MCDONALDS|DOMINOS|SWIGGY|ZOMATO)/i) ||
                messageUpper.match(/(?:RESTAURANT|FOOD|CAFE|PIZZA|BURGER|MCDONALDS|DOMINOS|SWIGGY|ZOMATO)/i)) {
                setTransactionCategory("Food & Dining");
            } else if (merchant.match(/(?:AMAZON|FLIPKART|SHOP|MALL|STORE|MARKET)/i) ||
                       messageUpper.match(/(?:AMAZON|FLIPKART|SHOP|MALL|STORE|MARKET)/i)) {
                setTransactionCategory("Shopping");
            } else if (merchant.match(/(?:UBER|OLA|TAXI|CAB|METRO|BUS|TRAIN|TRANSPORT)/i) ||
                       messageUpper.match(/(?:UBER|OLA|TAXI|CAB|METRO|BUS|TRAIN|TRANSPORT)/i)) {
                setTransactionCategory("Transportation");
            } else if (merchant.match(/(?:MOVIE|CINEMA|NETFLIX|SPOTIFY|ENTERTAINMENT)/i) ||
                       messageUpper.match(/(?:MOVIE|CINEMA|NETFLIX|SPOTIFY|ENTERTAINMENT)/i)) {
                setTransactionCategory("Entertainment");
            } else if (merchant.match(/(?:ELECTRICITY|WATER|GAS|PHONE|BILL|UTILITY)/i) ||
                       messageUpper.match(/(?:ELECTRICITY|WATER|GAS|PHONE|BILL|UTILITY)/i)) {
                setTransactionCategory("Bills & Utilities");
            } else if (merchant.match(/(?:HOSPITAL|CLINIC|PHARMACY|MEDICAL|DOCTOR)/i) ||
                       messageUpper.match(/(?:HOSPITAL|CLINIC|PHARMACY|MEDICAL|DOCTOR)/i)) {
                setTransactionCategory("Healthcare");
            } else if (merchant.match(/(?:HOTEL|TRAVEL|FLIGHT|AIRLINE|BOOKING)/i) ||
                       messageUpper.match(/(?:HOTEL|TRAVEL|FLIGHT|AIRLINE|BOOKING)/i)) {
                setTransactionCategory("Travel");
            } else if (merchant.match(/(?:SCHOOL|COLLEGE|UNIVERSITY|EDUCATION|TUITION)/i) ||
                       messageUpper.match(/(?:SCHOOL|COLLEGE|UNIVERSITY|EDUCATION|TUITION)/i)) {
                setTransactionCategory("Education");
            } else if (merchant.match(/(?:INVESTMENT|STOCK|MUTUAL|FUND)/i) ||
                       messageUpper.match(/(?:INVESTMENT|STOCK|MUTUAL|FUND)/i)) {
                setTransactionCategory("Investment");
            }
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
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || "Failed to test regex pattern";
            setError(errorMessage);
            toast.error(errorMessage);
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
                setCurrentPattern(null);
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
                const errorMessage = response?.data?.error || response?.data?.message || "Failed to submit for approval";
                toast.error(errorMessage);
                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || "Failed to submit for approval";
            setError(errorMessage);
            toast.error(errorMessage);
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
                setCurrentPattern(null);
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
                const errorMessage = response?.data?.error || response?.data?.message || "Failed to save as draft";
                toast.error(errorMessage);
                setError(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || "Failed to save as draft";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePatternClick = (pattern) => {
        // Open dialog instead of directly copying
        setSelectedPattern(pattern);
        setShowPatternDialog(true);
    };

    const handlePastePattern = () => {
        if (!selectedPattern) return;
        
        const pattern = selectedPattern;
        setRegexPattern(pattern.regexPattern || pattern.pattern || "");
        const messageText = pattern.message || pattern.text || "";
        setMessage(messageText);
        setPatternId(pattern.id || pattern._id || null);
        
        // Set current pattern for the table display
        setCurrentPattern(pattern);
        
        // Populate additional fields from pattern data first
        setBankAddress(pattern.bankAddress || "");
        setBankName(pattern.bankName || "");
        setMerchantName(pattern.merchantName || "");
        setTransactionCategory(pattern.transactionCategory || "");
        setTransactionType(pattern.transactionType || "");
        
        // If any fields are missing, try to extract from message
        if (!pattern.bankAddress || !pattern.bankName || !pattern.merchantName || 
            !pattern.transactionCategory || !pattern.transactionType) {
            // Use setTimeout to ensure state updates are complete before extraction
            setTimeout(() => {
                extractInfoFromMessage(messageText, false);
            }, 100);
        }
        
        setFieldErrors({});

        // Disable Save/Approval buttons only for APPROVED patterns
        const patternStatus = (pattern.status || "").toUpperCase();
        if(patternStatus === "APPROVED" || patternStatus === "ACCEPTED" || patternStatus === "ACCEPT") {
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
        
        // Close dialog
        setShowPatternDialog(false);
        setSelectedPattern(null);
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

    // Render paginated dropdown for patterns
    const renderPatternDropdown = (patterns, type, isOpen, setIsOpen, currentPage, setCurrentPage, closeOtherDropdowns) => {
        if (!patterns || patterns.length === 0) {
            return (
                <div className="relative pattern-dropdown-container">
                    <button
                        onClick={() => {
                            // Close other dropdowns when opening this one
                            if (closeOtherDropdowns) {
                                closeOtherDropdowns();
                            }
                            setIsOpen(!isOpen);
                        }}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-left flex justify-between items-center hover:bg-gray-200"
                    >
                        <span className="text-gray-700">No {type} patterns found</span>
                        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            );
        }

        const totalPages = Math.ceil(patterns.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPagePatterns = patterns.slice(startIndex, endIndex);

        const getStatusColor = (status) => {
            const statusUpper = (status || "").toUpperCase();
            if (statusUpper === "REJECTED" || statusUpper === "REJECT") {
                return "text-red-700 bg-red-100 border-red-300";
            } else if (statusUpper === "APPROVED" || statusUpper === "ACCEPTED" || statusUpper === "ACCEPT") {
                return "text-green-700 bg-green-100 border-green-300";
            } else if (statusUpper === "DRAFTED" || statusUpper === "DRAFT" || statusUpper === "PENDING") {
                return "text-gray-700 bg-gray-100 border-gray-300";
            }
            return "text-gray-600 bg-gray-50 border-gray-200";
        };

        const getStatusText = (status, type) => {
            const statusUpper = (status || "").toUpperCase();
            if (statusUpper === "REJECTED" || statusUpper === "REJECT") {
                return "Rejected";
            } else if (statusUpper === "APPROVED" || statusUpper === "ACCEPTED" || statusUpper === "ACCEPT") {
                return "Approved";
            } else if (statusUpper === "DRAFTED" || statusUpper === "DRAFT") {
                return "Drafted";
            } else if (statusUpper === "PENDING") {
                return "Pending";
            }
            return type === "drafted" ? "Drafted" : type === "rejected" ? "Rejected" : "Approved";
        };

        return (
            <div className="relative pattern-dropdown-container ">
                <button
                    onClick={() => {
                        // Close other dropdowns when opening this one
                        if (closeOtherDropdowns) {
                            closeOtherDropdowns();
                        }
                        setIsOpen(!isOpen);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-left flex justify-between items-center hover:bg-gray-200"
                >
                    <span className="text-gray-700 font-medium">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Patterns ({patterns.length})
                    </span>
                    <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {isOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-2 space-y-2">
                            {currentPagePatterns.map((pattern, index) => (
                                <div
                                    key={pattern.id || pattern._id || index}
                                    onClick={() => {
                                        handlePatternClick(pattern);
                                        setIsOpen(false);
                                    }}
                                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {pattern.message || pattern.text || "No message"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                Pattern: {pattern.regexPattern || pattern.pattern || "N/A"}
                                            </p>
                                        </div>
                                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(pattern.status || type)}`}>
                                            {getStatusText(pattern.status, type)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="border-t border-gray-200 p-2 flex items-center justify-between">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (currentPage > 1) {
                                            setCurrentPage(currentPage - 1);
                                        }
                                    }}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (currentPage < totalPages) {
                                            setCurrentPage(currentPage + 1);
                                        }
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 p-6 min-h-screen">
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700 ${
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700 ${
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700 ${
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700 ${
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
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700 ${
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700"
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
                            onChange={(e) => {
                                setMessage(e.target.value);
                                // Auto-extract information when message changes
                                extractInfoFromMessage(e.target.value);
                            }}
                            onBlur={(e) => {
                                // Also extract on blur in case user pastes content
                                if (e.target.value) {
                                    extractInfoFromMessage(e.target.value);
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-700 focus:border-emerald-700"
                            placeholder="Enter message to test..."
                        />
                    </div>
                    <div className="flex gap-3 justify-between">
                        <div className="flex gap-3">
                            <button
                                onClick={handleTestRegex}
                                disabled={testLoading || !regexPattern.trim() || !message.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {testLoading ? "Testing..." : "Test Regex"}
                            </button>
                            <button
                                onClick={handleSubmitForApproval}
                                disabled={!showSaveButtons || loading || !regexPattern.trim() || !message.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Submitting..." : "Submit for Approval"}
                            </button>
                            <button
                                onClick={handleSaveAsDraft}
                                disabled={!showSaveButtons || loading || !regexPattern.trim() || !message.trim()}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save as Draft"}
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                // Clear all fields
                                setRegexPattern("");
                                setMessage("");
                                setBankAddress("");
                                setBankName("");
                                setMerchantName("");
                                setTransactionCategory("");
                                setTransactionType("");
                                setFieldErrors({});
                                setPatternId(-1);
                                setCurrentPattern(null);
                                setShowSaveButtons(true);
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
                                setError("");
                                setSuccess("");
                                toast.success("All fields cleared!");
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Clear All
                        </button>
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
                    
                    {/* Current Pattern Section */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Pattern</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pattern
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(() => {
                                        // Combine all patterns
                                        const allPatterns = [
                                            ...draftedPatterns.map(p => ({ ...p, status: p.status || "DRAFTED" })),
                                            ...rejectedPatterns.map(p => ({ ...p, status: p.status || "REJECTED" })),
                                            ...acceptedPatterns.map(p => ({ ...p, status: p.status || "APPROVED" }))
                                        ];

                                        // Calculate pagination
                                        const totalPages = Math.ceil(allPatterns.length / currentPatternItemsPerPage);
                                        const startIndex = (currentPatternPage - 1) * currentPatternItemsPerPage;
                                        const endIndex = startIndex + currentPatternItemsPerPage;
                                        const currentPagePatterns = allPatterns.slice(startIndex, endIndex);

                                        const getStatusDisplay = (pattern) => {
                                            const status = (pattern.status || "").toUpperCase();
                                            let statusText = "";
                                            let statusClass = "";
                                            
                                            if (status === "REJECTED" || status === "REJECT") {
                                                statusText = "Rejected";
                                                statusClass = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200";
                                            } else if (status === "APPROVED" || status === "ACCEPTED" || status === "ACCEPT") {
                                                statusText = "Approved";
                                                statusClass = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-300";
                                            } else if (status === "DRAFTED" || status === "DRAFT" || status === "PENDING") {
                                                statusText = status === "PENDING" ? "Pending" : "Drafted";
                                                statusClass = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-300";
                                            } else {
                                                statusText = "Pending";
                                                statusClass = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-300";
                                            }
                                            
                                            return { statusText, statusClass };
                                        };

                                        if (allPatterns.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No patterns found. Create a pattern to see it here.
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return currentPagePatterns.map((pattern, index) => {
                                            const { statusText, statusClass } = getStatusDisplay(pattern);
                                            return (
                                                <tr 
                                                    key={pattern.id || pattern._id || index}
                                                    onClick={() => handlePatternClick(pattern)}
                                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-mono text-gray-900 break-all max-w-md">
                                                            {pattern.regexPattern || pattern.pattern || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 break-words max-w-md">
                                                            {pattern.message || pattern.text || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={statusClass}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Controls for Current Pattern Table */}
                        {(() => {
                            const allPatterns = [
                                ...draftedPatterns,
                                ...rejectedPatterns,
                                ...acceptedPatterns
                            ];
                            const totalPages = Math.ceil(allPatterns.length / currentPatternItemsPerPage);
                            
                            if (totalPages <= 1) return null;
                            
                            return (
                                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                    <button
                                        onClick={() => {
                                            if (currentPatternPage > 1) {
                                                setCurrentPatternPage(currentPatternPage - 1);
                                            }
                                        }}
                                        disabled={currentPatternPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page <span className="font-semibold">{currentPatternPage}</span> of <span className="font-semibold">{totalPages}</span>
                                    </span>
                                    <button
                                        onClick={() => {
                                            if (currentPatternPage < totalPages) {
                                                setCurrentPatternPage(currentPatternPage + 1);
                                            }
                                        }}
                                        disabled={currentPatternPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Section 2: Drafted Regex Patterns */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Drafted Regex Patterns</h3>
                {renderPatternDropdown(
                    draftedPatterns,
                    "drafted",
                    draftedDropdownOpen,
                    setDraftedDropdownOpen,
                    draftedPage,
                    setDraftedPage,
                    () => {
                        setRejectedDropdownOpen(false);
                        setAcceptedDropdownOpen(false);
                    }
                )}
            </div>

            {/* Section 3: Rejected Regex Patterns */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rejected Regex Patterns</h3>
                {renderPatternDropdown(
                    rejectedPatterns,
                    "rejected",
                    rejectedDropdownOpen,
                    setRejectedDropdownOpen,
                    rejectedPage,
                    setRejectedPage,
                    () => {
                        setDraftedDropdownOpen(false);
                        setAcceptedDropdownOpen(false);
                    }
                )}
            </div>

            {/* Section 4: Accepted Regex Patterns */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Accepted Regex Patterns</h3>
                {renderPatternDropdown(
                    acceptedPatterns,
                    "accepted",
                    acceptedDropdownOpen,
                    setAcceptedDropdownOpen,
                    acceptedPage,
                    setAcceptedPage,
                    () => {
                        setDraftedDropdownOpen(false);
                        setRejectedDropdownOpen(false);
                    }
                )}
            </div>

            {/* Pattern Details Dialog */}
            {showPatternDialog && selectedPattern && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">Pattern Details</h3>
                                <button
                                    onClick={() => {
                                        setShowPatternDialog(false);
                                        setSelectedPattern(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div className="mb-6">
                                <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                    ((selectedPattern.status || "").toUpperCase() === "REJECTED" || (selectedPattern.status || "").toUpperCase() === "REJECT")
                                        ? "bg-red-100 text-red-800 border border-red-300"
                                        : ((selectedPattern.status || "").toUpperCase() === "APPROVED" || (selectedPattern.status || "").toUpperCase() === "ACCEPTED" || (selectedPattern.status || "").toUpperCase() === "ACCEPT")
                                        ? "bg-green-100 text-green-800 border border-green-300"
                                        : "bg-gray-100 text-gray-800 border border-gray-300"
                                }`}>
                                    Status: {
                                        ((selectedPattern.status || "").toUpperCase() === "REJECTED" || (selectedPattern.status || "").toUpperCase() === "REJECT")
                                            ? "Rejected"
                                            : ((selectedPattern.status || "").toUpperCase() === "APPROVED" || (selectedPattern.status || "").toUpperCase() === "ACCEPTED" || (selectedPattern.status || "").toUpperCase() === "ACCEPT")
                                            ? "Approved"
                                            : ((selectedPattern.status || "").toUpperCase() === "DRAFTED" || (selectedPattern.status || "").toUpperCase() === "DRAFT")
                                            ? "Drafted"
                                            : "Pending"
                                    }
                                </span>
                            </div>

                            {/* Pattern Details Grid */}
                            <div className="space-y-4">
                                {/* Regex Pattern */}
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Regex Pattern</label>
                                    <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm break-all">
                                        {selectedPattern.regexPattern || selectedPattern.pattern || "N/A"}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                    <div className="bg-white p-3 rounded border border-gray-300 text-sm break-words">
                                        {selectedPattern.message || selectedPattern.text || "N/A"}
                                    </div>
                                </div>

                                {/* Bank & Merchant Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                                        <div className="bg-white p-3 rounded border border-gray-300 text-sm">
                                            {selectedPattern.bankName || "N/A"}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Address</label>
                                        <div className="bg-white p-3 rounded border border-gray-300 text-sm">
                                            {selectedPattern.bankAddress || "N/A"}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Merchant Name</label>
                                        <div className="bg-white p-3 rounded border border-gray-300 text-sm">
                                            {selectedPattern.merchantName || "N/A"}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                                        <div className="bg-white p-3 rounded border border-gray-300 text-sm">
                                            {selectedPattern.transactionType || "N/A"}
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Category</label>
                                        <div className="bg-white p-3 rounded border border-gray-300 text-sm">
                                            {selectedPattern.transactionCategory || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowPatternDialog(false);
                                        setSelectedPattern(null);
                                    }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePastePattern}
                                    className="px-6 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 font-medium"
                                >
                                    Paste into Fields
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MakerDashboard;