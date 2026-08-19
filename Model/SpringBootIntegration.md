# AI Model Integration Guide (Full Auto-Report Details)

The AI model analyzes the submitted flood image and automatically generates the complete assessment payload, including **Title**, **Description**, **What is in the Image**, **Estimated Water Depth**, **Road Access**, **Severity Score**, **Rescue Priority**, and **Recommendations**.

---

## 1. AI API Endpoints

### Endpoint A: Base64 String (Recommended for Spring Boot `Base64.getEncoder()`)
* **URL**: `POST http://localhost:8000/api/v1/score-base64`
* **Content-Type**: `application/json`
* **Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

### Endpoint B: Multipart File Upload
* **URL**: `POST http://localhost:8000/api/v1/score`
* **Content-Type**: `multipart/form-data`
* **File Key**: `file`

---

## 2. Complete AI JSON Response

```json
{
  "severity_score": 8,
  "severity_level": "Severe",
  "rescue_priority": "Critical",
  "confidence": 0.96,
  "title": "Severe Flood Emergency: Ground Level & Vehicle Submergence",
  "description": "CRITICAL: Severe flood inundation detected (54.2% ground coverage). Ground-floor living quarters and vehicles submerged. Immediate evacuation required.",
  "what_is_in_image": "Heavy flood deluge covering 58.4% of image. Complete ground-floor submersion, trapped vehicles, and dangerous flood currents.",
  "estimated_depth": "85 – 130 cm (Chest-Deep / Ground Floor)",
  "road_access": "Only inflatable rescue crafts and NDRF boats can operate.",
  "recommendations": [
    "Severe flooding, submerged vehicles and building levels.",
    "Issue mandatory evacuation orders."
  ]
}
```

---

## 3. Spring Boot Java DTO

```java
package com.testing.springpractice.authapp.DTO;

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
    private Integer severityScore; // 1 to 10

    @JsonProperty("severity_level")
    private String severityLevel; // e.g. "Severe", "Moderate", "Minor"

    @JsonProperty("rescue_priority")
    private String rescuePriority; // e.g. "Critical", "High", "Medium", "None"

    @JsonProperty("confidence")
    private Double confidence; // e.g. 0.96

    @JsonProperty("title")
    private String title; // AI-Generated Incident Title

    @JsonProperty("description")
    private String description; // AI-Generated Situational Description

    @JsonProperty("what_is_in_image")
    private String whatIsInImage; // AI Scene & Visual Breakdown

    @JsonProperty("estimated_depth")
    private String estimatedDepth; // e.g. "85 – 130 cm (Chest-Deep / Ground Floor)"

    @JsonProperty("road_access")
    private String roadAccess; // e.g. "Only inflatable rescue crafts and NDRF boats can operate."

    @JsonProperty("recommendations")
    private List<String> recommendations; // Safety Protocols
}
```

---

## 4. Spring Boot Service Integration Example

```java
// Convert image to base64
String base64Image = Base64.getEncoder().encodeToString(file.getBytes());

FloodScoreRequestDTO aiRequest = FloodScoreRequestDTO.builder()
        .imageBase64(base64Image)
        .build();

// Call AI Service
FloodScoreResponseDTO aiResponse = restTemplate.postForObject(
        "http://localhost:8000/api/v1/score-base64",
        aiRequest,
        FloodScoreResponseDTO.class
);

// Populate FloodReport entity using AI generated values
FloodReport floodReport = new FloodReport();
floodReport.setVictimId(currentUser.getId());
floodReport.setTitle(aiResponse.getTitle());
floodReport.setDescription(aiResponse.getDescription());
floodReport.setSeverityScore(aiResponse.getSeverityScore());
floodReport.setLocation(new GeoJsonPoint(report.getLongitude(), report.getLatitude()));

floodReportRepository.save(floodReport);
```
