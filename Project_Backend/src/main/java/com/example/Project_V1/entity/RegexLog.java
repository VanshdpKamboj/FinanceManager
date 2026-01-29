package com.example.Project_V1.entity;

import com.example.Project_V1.enums.RegexPatternStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "regex_log")
@AllArgsConstructor
public class RegexLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String pattern;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String text;

    private boolean matchFound;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegexPatternStatus status;

    @Column(name = "bankAddress")
    private String bankAddress;

    @Column(name = "bankName")
    private String bankName;

    @Column(name = "transactionType")
    private String transactionType;

    @Column(name = "transactionCategory")
    private String transactionCategory;

    @Column(name = "merchantName")
    private String merchantName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public RegexLog() {
        this.status = RegexPatternStatus.PENDING;
    }

    public RegexLog(String pattern, String text, boolean matchFound) {
        this.pattern = pattern;
        this.text = text;
        this.matchFound = matchFound;
        this.status = RegexPatternStatus.PENDING;
    }

    public RegexLog(String pattern, String text, boolean matchFound, RegexPatternStatus status) {
        this.pattern = pattern;
        this.text = text;
        this.matchFound = matchFound;
        this.status = status;
    }

    public RegexLog(String pattern, String text, boolean matchFound, RegexPatternStatus status,
                    String bankAddress, String bankName, String transactionType,
                    String transactionCategory, String merchantName) {
        this.pattern = pattern;
        this.text = text;
        this.matchFound = matchFound;
        this.status = status;
        this.bankAddress = bankAddress;
        this.bankName = bankName;
        this.transactionType = transactionType;
        this.transactionCategory = transactionCategory;
        this.merchantName = merchantName;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = RegexPatternStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setMatchFound(boolean matchFound) {
        this.matchFound = matchFound;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setStatus(RegexPatternStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setBankAddress(String bankAddress) {
        this.bankAddress = bankAddress;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public void setTransactionCategory(String transactionCategory) {
        this.transactionCategory = transactionCategory;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }
}
