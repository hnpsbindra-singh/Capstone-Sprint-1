package com.testing.springpractice.victimservice.Service;

import com.testing.springpractice.victimservice.DTO.CreateFloodReport;
import com.testing.springpractice.victimservice.DTO.FloodScoreRequestDTO;
import com.testing.springpractice.victimservice.DTO.FloodScoreResponseDTO;
import com.testing.springpractice.victimservice.DTO.JwtPrincipal;
import com.testing.springpractice.victimservice.models.FloodReport;
import com.testing.springpractice.victimservice.models.RegionSeverity;
import com.testing.springpractice.victimservice.repo.FloodReportRepository;
import com.testing.springpractice.victimservice.repo.RegionSeverityRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class VictimService {

    private final FloodReportRepository floodReportRepository;
    private final String API_URL = "http://localhost:8000/api/v1/score-base64";
    private final RegionSeverityRepository regionSeverityRepository;
    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://localhost:5001}")
    private String authServiceUrl;

    public VictimService(FloodReportRepository floodReportRepository, RegionSeverityRepository regionSeverityRepository, RestTemplate restTemplate) {
        this.floodReportRepository = floodReportRepository;
        this.regionSeverityRepository = regionSeverityRepository;
        this.restTemplate = restTemplate;
    }

    public FloodReport create(CreateFloodReport report, MultipartFile file) throws IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        JwtPrincipal jwtPrincipal = (JwtPrincipal) authentication.getPrincipal();

        checkIfVictimIsBlocked(jwtPrincipal.getUsername());

        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
        FloodScoreRequestDTO requestDTO = FloodScoreRequestDTO.builder()
                .imageBase64(base64Image)
                .build();

        FloodScoreResponseDTO responseDTO = null;
        try {
            responseDTO = restTemplate.postForObject(API_URL, requestDTO, FloodScoreResponseDTO.class);
        } catch (Exception e) {
            System.err.println("AI Service call failed: " + e.getMessage());
        }

        Integer score = (responseDTO != null && responseDTO.getSeverityScore() != null)
                ? responseDTO.getSeverityScore() : 1;
        String title = (responseDTO != null && responseDTO.getTitle() != null)
                ? responseDTO.getTitle() : "Flood Incident";
        String description = (responseDTO != null && responseDTO.getDescription() != null)
                ? responseDTO.getDescription() : "Emergency flood report recorded.";
        String severityLevel = (responseDTO != null && responseDTO.getSeverityLevel() != null)
                ? responseDTO.getSeverityLevel() : calculateRiskLevel(score);
        String rescuePriority = (responseDTO != null && responseDTO.getRescuePriority() != null)
                ? responseDTO.getRescuePriority() : (score >= 8 ? "Critical" : score >= 6 ? "High" : "Low");
        String whatIsInImage = (responseDTO != null && responseDTO.getWhatIsInImage() != null)
                ? responseDTO.getWhatIsInImage() : "Visual flood assessment recorded.";
        String estimatedDepth = (responseDTO != null && responseDTO.getEstimatedDepth() != null)
                ? responseDTO.getEstimatedDepth() : "Depth under evaluation";
        String roadAccess = (responseDTO != null && responseDTO.getRoadAccess() != null)
                ? responseDTO.getRoadAccess() : "Exercise standard caution.";
        List<String> recommendations = (responseDTO != null && responseDTO.getRecommendations() != null)
                ? responseDTO.getRecommendations() : Collections.singletonList("Stay in a secure elevated location.");

        FloodReport floodReport = new FloodReport();
        floodReport.setVictimId(jwtPrincipal.getUserId());
        floodReport.setTitle(title);
        floodReport.setDescription(description);
        floodReport.setLocation(new GeoJsonPoint(report.getLongitude(), report.getLatitude()));
        floodReport.setActive(true);
        floodReport.setIsDeleted(false);
        floodReport.setSeverityScore(score);
        floodReport.setSeverityLevel(severityLevel);
        floodReport.setRescuePriority(rescuePriority);
        floodReport.setWhatIsInImage(whatIsInImage);
        floodReport.setEstimatedDepth(estimatedDepth);
        floodReport.setRoadAccess(roadAccess);
        floodReport.setRecommendations(recommendations);
        floodReport.setCreatedAt(System.currentTimeMillis());

        FloodReport savedReport = floodReportRepository.save(floodReport);

        double roundedLat = Math.round(report.getLatitude() * 100.0) / 100.0;
        double roundedLng = Math.round(report.getLongitude() * 100.0) / 100.0;
        RegionSeverity region = regionSeverityRepository.findByCoordinates(roundedLng, roundedLat);

        if (region != null) {
            int oldCount = region.getReportCount();
            double oldAverage = region.getAverageSeverity();
            double newAverage = ((oldAverage * oldCount) + score) / (oldCount + 1);
            region.setAverageSeverity(newAverage);
            region.setReportCount(oldCount + 1);
            region.setRiskLevel(calculateRiskLevel(newAverage));
            region.setUpdatedAt(System.currentTimeMillis());
            regionSeverityRepository.save(region);
        } else {
            RegionSeverity newRegion = new RegionSeverity();
            newRegion.setLocation(new GeoJsonPoint(roundedLng, roundedLat));
            newRegion.setAverageSeverity((double) score);
            newRegion.setReportCount(1);
            newRegion.setRiskLevel(calculateRiskLevel(score));
            newRegion.setUpdatedAt(System.currentTimeMillis());
            regionSeverityRepository.save(newRegion);
        }

        return savedReport;
    }

    private void checkIfVictimIsBlocked(String username) {
        try {
            String checkUrl = authServiceUrl + "/api/auth/internal/user/" + username;
            Map<String, Object> user = restTemplate.getForObject(checkUrl, Map.class);
            if (user != null && Boolean.TRUE.equals(user.get("isBlockedFromReporting"))) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Your account has been blocked from reporting flood incidents by the administrator."
                );
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("[VictimService] Auth check note: " + e.getMessage());
        }
    }

    public FloodReport softDeleteReport(String reportId) {
        FloodReport report = floodReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flood report not found with id: " + reportId));

        if (Boolean.TRUE.equals(report.getIsDeleted())) {
            return report;
        }

        report.setIsDeleted(true);
        report.setActive(false);
        report.setDeletedAt(System.currentTimeMillis());
        FloodReport saved = floodReportRepository.save(report);

        try {
            if (report.getLocation() != null) {
                double roundedLng = Math.round(report.getLocation().getX() * 100.0) / 100.0;
                double roundedLat = Math.round(report.getLocation().getY() * 100.0) / 100.0;
                RegionSeverity region = regionSeverityRepository.findByCoordinates(roundedLng, roundedLat);
                if (region != null && region.getReportCount() > 0) {
                    int oldCount = region.getReportCount();
                    if (oldCount <= 1) {
                        regionSeverityRepository.delete(region);
                    } else {
                        double oldAvg = region.getAverageSeverity();
                        int score = report.getSeverityScore() != null ? report.getSeverityScore() : 1;
                        double newAvg = Math.max(0, ((oldAvg * oldCount) - score) / (oldCount - 1));
                        region.setReportCount(oldCount - 1);
                        region.setAverageSeverity(newAvg);
                        region.setRiskLevel(calculateRiskLevel(newAvg));
                        region.setUpdatedAt(System.currentTimeMillis());
                        regionSeverityRepository.save(region);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[VictimService] Failed to adjust region severity on soft delete: " + e.getMessage());
        }

        return saved;
    }

    public List<FloodReport> getMyReports() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        JwtPrincipal jwtPrincipal = (JwtPrincipal) authentication.getPrincipal();
        return floodReportRepository.findActiveByVictimId(jwtPrincipal.getUserId());
    }

    private String calculateRiskLevel(double avg) {
        if (avg < 3) {
            return "LOW";
        } else if (avg < 6) {
            return "MEDIUM";
        } else if (avg < 8) {
            return "HIGH";
        } else {
            return "CRITICAL";
        }
    }

    public List<FloodReport> getAllReports() {
        return floodReportRepository.findAllActive();
    }
}
