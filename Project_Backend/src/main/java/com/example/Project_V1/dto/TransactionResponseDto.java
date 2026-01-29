package com.example.Project_V1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDto {
    private Long id;
    private Long userId;
    private String accountNumber;
    private String transactionType;
    private BigDecimal amount;
    private String date;
    private String via;
    private String to;
    private BigDecimal availableBalance;
    private String referenceNumber;
    private String category;
    private String notes;
    private String tags;
    private String originalMessage;
    private Boolean isRecurring;
    private String merchantName;
    private String location;
    private String currency;
    private Boolean isVerified;
    private Long regexPatternId;
    private String bankAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean matchFound; // Indicates if extraction was successful
}
