package com.example.Project_V1.controller;

import com.example.Project_V1.dto.RegexLogDto;
import com.example.Project_V1.dto.RegexRequestDto;
import com.example.Project_V1.dto.RegexResponseDto;
import com.example.Project_V1.dto.RegexSaveRequestDto;
import com.example.Project_V1.dto.StatusUpdateRequestDto;
import com.example.Project_V1.service.RegexService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/regex")

public class RegexController {

    private final RegexService regexService;

    public RegexController(RegexService regexService) {
        this.regexService = regexService;
    }

    @PostMapping("/extract")
    public RegexResponseDto extractRegex(@RequestBody RegexRequestDto requestDto) {
        return regexService.extract(requestDto);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveRegexPattern(@RequestBody RegexSaveRequestDto requestDto) {
        try {
            RegexLogDto savedPattern = regexService.saveRegexPattern(requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPattern);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.ALREADY_REPORTED).body(errorResponse);
        }
    }

    @GetMapping("/drafted")
    public ResponseEntity<List<RegexLogDto>> getAllDraftedPatterns() {
        List<RegexLogDto> patterns = regexService.getAllDraftedPatternsAndMessages();
        return ResponseEntity.ok(patterns);
    }

    @GetMapping("/rejected")
    public ResponseEntity<List<RegexLogDto>> getAllRejectedPatterns() {
        List<RegexLogDto> patterns = regexService.getAllRejectedPatternsAndMessages();
        return ResponseEntity.ok(patterns);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<RegexLogDto>> getAllApprovedPatterns() {
        List<RegexLogDto> patterns = regexService.getAllApprovedPatternsAndMessages();
        return ResponseEntity.ok(patterns);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<RegexLogDto>> getAllPendingPatterns() {
        List<RegexLogDto> patterns = regexService.getAllPendingPatternsAndMessages();
        return ResponseEntity.ok(patterns);
    }

    @GetMapping("/getRegexPatternById")
    public ResponseEntity<?> getRegexPatternById(@RequestBody Long id) {
        try {
            RegexLogDto pattern = regexService.getRegexPatternById(id);
            return ResponseEntity.ok(pattern);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    @PostMapping("/pending-to-approved")
    public ResponseEntity<?> changePendingToApproved(@RequestBody Long id) {
        try {
            RegexLogDto updatedPattern = regexService.changePendingToApproved(id);
            return ResponseEntity.ok(updatedPattern);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/pending-to-rejected")
    public ResponseEntity<?> changePendingToRejected(@RequestBody Long id) {
        try {
            RegexLogDto updatedPattern = regexService.changePendingToRejected(id);
            return ResponseEntity.ok(updatedPattern);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody StatusUpdateRequestDto requestDto) {
        try {
            RegexLogDto updatedPattern = regexService.updateStatus(requestDto);
            return ResponseEntity.ok(updatedPattern);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
