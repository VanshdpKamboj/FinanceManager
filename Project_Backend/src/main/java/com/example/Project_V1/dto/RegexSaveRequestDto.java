package com.example.Project_V1.dto;

import com.example.Project_V1.enums.RegexPatternStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegexSaveRequestDto {
    private String pattern;
    private String text;
    private RegexPatternStatus status;
    private int id;
    private String bankAddress;
    private String bankName;
    private String transactionType;
    private String transactionCategory;
    private String merchantName;
}
