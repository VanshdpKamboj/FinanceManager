package com.example.Project_V1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for intermediate extraction result before saving to database
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionExtractionResultDto {
    private boolean matchFound;
    private String accountNumber;
    private String transactionType;
    private String amount;
    private String date;
    private String via;
    private String to;
    private String availableBalance;
    private String referenceNumber;
    private Long regexPatternId; // Which pattern matched
    private String originalMessage;
}
