package com.example.Project_V1.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Generated;

import java.util.List;

@AllArgsConstructor
@Data
public class RegexResponseDto {
    private boolean matchFound;

    private String accountNumber;
    private String transactionType;
    private String amount;
    private String date;
    private String via;
    private String to;
    private String availableBalance;
    private String referenceNumber;

    public RegexResponseDto() {}

    public boolean isMatchFound() {
        return matchFound;
    }

    public void setMatchFound(boolean matchFound) {
        this.matchFound = matchFound;
    }
}
