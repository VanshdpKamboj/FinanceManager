package com.example.Project_V1.entity;

import com.example.Project_V1.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TransactionTest {

    private Transaction transaction;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setRole(UserRole.NORMAL_USER);

        transaction = new Transaction();
    }

    @Test
    void testTransactionSettersAndGetters() {
        transaction.setId(1L);
        transaction.setUser(user);
        transaction.setAccountNumber("123456");
        transaction.setTransactionType("credited");
        transaction.setAmount(new BigDecimal("500.00"));
        transaction.setDate("2024-01-29");
        transaction.setVia("UPI");
        transaction.setTo("John Doe");
        transaction.setAvailableBalance(new BigDecimal("10000.00"));
        transaction.setReferenceNumber("REF123");
        transaction.setCategory("Income:Salary");
        transaction.setNotes("Monthly salary");
        transaction.setTags("salary,income");
        transaction.setOriginalMessage("Your account credited");
        transaction.setIsRecurring(false);
        transaction.setMerchantName("ABC Corp");
        transaction.setLocation("Mumbai");
        transaction.setCurrency("INR");
        transaction.setIsVerified(true);
        transaction.setRegexPatternId(1L);
        transaction.setBankAddress("HDFC-BANK");

        assertEquals(1L, transaction.getId());
        assertEquals(user, transaction.getUser());
        assertEquals("123456", transaction.getAccountNumber());
        assertEquals("credited", transaction.getTransactionType());
        assertEquals(new BigDecimal("500.00"), transaction.getAmount());
        assertEquals("2024-01-29", transaction.getDate());
        assertEquals("UPI", transaction.getVia());
        assertEquals("John Doe", transaction.getTo());
        assertEquals(new BigDecimal("10000.00"), transaction.getAvailableBalance());
        assertEquals("REF123", transaction.getReferenceNumber());
        assertEquals("Income:Salary", transaction.getCategory());
        assertEquals("Monthly salary", transaction.getNotes());
        assertEquals("salary,income", transaction.getTags());
        assertEquals("Your account credited", transaction.getOriginalMessage());
        assertFalse(transaction.getIsRecurring());
        assertEquals("ABC Corp", transaction.getMerchantName());
        assertEquals("Mumbai", transaction.getLocation());
        assertEquals("INR", transaction.getCurrency());
        assertTrue(transaction.getIsVerified());
        assertEquals(1L, transaction.getRegexPatternId());
        assertEquals("HDFC-BANK", transaction.getBankAddress());
    }

    @Test
    void testPrePersist() {
        transaction.setUser(user);
        transaction.setAccountNumber("123456");
        
        transaction.onCreate();
        
        assertNotNull(transaction.getCreatedAt());
        assertNotNull(transaction.getUpdatedAt());
        assertEquals("INR", transaction.getCurrency());
        assertFalse(transaction.getIsVerified());
        assertFalse(transaction.getIsRecurring());
    }

    @Test
    void testPrePersist_WithExistingCurrency() {
        transaction.setCurrency("USD");
        transaction.onCreate();
        
        assertEquals("USD", transaction.getCurrency());
    }

    @Test
    void testPreUpdate() {
        LocalDateTime originalCreatedAt = LocalDateTime.now().minusDays(1);
        transaction.setCreatedAt(originalCreatedAt);
        transaction.setUpdatedAt(originalCreatedAt);
        
        transaction.onUpdate();
        
        assertEquals(originalCreatedAt, transaction.getCreatedAt());
        assertNotEquals(originalCreatedAt, transaction.getUpdatedAt());
    }

    @Test
    void testAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        Transaction testTransaction = new Transaction(
                1L,
                user,
                "123456",
                "credited",
                new BigDecimal("500.00"),
                "2024-01-29",
                "UPI",
                "John Doe",
                new BigDecimal("10000.00"),
                "REF123",
                "Income:Other",
                "Test notes",
                "test,tag",
                "Original message",
                false,
                "Merchant",
                "Location",
                "INR",
                true,
                1L,
                "HDFC-BANK",
                now,
                now
        );

        assertEquals(1L, testTransaction.getId());
        assertEquals(user, testTransaction.getUser());
        assertEquals("123456", testTransaction.getAccountNumber());
        assertEquals("credited", testTransaction.getTransactionType());
        assertEquals(new BigDecimal("500.00"), testTransaction.getAmount());
    }

    @Test
    void testNoArgsConstructor() {
        Transaction newTransaction = new Transaction();
        assertNotNull(newTransaction);
    }

    @Test
    void testAmountPrecision() {
        transaction.setAmount(new BigDecimal("1234.56"));
        assertEquals(new BigDecimal("1234.56"), transaction.getAmount());
    }

    @Test
    void testBooleanDefaults() {
        transaction.onCreate();
        assertFalse(transaction.getIsVerified());
        assertFalse(transaction.getIsRecurring());
    }
}
