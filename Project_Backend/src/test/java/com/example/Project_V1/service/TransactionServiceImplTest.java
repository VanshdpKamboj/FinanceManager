package com.example.Project_V1.service;

import com.example.Project_V1.dto.BulkMessageProcessRequestDto;
import com.example.Project_V1.dto.BulkMessageProcessResponseDto;
import com.example.Project_V1.dto.TransactionMessageRequestDto;
import com.example.Project_V1.dto.TransactionResponseDto;
import com.example.Project_V1.entity.RegexLog;
import com.example.Project_V1.entity.Transaction;
import com.example.Project_V1.entity.User;
import com.example.Project_V1.enums.RegexPatternStatus;
import com.example.Project_V1.enums.UserRole;
import com.example.Project_V1.repository.RegexLogRepository;
import com.example.Project_V1.repository.TransactionRepository;
import com.example.Project_V1.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private RegexLogRepository regexLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User testUser;
    private RegexLog approvedRegexLog;
    private Transaction testTransaction;
    private TransactionMessageRequestDto messageRequestDto;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(UserRole.NORMAL_USER);

        approvedRegexLog = new RegexLog();
        approvedRegexLog.setId(1L);
        approvedRegexLog.setPattern(".*A/C\\s*(?<accountNumber>\\d+).*(?<transactionType>credited|debited).*Rs\\.?\\s*(?<amount>[\\d,]+\\.\\d{2})");
        approvedRegexLog.setText("Test message");
        approvedRegexLog.setMatchFound(true);
        approvedRegexLog.setStatus(RegexPatternStatus.APPROVED);
        approvedRegexLog.setBankAddress("HDFC-BANK");

        testTransaction = new Transaction();
        testTransaction.setId(1L);
        testTransaction.setUser(testUser);
        testTransaction.setAccountNumber("123456");
        testTransaction.setTransactionType("credited");
        testTransaction.setAmount(new BigDecimal("500.00"));
        testTransaction.setBankAddress("HDFC-BANK");
        testTransaction.setOriginalMessage("Your A/C 123456 is credited with Rs.500.00");
        testTransaction.setCategory("Income:Other");
        testTransaction.setIsVerified(false);
        testTransaction.setCreatedAt(LocalDateTime.now());

        messageRequestDto = new TransactionMessageRequestDto();
        messageRequestDto.setUserId(1L);
        messageRequestDto.setBankAddress("HDFC-BANK");
        messageRequestDto.setMessage("Your A/C 123456 is credited with Rs.500.00");
    }

    @Test
    void processMessage_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(regexLogRepository.findByStatusAndBankAddressOrderByCreatedAtDesc(
                RegexPatternStatus.APPROVED, "HDFC-BANK"))
                .thenReturn(Arrays.asList(approvedRegexLog));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        TransactionResponseDto response = transactionService.processMessage(messageRequestDto);

        assertNotNull(response);
        assertTrue(response.isMatchFound());
        assertEquals("credited", response.getTransactionType());
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void processMessage_UserNotFound_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.processMessage(messageRequestDto);
        });
    }

    @Test
    void processMessage_NoBankAddress_ThrowsException() {
        messageRequestDto.setBankAddress(null);

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.processMessage(messageRequestDto);
        });
    }

    @Test
    void processMessage_EmptyBankAddress_ThrowsException() {
        messageRequestDto.setBankAddress("   ");

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.processMessage(messageRequestDto);
        });
    }

    @Test
    void processMessage_NoApprovedPatterns_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(regexLogRepository.findByStatusAndBankAddressOrderByCreatedAtDesc(
                any(), anyString()))
                .thenReturn(new ArrayList<>());

        assertThrows(IllegalStateException.class, () -> {
            transactionService.processMessage(messageRequestDto);
        });
    }

    @Test
    void processMessage_NoMatch_ReturnsNoMatchResponse() {
        messageRequestDto.setMessage("This message doesn't match any pattern");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(regexLogRepository.findByStatusAndBankAddressOrderByCreatedAtDesc(
                RegexPatternStatus.APPROVED, "HDFC-BANK"))
                .thenReturn(Arrays.asList(approvedRegexLog));

        TransactionResponseDto response = transactionService.processMessage(messageRequestDto);

        assertNotNull(response);
        assertFalse(response.isMatchFound());
        assertEquals(messageRequestDto.getMessage(), response.getOriginalMessage());
    }

    @Test
    void processMessage_DebitTransaction_CategorizedCorrectly() {
        messageRequestDto.setMessage("Your A/C 123456 is debited with Rs.500.00 to Zomato");
        approvedRegexLog.setPattern("(?<transactionType>credited|debited).*?Rs\\.?(?<amount>[\\d,]+\\.\\d{2}).*?(?<to>\\w+)");
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(regexLogRepository.findByStatusAndBankAddressOrderByCreatedAtDesc(
                RegexPatternStatus.APPROVED, "HDFC-BANK"))
                .thenReturn(Arrays.asList(approvedRegexLog));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        TransactionResponseDto response = transactionService.processMessage(messageRequestDto);

        assertNotNull(response);
        assertTrue(response.isMatchFound());
    }

    @Test
    void processBulkMessages_AllSuccess() {
        BulkMessageProcessRequestDto bulkRequest = new BulkMessageProcessRequestDto();
        bulkRequest.setUserId(1L);
        
        List<BulkMessageProcessRequestDto.MessageBankAddressPair> messages = new ArrayList<>();
        BulkMessageProcessRequestDto.MessageBankAddressPair pair1 = new BulkMessageProcessRequestDto.MessageBankAddressPair();
        pair1.setMessage("Your A/C 123456 is credited with Rs.500.00");
        pair1.setBankAddress("HDFC-BANK");
        messages.add(pair1);
        
        bulkRequest.setMessages(messages);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(regexLogRepository.findByStatusAndBankAddressOrderByCreatedAtDesc(
                RegexPatternStatus.APPROVED, "HDFC-BANK"))
                .thenReturn(Arrays.asList(approvedRegexLog));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        BulkMessageProcessResponseDto response = transactionService.processBulkMessages(bulkRequest);

        assertNotNull(response);
        assertEquals(1, response.getTotalMessages());
        assertEquals(1, response.getSuccessfullyProcessed());
        assertEquals(0, response.getFailed());
    }

    @Test
    void processBulkMessages_UserNotFound() {
        BulkMessageProcessRequestDto bulkRequest = new BulkMessageProcessRequestDto();
        bulkRequest.setUserId(999L);
        
        List<BulkMessageProcessRequestDto.MessageBankAddressPair> messages = new ArrayList<>();
        BulkMessageProcessRequestDto.MessageBankAddressPair pair1 = new BulkMessageProcessRequestDto.MessageBankAddressPair();
        pair1.setMessage("Test message");
        pair1.setBankAddress("HDFC-BANK");
        messages.add(pair1);
        
        bulkRequest.setMessages(messages);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        BulkMessageProcessResponseDto response = transactionService.processBulkMessages(bulkRequest);

        assertNotNull(response);
        assertEquals(1, response.getTotalMessages());
        assertEquals(0, response.getSuccessfullyProcessed());
        assertEquals(1, response.getFailed());
    }

    @Test
    void processBulkMessages_MixedResults() {
        BulkMessageProcessRequestDto bulkRequest = new BulkMessageProcessRequestDto();
        bulkRequest.setUserId(1L);
        
        List<BulkMessageProcessRequestDto.MessageBankAddressPair> messages = new ArrayList<>();
        BulkMessageProcessRequestDto.MessageBankAddressPair pair1 = new BulkMessageProcessRequestDto.MessageBankAddressPair();
        pair1.setMessage("Your A/C 123456 is credited with Rs.500.00");
        pair1.setBankAddress("HDFC-BANK");
        
        BulkMessageProcessRequestDto.MessageBankAddressPair pair2 = new BulkMessageProcessRequestDto.MessageBankAddressPair();
        pair2.setMessage("No match message");
        pair2.setBankAddress("HDFC-BANK");
        
        messages.add(pair1);
        messages.add(pair2);
        bulkRequest.setMessages(messages);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(regexLogRepository.findByStatusAndBankAddressOrderByCreatedAtDesc(
                RegexPatternStatus.APPROVED, "HDFC-BANK"))
                .thenReturn(Arrays.asList(approvedRegexLog));

        BulkMessageProcessResponseDto response = transactionService.processBulkMessages(bulkRequest);

        assertNotNull(response);
        assertEquals(2, response.getTotalMessages());
    }

    @Test
    void getUserTransactions_Success() {
        when(transactionRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Arrays.asList(testTransaction));

        List<TransactionResponseDto> transactions = transactionService.getUserTransactions(1L);

        assertNotNull(transactions);
        assertEquals(1, transactions.size());
        verify(transactionRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getUserTransactionsByType_Success() {
        when(transactionRepository.findByUserIdAndTransactionTypeOrderByCreatedAtDesc(1L, "credited"))
                .thenReturn(Arrays.asList(testTransaction));

        List<TransactionResponseDto> transactions = transactionService.getUserTransactionsByType(1L, "credited");

        assertNotNull(transactions);
        assertEquals(1, transactions.size());
    }

    @Test
    void getUserTransactionsByCategory_Success() {
        when(transactionRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(1L, "Income:Other"))
                .thenReturn(Arrays.asList(testTransaction));

        List<TransactionResponseDto> transactions = transactionService.getUserTransactionsByCategory(1L, "Income:Other");

        assertNotNull(transactions);
        assertEquals(1, transactions.size());
    }

    @Test
    void getTransactionById_Success() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(testTransaction));

        TransactionResponseDto result = transactionService.getTransactionById(1L);

        assertNotNull(result);
        assertEquals(testTransaction.getId(), result.getId());
    }

    @Test
    void getTransactionById_NotFound_ThrowsException() {
        when(transactionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.getTransactionById(999L);
        });
    }

    @Test
    void updateTransaction_Success() {
        TransactionResponseDto updateDto = new TransactionResponseDto();
        updateDto.setCategory("Expense:Food");
        updateDto.setNotes("Dinner at restaurant");
        updateDto.setTags("food,dining");

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(testTransaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        TransactionResponseDto result = transactionService.updateTransaction(1L, updateDto);

        assertNotNull(result);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void updateTransaction_NotFound_ThrowsException() {
        TransactionResponseDto updateDto = new TransactionResponseDto();
        when(transactionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.updateTransaction(999L, updateDto);
        });
    }

    @Test
    void deleteTransaction_Success() {
        when(transactionRepository.existsById(1L)).thenReturn(true);
        doNothing().when(transactionRepository).deleteById(1L);

        assertDoesNotThrow(() -> transactionService.deleteTransaction(1L));
        verify(transactionRepository).deleteById(1L);
    }

    @Test
    void deleteTransaction_NotFound_ThrowsException() {
        when(transactionRepository.existsById(999L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.deleteTransaction(999L);
        });
    }

    @Test
    void getUnverifiedTransactions_Success() {
        when(transactionRepository.findByUserIdAndIsVerifiedOrderByCreatedAtDesc(1L, false))
                .thenReturn(Arrays.asList(testTransaction));

        List<TransactionResponseDto> transactions = transactionService.getUnverifiedTransactions(1L);

        assertNotNull(transactions);
        assertEquals(1, transactions.size());
    }

    @Test
    void verifyTransaction_Success() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(testTransaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        TransactionResponseDto result = transactionService.verifyTransaction(1L);

        assertNotNull(result);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void verifyTransaction_NotFound_ThrowsException() {
        when(transactionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.verifyTransaction(999L);
        });
    }
}
