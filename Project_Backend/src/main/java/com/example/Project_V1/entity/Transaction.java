package com.example.Project_V1.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Transaction details from SMS/message
    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "transaction_type")
    private String transactionType; // credited, debited, etc.

    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date")
    private String date; // As received in message

    @Column(name = "via")
    private String via; // NEFT, UPI, IMPS, etc.

    @Column(name = "recipient_sender")
    private String to; // Recipient or sender name

    @Column(name = "available_balance", precision = 15, scale = 2)
    private BigDecimal availableBalance;

    @Column(name = "reference_number")
    private String referenceNumber;

    // Additional fields for personal finance manager
    @Column(name = "category")
    private String category; // Food, Transport, Salary, Shopping, etc.

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // User notes

    @Column(name = "tags")
    private String tags; // Comma-separated tags

    @Lob
    @Column(name = "original_message", columnDefinition = "TEXT")
    private String originalMessage; // Original SMS/message text

    @Column(name = "is_recurring")
    private Boolean isRecurring; // For recurring transactions

    @Column(name = "merchant_name")
    private String merchantName; // Extracted merchant name

    @Column(name = "location")
    private String location; // Transaction location if available

    @Column(name = "currency")
    private String currency; // INR, USD, etc. Default INR

    @Column(name = "is_verified")
    private Boolean isVerified; // Manual verification by user

    @Column(name = "regex_pattern_id")
    private Long regexPatternId; // Which regex pattern was used to extract

    @Column(name = "bank_address")
    private String bankAddress; // Bank address/identifier from SMS sender

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currency == null) {
            currency = "INR";
        }
        if (isVerified == null) {
            isVerified = false;
        }
        if (isRecurring == null) {
            isRecurring = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
