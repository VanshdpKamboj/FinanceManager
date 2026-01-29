package com.example.Project_V1.service;

import com.example.Project_V1.dto.RegexLogDto;
import com.example.Project_V1.dto.RegexRequestDto;
import com.example.Project_V1.dto.RegexResponseDto;
import com.example.Project_V1.dto.RegexSaveRequestDto;
import com.example.Project_V1.dto.StatusUpdateRequestDto;
import com.example.Project_V1.entity.RegexLog;
import com.example.Project_V1.enums.RegexPatternStatus;
import com.example.Project_V1.repository.RegexLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.*;
import java.util.stream.Collectors;

@Service
public class RegexServiceImpl implements RegexService {

    private final RegexLogRepository regexLogRepository;

    public RegexServiceImpl(RegexLogRepository regexLogRepository) {
        this.regexLogRepository = regexLogRepository;
    }

    @Override
    public RegexResponseDto extract(RegexRequestDto requestDto) {
        // Validate required field
        if (requestDto.getPattern() == null || requestDto.getPattern().trim().isEmpty()) {
            throw new IllegalArgumentException("Pattern is required and cannot be empty");
        }

        Pattern pattern;
        try {
            pattern = Pattern.compile(requestDto.getPattern(), Pattern.CASE_INSENSITIVE);
        } catch (PatternSyntaxException e) {
            throw new IllegalArgumentException("Invalid regex pattern");
        }

        // Normalize text field
        String text = (requestDto.getText() != null && !requestDto.getText().trim().isEmpty()) 
                ? requestDto.getText() : "";

        Matcher matcher = pattern.matcher(text);
        RegexResponseDto response = new RegexResponseDto();

        boolean matchFound = matcher.find();
        response.setMatchFound(matchFound);

        if (matchFound) {
            response.setAccountNumber(getGroup(matcher, "accountNumber"));
            response.setTransactionType(getGroup(matcher, "transactionType"));
            response.setAmount(getGroup(matcher, "amount"));
            response.setDate(getGroup(matcher, "date"));
            response.setVia(getGroup(matcher, "via"));
            response.setTo(getGroup(matcher, "to"));
            response.setAvailableBalance(getGroup(matcher, "availableBalance"));
            response.setReferenceNumber(getGroup(matcher, "referenceNumber"));
        }

        return response;
    }

    @Override
    public RegexLogDto saveRegexPattern(RegexSaveRequestDto requestDto) {
        // Validate required fields
        if (requestDto.getPattern() == null || requestDto.getPattern().trim().isEmpty()) {
            throw new IllegalArgumentException("Pattern is required and cannot be empty");
        }

        // Normalize optional fields to null if empty
        String pattern = requestDto.getPattern().trim();
        String text = (requestDto.getText() != null && !requestDto.getText().trim().isEmpty()) 
                ? requestDto.getText().trim() : null;
        String bankAddress = (requestDto.getBankAddress() != null && !requestDto.getBankAddress().trim().isEmpty()) 
                ? requestDto.getBankAddress().trim() : null;
        String bankName = (requestDto.getBankName() != null && !requestDto.getBankName().trim().isEmpty()) 
                ? requestDto.getBankName().trim() : null;
        String transactionType = (requestDto.getTransactionType() != null && !requestDto.getTransactionType().trim().isEmpty()) 
                ? requestDto.getTransactionType().trim() : null;
        String transactionCategory = (requestDto.getTransactionCategory() != null && !requestDto.getTransactionCategory().trim().isEmpty()) 
                ? requestDto.getTransactionCategory().trim() : null;
        String merchantName = (requestDto.getMerchantName() != null && !requestDto.getMerchantName().trim().isEmpty()) 
                ? requestDto.getMerchantName().trim() : null;

        // Validate the regex pattern
        try {
            Pattern.compile(pattern);
        } catch (PatternSyntaxException e) {
            throw new IllegalArgumentException("Invalid regex pattern: " + e.getMessage());
        }

        // Check if ID is provided and pattern exists
        if (requestDto.getId() > 0) {
            RegexLog existingLog = regexLogRepository.findById((long)requestDto.getId())
                    .orElse(null);

            if (existingLog != null) {
                // Update only the status
                RegexPatternStatus newStatus = requestDto.getStatus() != null
                        ? requestDto.getStatus()
                        : RegexPatternStatus.DRAFT;

                if(requestDto.getStatus() != null && existingLog.getStatus() != null && requestDto.getStatus() == existingLog.getStatus()){
                    throw new IllegalArgumentException("Pattern already exists in database");
                }
                existingLog.setStatus(newStatus);
                RegexLog updatedLog = regexLogRepository.save(existingLog);
                return convertToDto(updatedLog);
            }
        }
        else{
            if (regexLogRepository.existsByPattern(pattern, bankAddress)) {
                throw new IllegalArgumentException("Pattern already exists in database");
            }

            if (text != null && regexLogRepository.existsByText(text, bankAddress)) {
                throw new IllegalArgumentException("Message already exists in database");
            }
        }



        // Default to DRAFT if no status provided
        RegexPatternStatus status = requestDto.getStatus() != null
                ? requestDto.getStatus()
                : RegexPatternStatus.DRAFT;

        // Test if pattern matches the text (if text is provided)
        boolean matchFound = false;
        if (text != null) {
            Pattern compiledPattern = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE);
            Matcher matcher = compiledPattern.matcher(text);
            matchFound = matcher.find();
        }

        if(!matchFound && text != null){
            throw new Error("The regex pattern doesn't extract the message information");
        }
        
