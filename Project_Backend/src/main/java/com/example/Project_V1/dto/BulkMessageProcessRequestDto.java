package com.example.Project_V1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkMessageProcessRequestDto {
    private Long userId;
    private List<MessageBankAddressPair> messages;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageBankAddressPair {
        private String message;
        private String bankAddress;
    }
}
