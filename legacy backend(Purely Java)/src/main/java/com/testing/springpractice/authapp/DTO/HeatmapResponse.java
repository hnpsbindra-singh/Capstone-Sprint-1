package com.testing.springpractice.authapp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapResponse {

    private Double latitude;
    private Double longitude;

    private Double averageSeverity;

    private Integer reportCount;

    private String riskLevel;
}