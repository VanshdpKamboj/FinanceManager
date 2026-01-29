package com.example.Project_V1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionMessageRequestDto {
    private String message; // The SMS or message text sent by user
    private Long userId; // User who is sending the message
    private String bankAddress; // The bank address/identifier from which the SMS is sent
}
