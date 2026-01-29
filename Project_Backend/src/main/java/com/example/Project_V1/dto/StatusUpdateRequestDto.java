package com.example.Project_V1.dto;

import com.example.Project_V1.enums.RegexPatternStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequestDto {
    private Long id;
    private RegexPatternStatus newStatus;
}
