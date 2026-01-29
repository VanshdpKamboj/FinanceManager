package com.example.Project_V1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkMessageProcessResponseDto {
    private int totalMessages;
    private int successfullyProcessed;
    private int failed;
    private List<TransactionResponseDto> successfulTransactions;
    private List<FailedMessageDto> failedMessages;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedMessageDto {
        private String message;
        private String bankAddress;
        private String error;
        private boolean matchFound;
    }
}