        RegexLog log = new RegexLog(
                pattern,
                text,
                matchFound,
                status,
                bankAddress,
                bankName,
                transactionType,
                transactionCategory,
                merchantName
        );

        RegexLog savedLog = regexLogRepository.save(log);
        return convertToDto(savedLog);
    }

    @Override
    public List<RegexLogDto> getAllDraftedPatternsAndMessages() {
        List<RegexLog> logs = regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.DRAFT);
        return logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegexLogDto> getAllRejectedPatternsAndMessages() {
        List<RegexLog> logs = regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.REJECTED);
        return logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegexLogDto> getAllApprovedPatternsAndMessages() {
        List<RegexLog> logs = regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.APPROVED);
        return logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegexLogDto> getAllPendingPatternsAndMessages() {
        List<RegexLog> logs = regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.PENDING);
        return logs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Safe named-group extraction.
     * Returns null if group does not exist or is not matched.
     */
//    private String getGroup(Matcher matcher, String groupName) {
//        if(matcher.group(groupName) != null){
//            return matcher.group(groupName);
//        }
//        return "";
//    }

    private String getGroup(Matcher matcher, String name) {
        try {
            String value = matcher.group(name);
            return (value != null && !value.isBlank()) ? value.trim() : null;
        } catch (IllegalArgumentException e) {
            System.out.println("This is illegal " + e);
            return null;
        }
    }

    /**
     * Convert RegexLog entity to DTO
     */
    private RegexLogDto convertToDto(RegexLog log) {
        RegexLogDto dto = new RegexLogDto();
        dto.setId(log.getId());
        dto.setPattern(log.getPattern());
        dto.setText(log.getText());
        dto.setMatchFound(log.isMatchFound());
        dto.setStatus(log.getStatus());
        dto.setCreatedAt(log.getCreatedAt());
        dto.setUpdatedAt(log.getUpdatedAt());
        dto.setBankAddress(log.getBankAddress());
        dto.setBankName(log.getBankName());
        dto.setTransactionType(log.getTransactionType());
        dto.setTransactionCategory(log.getTransactionCategory());
        dto.setMerchantName(log.getMerchantName());
        return dto;
    }

    @Override
    public RegexLogDto changePendingToApproved(Long id) {
        RegexLog log = regexLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Regex pattern not found with id: " + id));
        
        if (log.getStatus() != RegexPatternStatus.PENDING) {
            throw new IllegalStateException("Can only approve patterns with PENDING status. Current status: " + log.getStatus());
        }
        
        log.setStatus(RegexPatternStatus.APPROVED);
        RegexLog updatedLog = regexLogRepository.save(log);
        return convertToDto(updatedLog);
    }

    @Override
    public RegexLogDto changePendingToRejected(Long id) {
        RegexLog log = regexLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Regex pattern not found with id: " + id));
        
        if (log.getStatus() == RegexPatternStatus.APPROVED) {
            throw new IllegalStateException("Can't only reject patterns with APPROVED status. Current status: " + log.getStatus());
        }
        
        log.setStatus(RegexPatternStatus.REJECTED);
        RegexLog updatedLog = regexLogRepository.save(log);
        return convertToDto(updatedLog);
    }

    @Override
    public RegexLogDto updateStatus(StatusUpdateRequestDto requestDto) {
        if (requestDto.getId() == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        
        if (requestDto.getNewStatus() == null) {
            throw new IllegalArgumentException("New status cannot be null");
        }
        
        RegexLog log = regexLogRepository.findById(requestDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Regex pattern not found with id: " + requestDto.getId()));
        
        RegexPatternStatus currentStatus = log.getStatus();
        RegexPatternStatus newStatus = requestDto.getNewStatus();
        
        // Validate state transitions
        validateStatusTransition(currentStatus, newStatus);
        
        log.setStatus(newStatus);
        RegexLog updatedLog = regexLogRepository.save(log);
        return convertToDto(updatedLog);
    }

    @Override
    public RegexLogDto getRegexPatternById(Long id) {
        RegexLog log = regexLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Regex pattern not found with id: " + id));
        return convertToDto(log);
    }

    /**
     * Validates if a status transition is allowed
     * Valid transitions:
     * - DRAFT -> PENDING
     * - PENDING -> APPROVED
     * - PENDING -> REJECTED
     * - APPROVED -> REJECTED
     * - REJECTED -> PENDING (for re-review)
     * - DRAFT -> REJECTED (direct rejection)
     */
    private void validateStatusTransition(RegexPatternStatus currentStatus, RegexPatternStatus newStatus) {
        if (currentStatus == newStatus) {
            throw new IllegalStateException("New status must be different from current status");
        }
        
        boolean isValidTransition = switch (currentStatus) {
            case DRAFT -> newStatus == RegexPatternStatus.PENDING || 
                         newStatus == RegexPatternStatus.REJECTED;
            case PENDING -> newStatus == RegexPatternStatus.APPROVED || 
                           newStatus == RegexPatternStatus.REJECTED ||
                           newStatus == RegexPatternStatus.DRAFT;
            case APPROVED -> newStatus == RegexPatternStatus.REJECTED ||
                            newStatus == RegexPatternStatus.PENDING;
            case REJECTED -> newStatus == RegexPatternStatus.PENDING ||
                            newStatus == RegexPatternStatus.DRAFT;
        };
        
        if (!isValidTransition) {
            throw new IllegalStateException(
                String.format("Invalid status transition from %s to %s", currentStatus, newStatus)
            );
        }
    }
}
