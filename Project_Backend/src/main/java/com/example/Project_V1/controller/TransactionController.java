package com.example.Project_V1.controller;

import com.example.Project_V1.dto.TransactionMessageRequestDto;
import com.example.Project_V1.dto.TransactionResponseDto;
import com.example.Project_V1.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Process a transaction message and extract details using approved regex patterns
     * POST /api/transactions/process
     */
    @PostMapping("/process")
    public ResponseEntity<?> processTransactionMessage(@RequestBody TransactionMessageRequestDto requestDto) {
        try {
            TransactionResponseDto response = transactionService.processMessage(requestDto);
            
            if (!response.isMatchFound()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("matchFound", false);
                errorResponse.put("message", "No approved regex pattern matched the message");
                errorResponse.put("originalMessage", requestDto.getMessage());
                return ResponseEntity.status(HttpStatus.OK).body(errorResponse);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "An error occurred while processing the message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all transactions for a user
     * GET /api/transactions/user/{userId}
     */

    @GetMapping("/user/{userId}/getTransactions")
    public ResponseEntity<List<TransactionResponseDto>> getUserTransactions(@PathVariable Long userId) {
        System.out.println("User Id at backend: " +  userId);
        List<TransactionResponseDto> transactions = transactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions by type (credited/debited)
     * GET /api/transactions/user/{userId}/type/{transactionType}
     */
    @GetMapping("/user/{userId}/type/{transactionType}")
    public ResponseEntity<List<TransactionResponseDto>> getUserTransactionsByType(
            @PathVariable Long userId,
            @PathVariable String transactionType) {
        List<TransactionResponseDto> transactions = transactionService
                .getUserTransactionsByType(userId, transactionType);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transactions by category
     * GET /api/transactions/user/{userId}/category/{category}
     */
    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<List<TransactionResponseDto>> getUserTransactionsByCategory(
            @PathVariable Long userId,
            @PathVariable String category) {
        List<TransactionResponseDto> transactions = transactionService
                .getUserTransactionsByCategory(userId, category);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get unverified transactions for a user
     * GET /api/transactions/user/{userId}/unverified
     */
    @GetMapping("/user/{userId}/unverified")
    public ResponseEntity<List<TransactionResponseDto>> getUnverifiedTransactions(@PathVariable Long userId) {
        List<TransactionResponseDto> transactions = transactionService.getUnverifiedTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get transaction by ID
     * GET /api/transactions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            TransactionResponseDto transaction = transactionService.getTransactionById(id);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Update transaction (category, notes, tags, etc.)
     * PUT /api/transactions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionResponseDto updateDto) {
        try {
            TransactionResponseDto updatedTransaction = transactionService.updateTransaction(id, updateDto);
            return ResponseEntity.ok(updatedTransaction);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Delete transaction
     * DELETE /api/transactions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            transactionService.deleteTransaction(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Transaction deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Verify transaction
     * POST /api/transactions/{id}/verify
     */
    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyTransaction(@PathVariable Long id) {
        try {
            TransactionResponseDto transaction = transactionService.verifyTransaction(id);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}
