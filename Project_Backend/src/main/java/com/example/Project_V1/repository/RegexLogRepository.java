package com.example.Project_V1.repository;

import com.example.Project_V1.entity.RegexLog;
import com.example.Project_V1.enums.RegexPatternStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegexLogRepository extends JpaRepository<RegexLog, Long> {
    List<RegexLog> findByStatus(RegexPatternStatus status);
    List<RegexLog> findByStatusOrderByCreatedAtDesc(RegexPatternStatus status);
    
    // Find approved patterns by bank address
    List<RegexLog> findByStatusAndBankAddressOrderByCreatedAtDesc(RegexPatternStatus status, String bankAddress);

    boolean existsByPattern(String pattern, String bankAddress);

    boolean existsByText(String text, String bankAddress);
}
