package com.testing.springpractice.victimservice.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FloodScoreResponseDTO {
    @JsonProperty("severity_score")
    private Integer severityScore;

    @JsonProperty("severity_level")
    private String severityLevel;

    @JsonProperty("rescue_priority")
    private String rescuePriority;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("what_is_in_image")
    private String whatIsInImage;

    @JsonProperty("estimated_depth")
    private String estimatedDepth;

    @JsonProperty("road_access")
    private String roadAccess;

    @JsonProperty("recommendations")
    private List<String> recommendations;
}
