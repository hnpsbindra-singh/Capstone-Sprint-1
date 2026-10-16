package com.testing.springpractice.authapp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFloodReport {
    private String title;
    private String description;
    private Double latitude;
    private Double longitude;
    private Integer severityScore;
}
