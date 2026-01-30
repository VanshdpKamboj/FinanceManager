package com.example.Project_V1.service;

import com.example.Project_V1.dto.RegexLogDto;
import com.example.Project_V1.dto.RegexRequestDto;
import com.example.Project_V1.dto.RegexResponseDto;
import com.example.Project_V1.dto.RegexSaveRequestDto;
import com.example.Project_V1.dto.StatusUpdateRequestDto;
import com.example.Project_V1.entity.RegexLog;
import com.example.Project_V1.enums.RegexPatternStatus;
import com.example.Project_V1.repository.RegexLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegexServiceImplTest {

    @Mock
    private RegexLogRepository regexLogRepository;

    @InjectMocks
    private RegexServiceImpl regexService;

    private RegexLog testRegexLog;
    private RegexSaveRequestDto saveRequestDto;
    private RegexRequestDto requestDto;

    @BeforeEach
    void setUp() {
        testRegexLog = new RegexLog();
        testRegexLog.setId(1L);
        testRegexLog.setPattern("(?<amount>\\d+\\.\\d{2})");
        testRegexLog.setText("Amount: 150.00");
        testRegexLog.setMatchFound(true);
        testRegexLog.setStatus(RegexPatternStatus.PENDING);
        testRegexLog.setBankAddress("HDFC-BANK");
        testRegexLog.setCreatedAt(LocalDateTime.now());
        testRegexLog.setUpdatedAt(LocalDateTime.now());

        saveRequestDto = new RegexSaveRequestDto();
        saveRequestDto.setPattern("(?<amount>\\d+\\.\\d{2})");
        saveRequestDto.setText("Amount: 150.00");
        saveRequestDto.setBankAddress("HDFC-BANK");
        saveRequestDto.setStatus(RegexPatternStatus.DRAFT);

        requestDto = new RegexRequestDto();
        requestDto.setPattern("(?<amount>\\d+\\.\\d{2})");
        requestDto.setText("Amount: 150.00");
    }

    @Test
    void extract_Success_WithMatch() {
        RegexResponseDto response = regexService.extract(requestDto);

        assertNotNull(response);
        assertTrue(response.isMatchFound());
        assertEquals("150.00", response.getAmount());
    }

    @Test
    void extract_NoMatch() {
        requestDto.setText("No match here");

        RegexResponseDto response = regexService.extract(requestDto);

        assertNotNull(response);
        assertFalse(response.isMatchFound());
    }

    @Test
    void extract_EmptyPattern_ThrowsException() {
        requestDto.setPattern("");

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.extract(requestDto);
        });
    }

    @Test
    void extract_NullPattern_ThrowsException() {
        requestDto.setPattern(null);

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.extract(requestDto);
        });
    }

    @Test
    void extract_InvalidPattern_ThrowsException() {
        requestDto.setPattern("(?<invalid");

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.extract(requestDto);
        });
    }

    @Test
    void extract_WithComplexPattern() {
        requestDto.setPattern("(?<transactionType>credited|debited).*?(?<amount>\\d+\\.\\d{2})");
        requestDto.setText("Your account has been credited with Rs.500.50");

        RegexResponseDto response = regexService.extract(requestDto);

        assertTrue(response.isMatchFound());
        assertEquals("credited", response.getTransactionType());
        assertEquals("500.50", response.getAmount());
    }

    @Test
    void saveRegexPattern_Success() {
        when(regexLogRepository.existsByPattern(anyString(), anyString())).thenReturn(false);
        when(regexLogRepository.existsByText(anyString(), anyString())).thenReturn(false);
        when(regexLogRepository.save(any(RegexLog.class))).thenReturn(testRegexLog);

        RegexLogDto result = regexService.saveRegexPattern(saveRequestDto);

        assertNotNull(result);
        assertEquals(testRegexLog.getId(), result.getId());
        verify(regexLogRepository).save(any(RegexLog.class));
    }

    @Test
    void saveRegexPattern_EmptyPattern_ThrowsException() {
        saveRequestDto.setPattern("");

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.saveRegexPattern(saveRequestDto);
        });
    }

    @Test
    void saveRegexPattern_InvalidPattern_ThrowsException() {
        saveRequestDto.setPattern("(?<invalid");

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.saveRegexPattern(saveRequestDto);
        });
    }

    @Test
    void saveRegexPattern_PatternExists_ThrowsException() {
        when(regexLogRepository.existsByPattern(anyString(), anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.saveRegexPattern(saveRequestDto);
        });
    }

    @Test
    void saveRegexPattern_TextExists_ThrowsException() {
        when(regexLogRepository.existsByPattern(anyString(), anyString())).thenReturn(false);
        when(regexLogRepository.existsByText(anyString(), anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.saveRegexPattern(saveRequestDto);
        });
    }

    @Test
    void saveRegexPattern_NoMatchFound_ThrowsError() {
        saveRequestDto.setPattern("(?<amount>\\d+)");
        saveRequestDto.setText("No numbers here");
        when(regexLogRepository.existsByPattern(anyString(), anyString())).thenReturn(false);
        when(regexLogRepository.existsByText(anyString(), anyString())).thenReturn(false);

        assertThrows(Error.class, () -> {
            regexService.saveRegexPattern(saveRequestDto);
        });
    }

    @Test
    void saveRegexPattern_UpdateExisting_Success() {
        saveRequestDto.setId(1);
        saveRequestDto.setStatus(RegexPatternStatus.PENDING);
        testRegexLog.setStatus(RegexPatternStatus.DRAFT);
        
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));
        when(regexLogRepository.save(any(RegexLog.class))).thenReturn(testRegexLog);

        RegexLogDto result = regexService.saveRegexPattern(saveRequestDto);

        assertNotNull(result);
        verify(regexLogRepository).save(any(RegexLog.class));
    }

    @Test
    void saveRegexPattern_UpdateExisting_SameStatus_ThrowsException() {
        saveRequestDto.setId(1);
        saveRequestDto.setStatus(RegexPatternStatus.PENDING);
        
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.saveRegexPattern(saveRequestDto);
        });
    }

    @Test
    void getAllDraftedPatternsAndMessages_Success() {
        when(regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.DRAFT))
                .thenReturn(Arrays.asList(testRegexLog));

        List<RegexLogDto> result = regexService.getAllDraftedPatternsAndMessages();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(regexLogRepository).findByStatusOrderByCreatedAtDesc(RegexPatternStatus.DRAFT);
    }

    @Test
    void getAllRejectedPatternsAndMessages_Success() {
        when(regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.REJECTED))
                .thenReturn(Arrays.asList(testRegexLog));

        List<RegexLogDto> result = regexService.getAllRejectedPatternsAndMessages();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllApprovedPatternsAndMessages_Success() {
        when(regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.APPROVED))
                .thenReturn(Arrays.asList(testRegexLog));

        List<RegexLogDto> result = regexService.getAllApprovedPatternsAndMessages();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllPendingPatternsAndMessages_Success() {
        when(regexLogRepository.findByStatusOrderByCreatedAtDesc(RegexPatternStatus.PENDING))
                .thenReturn(Arrays.asList(testRegexLog));

        List<RegexLogDto> result = regexService.getAllPendingPatternsAndMessages();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getRegexPatternById_Success() {
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));

        RegexLogDto result = regexService.getRegexPatternById(1L);

        assertNotNull(result);
        assertEquals(testRegexLog.getId(), result.getId());
    }

    @Test
    void getRegexPatternById_NotFound_ThrowsException() {
        when(regexLogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.getRegexPatternById(999L);
        });
    }

    @Test
    void changePendingToApproved_Success() {
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));
        when(regexLogRepository.save(any(RegexLog.class))).thenReturn(testRegexLog);

        RegexLogDto result = regexService.changePendingToApproved(1L);

        assertNotNull(result);
        verify(regexLogRepository).save(any(RegexLog.class));
    }

    @Test
    void changePendingToApproved_NotPending_ThrowsException() {
        testRegexLog.setStatus(RegexPatternStatus.APPROVED);
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));

        assertThrows(IllegalStateException.class, () -> {
            regexService.changePendingToApproved(1L);
        });
    }

    @Test
    void changePendingToRejected_Success() {
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));
        when(regexLogRepository.save(any(RegexLog.class))).thenReturn(testRegexLog);

        RegexLogDto result = regexService.changePendingToRejected(1L);

        assertNotNull(result);
        verify(regexLogRepository).save(any(RegexLog.class));
    }

    @Test
    void changePendingToRejected_AlreadyApproved_ThrowsException() {
        testRegexLog.setStatus(RegexPatternStatus.APPROVED);
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));

        assertThrows(IllegalStateException.class, () -> {
            regexService.changePendingToRejected(1L);
        });
    }

    @Test
    void updateStatus_Success() {
        StatusUpdateRequestDto updateDto = new StatusUpdateRequestDto();
        updateDto.setId(1L);
        updateDto.setNewStatus(RegexPatternStatus.APPROVED);
        
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));
        when(regexLogRepository.save(any(RegexLog.class))).thenReturn(testRegexLog);

        RegexLogDto result = regexService.updateStatus(updateDto);

        assertNotNull(result);
        verify(regexLogRepository).save(any(RegexLog.class));
    }

    @Test
    void updateStatus_NullId_ThrowsException() {
        StatusUpdateRequestDto updateDto = new StatusUpdateRequestDto();
        updateDto.setNewStatus(RegexPatternStatus.APPROVED);

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.updateStatus(updateDto);
        });
    }

    @Test
    void updateStatus_NullStatus_ThrowsException() {
        StatusUpdateRequestDto updateDto = new StatusUpdateRequestDto();
        updateDto.setId(1L);

        assertThrows(IllegalArgumentException.class, () -> {
            regexService.updateStatus(updateDto);
        });
    }

    @Test
    void updateStatus_SameStatus_ThrowsException() {
        StatusUpdateRequestDto updateDto = new StatusUpdateRequestDto();
        updateDto.setId(1L);
        updateDto.setNewStatus(RegexPatternStatus.PENDING);
        
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));

        assertThrows(IllegalStateException.class, () -> {
            regexService.updateStatus(updateDto);
        });
    }

    @Test
    void updateStatus_InvalidTransition_ThrowsException() {
        testRegexLog.setStatus(RegexPatternStatus.DRAFT);
        StatusUpdateRequestDto updateDto = new StatusUpdateRequestDto();
        updateDto.setId(1L);
        updateDto.setNewStatus(RegexPatternStatus.APPROVED);
        
        when(regexLogRepository.findById(1L)).thenReturn(Optional.of(testRegexLog));

        assertThrows(IllegalStateException.class, () -> {
            regexService.updateStatus(updateDto);
        });
    }
}
