package com.example.Project_V1.service;

import com.example.Project_V1.dto.RegexLogDto;
import com.example.Project_V1.dto.RegexRequestDto;
import com.example.Project_V1.dto.RegexResponseDto;
import com.example.Project_V1.dto.RegexSaveRequestDto;
import com.example.Project_V1.dto.StatusUpdateRequestDto;

import java.util.List;

public interface RegexService {
    RegexResponseDto extract(RegexRequestDto requestDto);
    
    RegexLogDto saveRegexPattern(RegexSaveRequestDto requestDto);
    
    List<RegexLogDto> getAllDraftedPatternsAndMessages();
    
    List<RegexLogDto> getAllRejectedPatternsAndMessages();
    
    List<RegexLogDto> getAllApprovedPatternsAndMessages();
    
    List<RegexLogDto> getAllPendingPatternsAndMessages();
    
    // Status transition methods
    RegexLogDto changePendingToApproved(Long id);
    
    RegexLogDto changePendingToRejected(Long id);
    
    RegexLogDto updateStatus(StatusUpdateRequestDto requestDto);
    
    RegexLogDto getRegexPatternById(Long id);
}
