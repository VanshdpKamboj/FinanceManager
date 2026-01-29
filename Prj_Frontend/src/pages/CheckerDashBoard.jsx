import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    getPendingPatterns,
    getApprovedPatterns,
    approvePattern,
    rejectPattern
} from '../services/operations/checkerAPI';

import { testRegexPattern } from '../services/operations/makerAPI';

const CheckerDashBoard = () => {
    const [regex, setRegex] = useState('');
    const [message, setMessage] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [pendingPatterns, setPendingPatterns] = useState([]);
    const [approvedPatterns, setApprovedPatterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [selectedPatternId, setSelectedPatternId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState(null);
    const [dialogType, setDialogType] = useState(''); // 'pending' or 'approved'

    // Fetch pending and approved patterns on component mount
    useEffect(() => {
        fetchPatterns();
    }, []);

    const fetchPatterns = async () => {
        setLoading(true);
        try {
            const [pendingResponse, approvedResponse] = await Promise.all([
                getPendingPatterns(),
                getApprovedPatterns()
            ]);

            ;
            ;
            if (pendingResponse.data) {
                setPendingPatterns(pendingResponse.data || []);
            }

            if (approvedResponse.data) {
                setApprovedPatterns(approvedResponse.data || []);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Failed to fetch patterns';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        if (!regex.trim()) {
            toast.error('Please enter a regex pattern');
            return;
        }

        if (!message.trim()) {
            toast.error('Please enter a message to test');
            return;
        }

        setTestLoading(true);
        try {
            const response = await testRegexPattern(regex, message);
            
            if (response?.data) {
                setTestResult(response.data);
                toast.success('Regex tested successfully!');
            } else {
                const errorMessage = response?.data?.error || response?.data?.message || 'Test failed';
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Failed to test regex';
            toast.error(errorMessage);
            setTestResult(null);
        } finally {
            setTestLoading(false);
        }
    };

    const handleApprove = async (patternId) => {
        if (!patternId) {
            toast.error('Please select a pattern to approve');
            return;
        }

        try {
            const response = await approvePattern(patternId);

            if (response) {
                toast.success('Pattern approved successfully!');
                await fetchPatterns();
                setDialogOpen(false);
                setSelectedPattern(null);
            } else {
                const errorMessage = response?.data?.error || response?.data?.message || 'Approval failed';
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.response?.data || 'Failed to approve pattern';
            toast.error(errorMessage);
        }
    };

    const handleReject = async (patternId) => {
        if (!patternId) {
            toast.error('Please select a pattern to reject');
            return;
        }

        try {
            const response = await rejectPattern(patternId);
            
            if (response.data) {
                toast.success('Pattern rejected successfully!');
                await fetchPatterns();
                setDialogOpen(false);
                setSelectedPattern(null);
            } else {
                const errorMessage = response?.data?.error || response?.data?.message || 'Rejection failed';
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Failed to reject pattern';
            toast.error(errorMessage);
        }
    };

    const handlePatternClick = (pattern, type) => {
        setSelectedPattern(pattern);
        setDialogType(type);
        setDialogOpen(true);
    };

    const handlePasteToTest = () => {
        if (selectedPattern) {
            setRegex(selectedPattern.pattern);
            setMessage(selectedPattern.text);
            setDialogOpen(false);
            toast.success('Pattern pasted to test fields');
        }
    };

    const truncateText = (text, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Checker Dashboard</h1>

                {/* Test Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Regex Pattern</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Regex Pattern
                            </label>
                            <textarea
                                type="text"
                                value={regex}
                                rows={5}
                                onChange={(e) => setRegex(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
                                placeholder="Enter regex pattern (e.g., \d{10})"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Test Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
                                placeholder="Enter message to test against the regex"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleTest}
                                disabled={testLoading}
                                className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {testLoading ? 'Testing...' : 'Test'}
                            </button>
                        </div>

                        {/* Test Results */}
                    {testResult && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h4>
                            <div className="mb-2">
                                <span className="text-sm font-medium text-gray-700">Match Found: </span>
                                <span className={`text-sm font-semibold ${testResult.matchFound ? 'text-green-600' : 'text-red-600'}`}>
                                    {testResult.matchFound ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {testResult.matchFound && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {testResult.accountNumber && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Account Number:</span>
                                            <p className="text-sm text-gray-900">{testResult.accountNumber}</p>
                                        </div>
                                    )}
                                    {testResult.transactionType && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Transaction Type:</span>
                                            <p className="text-sm text-gray-900">{testResult.transactionType}</p>
                                        </div>
                                    )}
                                    {testResult.amount && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Amount:</span>
                                            <p className="text-sm text-gray-900">{testResult.amount}</p>
                                        </div>
                                    )}
                                    {testResult.date && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Date:</span>
                                            <p className="text-sm text-gray-900">{testResult.date}</p>
                                        </div>
                                    )}
                                    {testResult.via && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Payment Method:</span>
                                            <p className="text-sm text-gray-900">{testResult.via}</p>
                                        </div>
                                    )}
                                    {testResult.to && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Payed To/ From:</span>
                                            <p className="text-sm text-gray-900">{testResult.to}</p>
                                        </div>
                                    )}
                                    {testResult.availableBalance && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Available Balance:</span>
                                            <p className="text-sm text-gray-900">{testResult.availableBalance}</p>
                                        </div>
                                    )}
                                    {testResult.referenceNumber && (
                                        <div>
                                            <span className="text-xs font-semibold text-gray-500">Reference Number:</span>
                                            <p className="text-sm text-gray-900">{testResult.referenceNumber}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </div>

                {/* Pending Patterns Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Patterns</h2>
                    
                    {loading ? (
                        <p className="text-gray-600">Loading patterns...</p>
                    ) : pendingPatterns.length === 0 ? (
                        <p className="text-gray-600">No pending patterns</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingPatterns.map((pattern) => (
                                <div
                                    key={pattern.id}
                                    onClick={() => handlePatternClick(pattern, 'pending')}
                                    className="p-4 border-2 border-gray-400 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-semibold text-gray-800 bg-gray-300 px-2 py-1 rounded">PENDING</span>
                                                <span className="text-xs text-gray-500">ID: {pattern.id}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">Regex: </span>
                                                <span className="font-mono text-gray-900">{truncateText(pattern.pattern, 40)}</span>
                                            </div>
                                            <div className="text-sm mt-1">
                                                <span className="font-medium text-gray-700">Message: </span>
                                                <span className="text-gray-900">{truncateText(pattern.text, 60)}</span>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Approved Patterns Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Approved Patterns</h2>
                    
                    {loading ? (
                        <p className="text-gray-600">Loading patterns...</p>
                    ) : approvedPatterns.length === 0 ? (
                        <p className="text-gray-600">No approved patterns</p>
                    ) : (
                        <div className="space-y-3">
                            {approvedPatterns.map((pattern) => (
                                <div
                                    key={pattern.id}
                                    onClick={() => handlePatternClick(pattern, 'approved')}
                                    className="p-4 border-2 border-green-300 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">APPROVED</span>
                                                <span className="text-xs text-gray-500">ID: {pattern.id}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">Regex: </span>
                                                <span className="font-mono text-gray-900">{truncateText(pattern.pattern, 40)}</span>
                                            </div>
                                            <div className="text-sm mt-1">
                                                <span className="font-medium text-gray-700">Message: </span>
                                                <span className="text-gray-900">{truncateText(pattern.text, 60)}</span>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog Modal */}
            {dialogOpen && selectedPattern && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className={`sticky top-0 p-6 border-b ${dialogType === 'approved' ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-300'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-bold text-gray-800">Pattern Details</h3>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded ${
                                        dialogType === 'approved' 
                                            ? 'bg-green-200 text-green-800' 
                                            : 'bg-gray-300 text-gray-800'
                                    }`}>
                                        {dialogType.toUpperCase()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setDialogOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pattern ID</label>
                                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    {selectedPattern.id}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Regex Pattern</label>
                                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                    <code className="text-gray-900 font-mono text-sm break-all">
                                        {selectedPattern.pattern}
                                    </code>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Test Message</label>
                                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
                                        {selectedPattern.text}
                                    </p>
                                </div>
                            </div>

                            {selectedPattern.createdBy && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Created By</label>
                                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                        {selectedPattern.createdBy}
                                    </p>
                                </div>
                            )}

                            {selectedPattern.approvedBy && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Approved By</label>
                                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                        {selectedPattern.approvedBy}
                                    </p>
                                </div>
                            )}
                        </div>

                        {dialogType === 'pending' && (
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={handlePasteToTest}
                                        className="px-5 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors font-medium"
                                    >
                                        Paste to Test
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedPattern.id)}
                                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedPattern.id)}
                                        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckerDashBoard;
