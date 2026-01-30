package com.example.Project_V1.entity;

import com.example.Project_V1.enums.RegexPatternStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RegexLogTest {

    private RegexLog regexLog;

    @BeforeEach
    void setUp() {
        regexLog = new RegexLog();
    }

    @Test
    void testNoArgsConstructor() {
        RegexLog newRegexLog = new RegexLog();
        assertNotNull(newRegexLog);
        assertEquals(RegexPatternStatus.PENDING, newRegexLog.getStatus());
    }

    @Test
    void testThreeArgsConstructor() {
        RegexLog log = new RegexLog("pattern", "text", true);
        
        assertEquals("pattern", log.getPattern());
        assertEquals("text", log.getText());
        assertTrue(log.isMatchFound());
        assertEquals(RegexPatternStatus.PENDING, log.getStatus());
    }

    @Test
    void testFourArgsConstructor() {
        RegexLog log = new RegexLog("pattern", "text", true, RegexPatternStatus.APPROVED);
        
        assertEquals("pattern", log.getPattern());
        assertEquals("text", log.getText());
        assertTrue(log.isMatchFound());
        assertEquals(RegexPatternStatus.APPROVED, log.getStatus());
    }

    @Test
    void testFullArgsConstructor() {
        RegexLog log = new RegexLog(
                "pattern",
                "text",
                true,
                RegexPatternStatus.DRAFT,
                "HDFC-BANK",
                "HDFC Bank",
                "credited",
                "Income",
                "Merchant"
        );
        
        assertEquals("pattern", log.getPattern());
        assertEquals("text", log.getText());
        assertTrue(log.isMatchFound());
        assertEquals(RegexPatternStatus.DRAFT, log.getStatus());
        assertEquals("HDFC-BANK", log.getBankAddress());
        assertEquals("HDFC Bank", log.getBankName());
        assertEquals("credited", log.getTransactionType());
        assertEquals("Income", log.getTransactionCategory());
        assertEquals("Merchant", log.getMerchantName());
    }

    @Test
    void testSettersAndGetters() {
        regexLog.setId(1L);
        regexLog.setPattern("test pattern");
        regexLog.setText("test text");
        regexLog.setMatchFound(true);
        regexLog.setStatus(RegexPatternStatus.APPROVED);
        regexLog.setBankAddress("HDFC-BANK");
        regexLog.setBankName("HDFC Bank");
        regexLog.setTransactionType("credited");
        regexLog.setTransactionCategory("Income");
        regexLog.setMerchantName("Merchant");
        LocalDateTime now = LocalDateTime.now();
        regexLog.setCreatedAt(now);
        regexLog.setUpdatedAt(now);

        assertEquals(1L, regexLog.getId());
        assertEquals("test pattern", regexLog.getPattern());
        assertEquals("test text", regexLog.getText());
        assertTrue(regexLog.isMatchFound());
        assertEquals(RegexPatternStatus.APPROVED, regexLog.getStatus());
        assertEquals("HDFC-BANK", regexLog.getBankAddress());
        assertEquals("HDFC Bank", regexLog.getBankName());
        assertEquals("credited", regexLog.getTransactionType());
        assertEquals("Income", regexLog.getTransactionCategory());
        assertEquals("Merchant", regexLog.getMerchantName());
        assertEquals(now, regexLog.getCreatedAt());
        assertEquals(now, regexLog.getUpdatedAt());
    }

    @Test
    void testPrePersist() {
        regexLog.setPattern("test");
        regexLog.setText("text");
        
        regexLog.onCreate();
        
        assertNotNull(regexLog.getCreatedAt());
        assertNotNull(regexLog.getUpdatedAt());
        assertNotNull(regexLog.getStatus());
    }

    @Test
    void testPrePersist_WithNullStatus() {
        regexLog.setStatus(null);
        regexLog.onCreate();
        
        assertEquals(RegexPatternStatus.PENDING, regexLog.getStatus());
    }

    @Test
    void testPrePersist_WithExistingStatus() {
        regexLog.setStatus(RegexPatternStatus.APPROVED);
        regexLog.onCreate();
        
        assertEquals(RegexPatternStatus.APPROVED, regexLog.getStatus());
    }

    @Test
    void testPreUpdate() {
        LocalDateTime originalCreatedAt = LocalDateTime.now().minusDays(1);
        regexLog.setCreatedAt(originalCreatedAt);
        regexLog.setUpdatedAt(originalCreatedAt);
        
        regexLog.onUpdate();
        
        assertEquals(originalCreatedAt, regexLog.getCreatedAt());
        assertNotEquals(originalCreatedAt, regexLog.getUpdatedAt());
    }

    @Test
    void testAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        RegexLog log = new RegexLog(
                1L,
                "pattern",
                "text",
                true,
                RegexPatternStatus.APPROVED,
                "HDFC-BANK",
                "HDFC Bank",
                "credited",
                "Income",
                "Merchant",
                now,
                now
        );

        assertEquals(1L, log.getId());
        assertEquals("pattern", log.getPattern());
        assertEquals("text", log.getText());
        assertTrue(log.isMatchFound());
        assertEquals(RegexPatternStatus.APPROVED, log.getStatus());
        assertEquals(now, log.getCreatedAt());
    }

    @Test
    void testDifferentStatuses() {
        regexLog.setStatus(RegexPatternStatus.DRAFT);
        assertEquals(RegexPatternStatus.DRAFT, regexLog.getStatus());

        regexLog.setStatus(RegexPatternStatus.PENDING);
        assertEquals(RegexPatternStatus.PENDING, regexLog.getStatus());

        regexLog.setStatus(RegexPatternStatus.APPROVED);
        assertEquals(RegexPatternStatus.APPROVED, regexLog.getStatus());

        regexLog.setStatus(RegexPatternStatus.REJECTED);
        assertEquals(RegexPatternStatus.REJECTED, regexLog.getStatus());
    }

    @Test
    void testMatchFoundFlag() {
        regexLog.setMatchFound(true);
        assertTrue(regexLog.isMatchFound());

        regexLog.setMatchFound(false);
        assertFalse(regexLog.isMatchFound());
    }
}
