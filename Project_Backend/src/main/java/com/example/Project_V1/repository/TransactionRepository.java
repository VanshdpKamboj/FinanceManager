package com.example.Project_V1.repository;

import com.example.Project_V1.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // Find all transactions for a specific user
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find transactions by user and transaction type (credited/debited)
    List<Transaction> findByUserIdAndTransactionTypeOrderByCreatedAtDesc(Long userId, String transactionType);
    
    // Find transactions by user and category
    List<Transaction> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);
    
    // Find transactions by user within date range
    List<Transaction> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find unverified transactions for a user
    List<Transaction> findByUserIdAndIsVerifiedOrderByCreatedAtDesc(Long userId, Boolean isVerified);
    
    // Find recurring transactions
    List<Transaction> findByUserIdAndIsRecurringOrderByCreatedAtDesc(Long userId, Boolean isRecurring);
    
    // Find by reference number (useful for duplicate detection)
    List<Transaction> findByReferenceNumberAndUserId(String referenceNumber, Long userId);
    
    // Find transactions by user and bank address
    List<Transaction> findByUserIdAndBankAddressOrderByCreatedAtDesc(Long userId, String bankAddress);
    
    // Find transactions by bank address
    List<Transaction> findByBankAddressOrderByCreatedAtDesc(String bankAddress);
}
