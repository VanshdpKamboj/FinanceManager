package com.example.Project_V1.service;

import com.example.Project_V1.dto.TransactionExtractionResultDto;
import com.example.Project_V1.dto.TransactionMessageRequestDto;
import com.example.Project_V1.dto.TransactionResponseDto;
import com.example.Project_V1.entity.RegexLog;
import com.example.Project_V1.entity.Transaction;
import com.example.Project_V1.entity.User;
import com.example.Project_V1.enums.RegexPatternStatus;
import com.example.Project_V1.repository.RegexLogRepository;
import com.example.Project_V1.repository.TransactionRepository;
import com.example.Project_V1.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final RegexLogRepository regexLogRepository;
    private final UserRepository userRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  RegexLogRepository regexLogRepository,
                                  UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.regexLogRepository = regexLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TransactionResponseDto processMessage(TransactionMessageRequestDto requestDto) {
        // Validate user exists
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + requestDto.getUserId()));

        // Validate bankAddress is provided
        if (requestDto.getBankAddress() == null || requestDto.getBankAddress().isBlank()) {
            throw new IllegalArgumentException("Bank address is required for processing transactions");
        }

        // Get all approved regex patterns for the specific bank address
        List<RegexLog> approvedPatterns = regexLogRepository
                .findByStatusAndBankAddressOrderByCreatedAtDesc(RegexPatternStatus.APPROVED, requestDto.getBankAddress());

        if (approvedPatterns.isEmpty()) {
            throw new IllegalStateException("No approved regex patterns found for bank address: " + requestDto.getBankAddress() + 
                    ". Please add and approve regex patterns for this bank first.");
        }

        // Try each approved pattern until a match is found
        TransactionExtractionResultDto extractionResult = null;
        for (RegexLog regexLog : approvedPatterns) {
            extractionResult = tryExtractWithPattern(requestDto.getMessage(), regexLog);
            if (extractionResult.isMatchFound()) {
                // First match found, use it
                break;
            }
        }

        // If no match found, return response indicating no match
        if (extractionResult == null || !extractionResult.isMatchFound()) {
            TransactionResponseDto response = new TransactionResponseDto();
            response.setMatchFound(false);
            response.setOriginalMessage(requestDto.getMessage());
            response.setBankAddress(requestDto.getBankAddress());
            return response;
        }

        // Create and save transaction entity
        Transaction transaction = createTransactionFromExtraction(extractionResult, user, requestDto.getBankAddress());
        Transaction savedTransaction = transactionRepository.save(transaction);

        return convertToDto(savedTransaction);
    }

    /**
     * Try to extract transaction data using a specific regex pattern
     */
    private TransactionExtractionResultDto tryExtractWithPattern(String message, RegexLog regexLog) {
        TransactionExtractionResultDto result = new TransactionExtractionResultDto();
        result.setOriginalMessage(message);
        result.setRegexPatternId(regexLog.getId());

        try {
            Pattern pattern = Pattern.compile(regexLog.getPattern(), Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(message);

            if (matcher.find()) {
                result.setMatchFound(true);
                result.setAccountNumber(getGroup(matcher, "accountNumber"));
                result.setTransactionType(getGroup(matcher, "transactionType"));
                result.setAmount(getGroup(matcher, "amount"));
                result.setDate(getGroup(matcher, "date"));
                result.setVia(getGroup(matcher, "via"));
                result.setTo(getGroup(matcher, "to"));
                result.setAvailableBalance(getGroup(matcher, "availableBalance"));
                result.setReferenceNumber(getGroup(matcher, "referenceNumber"));
            } else {
                result.setMatchFound(false);
            }
        } catch (Exception e) {
            // Pattern compilation or matching failed
            result.setMatchFound(false);
        }

        return result;
    }

    /**
     * Safe named-group extraction from regex matcher
     */
    private String getGroup(Matcher matcher, String name) {
        try {
            String value = matcher.group(name);
            return (value != null && !value.isBlank()) ? value.trim() : null;
        } catch (IllegalArgumentException e) {
            // Group name doesn't exist in pattern
            return null;
        }
    }

    /**
     * Create Transaction entity from extraction result
     */
    private Transaction createTransactionFromExtraction(TransactionExtractionResultDto extractionResult, User user, String bankAddress) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setOriginalMessage(extractionResult.getOriginalMessage());
        transaction.setRegexPatternId(extractionResult.getRegexPatternId());
        transaction.setBankAddress(bankAddress);
        
        // Set extracted fields
        transaction.setAccountNumber(extractionResult.getAccountNumber());
        transaction.setTransactionType(extractionResult.getTransactionType());
        transaction.setDate(extractionResult.getDate());
        transaction.setVia(extractionResult.getVia());
        transaction.setTo(extractionResult.getTo());
        transaction.setReferenceNumber(extractionResult.getReferenceNumber());
        
        // Parse and set amount
        if (extractionResult.getAmount() != null) {
            transaction.setAmount(parseAmount(extractionResult.getAmount()));
        }
        
        // Parse and set available balance
        if (extractionResult.getAvailableBalance() != null) {
            transaction.setAvailableBalance(parseAmount(extractionResult.getAvailableBalance()));
        }
        
        // Auto-categorize based on transaction type and other fields
        transaction.setCategory(autoCategorize(transaction));
        
        return transaction;
    }

    /**
     * Parse amount string to BigDecimal (handles commas, currency symbols, etc.)
     */
    private BigDecimal parseAmount(String amountStr) {
        if (amountStr == null || amountStr.isBlank()) {
            return null;
        }
        
        try {
            // Remove currency symbols, commas, and spaces
            String cleaned = amountStr.replaceAll("[₹$,\\s]", "");
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Auto-categorize transaction based on available information
     */
    private String autoCategorize(Transaction transaction) {
        // Simple auto-categorization logic
        // Can be enhanced with ML or more sophisticated rules
        
        String transactionType = transaction.getTransactionType();
        String recipient = transaction.getTo();
        
        if (transactionType != null && transactionType.toLowerCase().contains("credit")) {
            if (recipient != null) {
                String recipientLower = recipient.toLowerCase();
                if (recipientLower.contains("salary") || recipientLower.contains("employer")) {
                    return "Income:Salary";
                } else if (recipientLower.contains("refund")) {
                    return "Income:Refund";
                }
            }
            return "Income:Other";
        } else if (transactionType != null && transactionType.toLowerCase().contains("debit")) {
            if (recipient != null) {
                String recipientLower = recipient.toLowerCase();
                if (recipientLower.contains("zomato") || recipientLower.contains("swiggy") || 
                    recipientLower.contains("restaurant") || recipientLower.contains("cafe")) {
                    return "Expense:Food";
                } else if (recipientLower.contains("uber") || recipientLower.contains("ola") || 
                          recipientLower.contains("metro") || recipientLower.contains("petrol")) {
                    return "Expense:Transport";
                } else if (recipientLower.contains("amazon") || recipientLower.contains("flipkart") || 
                          recipientLower.contains("shopping")) {
                    return "Expense:Shopping";
                } else if (recipientLower.contains("electricity") || recipientLower.contains("water") || 
                          recipientLower.contains("gas") || recipientLower.contains("rent")) {
                    return "Expense:Bills";
                }
            }
            return "Expense:Other";
        }
        
        return "Uncategorized";
    }

    @Override
    public List<TransactionResponseDto> getUserTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponseDto> getUserTransactionsByType(Long userId, String transactionType) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionTypeOrderByCreatedAtDesc(userId, transactionType);
        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponseDto> getUserTransactionsByCategory(Long userId, String category) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponseDto getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));
        return convertToDto(transaction);
    }

    @Override
    @Transactional
    public TransactionResponseDto updateTransaction(Long id, TransactionResponseDto updateDto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));

        // Update only modifiable fields
        if (updateDto.getCategory() != null) {
            transaction.setCategory(updateDto.getCategory());
        }
        if (updateDto.getNotes() != null) {
            transaction.setNotes(updateDto.getNotes());
        }
        if (updateDto.getTags() != null) {
            transaction.setTags(updateDto.getTags());
        }
        if (updateDto.getIsRecurring() != null) {
            transaction.setIsRecurring(updateDto.getIsRecurring());
        }
        if (updateDto.getIsVerified() != null) {
            transaction.setIsVerified(updateDto.getIsVerified());
        }
        if (updateDto.getMerchantName() != null) {
            transaction.setMerchantName(updateDto.getMerchantName());
        }
        if (updateDto.getLocation() != null) {
            transaction.setLocation(updateDto.getLocation());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return convertToDto(updatedTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    @Override
    public List<TransactionResponseDto> getUnverifiedTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndIsVerifiedOrderByCreatedAtDesc(userId, false);
        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionResponseDto verifyTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with id: " + id));
        
        transaction.setIsVerified(true);
        Transaction updatedTransaction = transactionRepository.save(transaction);
        return convertToDto(updatedTransaction);
    }

    /**
     * Convert Transaction entity to DTO
     */
    private TransactionResponseDto convertToDto(Transaction transaction) {
        TransactionResponseDto dto = new TransactionResponseDto();
        dto.setId(transaction.getId());
        dto.setUserId(transaction.getUser().getId());
        dto.setAccountNumber(transaction.getAccountNumber());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setAmount(transaction.getAmount());
        dto.setDate(transaction.getDate());
        dto.setVia(transaction.getVia());
        dto.setTo(transaction.getTo());
        dto.setAvailableBalance(transaction.getAvailableBalance());
        dto.setReferenceNumber(transaction.getReferenceNumber());
        dto.setCategory(transaction.getCategory());
        dto.setNotes(transaction.getNotes());
        dto.setTags(transaction.getTags());
        dto.setOriginalMessage(transaction.getOriginalMessage());
        dto.setIsRecurring(transaction.getIsRecurring());
        dto.setMerchantName(transaction.getMerchantName());
        dto.setLocation(transaction.getLocation());
        dto.setCurrency(transaction.getCurrency());
        dto.setIsVerified(transaction.getIsVerified());
        dto.setRegexPatternId(transaction.getRegexPatternId());
        dto.setBankAddress(transaction.getBankAddress());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setUpdatedAt(transaction.getUpdatedAt());
        dto.setMatchFound(true); // If entity exists, match was found
        return dto;
    }
}
