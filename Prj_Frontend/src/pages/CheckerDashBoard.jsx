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
            toast.error(error.response?.data?.message || 'Failed to fetch patterns');
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
                toast.error(response.data.message || 'Test failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to test regex');
            setExtractedInfo(null);
        } finally {
            setTestLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedPatternId) {
            toast.error('Please select a pattern to approve');
            return;
        }

        try {
            const patternId = selectedPatternId
            const response = await approvePattern(patternId);

            if (response) {
                toast.success('Pattern approved successfully!');
                await fetchPatterns();
                // Clear selection and form
                setSelectedPatternId(null);
                setRegex('');
                setMessage('');
                setTestResult(null);
            } else {
                toast.error(response?.data?.message || 'Approval failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to approve pattern');
        }
    };

    const handleReject = async () => {
        if (!selectedPatternId) {
            toast.error('Please select a pattern to reject');
            return;
        }

        try {
            const response = await rejectPattern(selectedPatternId);
            
            if (response.data) {
                toast.success('Pattern rejected successfully!');
                await fetchPatterns();
                // Clear selection and form
                setSelectedPatternId(null);
                setRegex('');
                setMessage('');
                setTestResult(null);
            } else {
                toast.error(response?.data.message || 'Rejection failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject pattern');
        }
    };

    const handlePatternClick = (pattern) => {
        setRegex(pattern.pattern);
        setMessage(pattern.text);
        setSelectedPatternId(pattern.id);
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
                                onChange={(e) => setRegex(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter message to test against the regex"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleTest}
                                disabled={testLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {testLoading ? 'Testing...' : 'Test'}
                            </button>

                            <button
                                onClick={handleApprove}
                                disabled={!selectedPatternId}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Approve
                            </button>

                            <button
                                onClick={handleReject}
                                disabled={!selectedPatternId}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Reject
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
                                    onClick={() => handlePatternClick(pattern)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedPatternId === pattern.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="mb-2">
                                        <span className="text-sm font-medium text-gray-700">Regex:</span>
                                        <p className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                                            {pattern.pattern}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Message:</span>
                                        <p className="text-gray-900 mt-1">{pattern.text}</p>
                                    </div>
                                    {pattern.createdBy && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            Created by: {pattern.createdBy}
                                        </div>
                                    )}
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
                                    className="p-4 border border-green-300 rounded-lg bg-green-50"
                                >
                                    <div className="mb-2">
                                        <span className="text-sm font-medium text-gray-700">Regex:</span>
                                        <p className="text-gray-900 font-mono bg-white px-2 py-1 rounded mt-1">
                                            {pattern.pattern}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Message:</span>
                                        <p className="text-gray-900 mt-1">{pattern.text}</p>
                                    </div>
                                    {pattern.approvedBy && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            Approved by: {pattern.approvedBy}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckerDashBoard;
