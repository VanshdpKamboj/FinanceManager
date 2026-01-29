package com.example.Project_V1.dto;

import com.example.Project_V1.enums.RegexPatternStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegexLogDto {
    private Long id;
    private String pattern;
    private String text;
    private boolean matchFound;
    private RegexPatternStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String bankAddress;
    private String bankName;
    private String transactionType;
    private String transactionCategory;
    private String merchantName;
}
