package com.example.Project_V1.service;

import com.example.Project_V1.dto.BulkMessageProcessRequestDto;
import com.example.Project_V1.dto.BulkMessageProcessResponseDto;
import com.example.Project_V1.dto.TransactionMessageRequestDto;
import com.example.Project_V1.dto.TransactionResponseDto;

import java.util.List;

public interface TransactionService {
    
    /**
     * Process a message and extract transaction details using approved regex patterns
     * @param requestDto Contains the message and userId
     * @return TransactionResponseDto with extracted data and saved transaction
     */
    TransactionResponseDto processMessage(TransactionMessageRequestDto requestDto);
    
    /**
     * Process each message in its own separate transaction to avoid rollback-only errors
     * @param requestDto Contains the message and userId
     * @return TransactionResponseDto with extracted data and saved transaction
     */
    TransactionResponseDto processMessageInNewTransaction(TransactionMessageRequestDto requestDto);
    
    /**
     * Process multiple messages in bulk
     * @param requestDto Contains userId and list of message-bankAddress pairs
     * @return BulkMessageProcessResponseDto with summary and details of all processed messages
     */
    BulkMessageProcessResponseDto processBulkMessages(BulkMessageProcessRequestDto requestDto);
    
    /**
     * Get all transactions for a specific user
     */
    List<TransactionResponseDto> getUserTransactions(Long userId);
    
    /**
     * Get transactions by type (credited/debited)
     */
    List<TransactionResponseDto> getUserTransactionsByType(Long userId, String transactionType);
    
    /**
     * Get transactions by category
     */
    List<TransactionResponseDto> getUserTransactionsByCategory(Long userId, String category);
    
    /**
     * Get transaction by ID
     */
    TransactionResponseDto getTransactionById(Long id);
    
    /**
     * Update transaction (for adding category, notes, tags, etc.)
     */
    TransactionResponseDto updateTransaction(Long id, TransactionResponseDto updateDto);
    
    /**
     * Delete transaction
     */
    void deleteTransaction(Long id);
    
    /**
     * Get unverified transactions
     */
    List<TransactionResponseDto> getUnverifiedTransactions(Long userId);
    
    /**
     * Mark transaction as verified
     */
    TransactionResponseDto verifyTransaction(Long id);
}
