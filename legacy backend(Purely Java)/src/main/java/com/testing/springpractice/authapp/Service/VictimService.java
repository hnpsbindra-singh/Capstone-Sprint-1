package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.DTO.CreateFloodReport;
import com.testing.springpractice.authapp.models.FloodReport;
import com.testing.springpractice.authapp.models.RegionSeverity;
import com.testing.springpractice.authapp.repo.FloodReportRepository;
import com.testing.springpractice.authapp.repo.RegionSeverityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VictimService {

    @Autowired
    FloodReportRepository floodReportRepository;

    @Autowired
    RegionSeverityRepository regionSeverityRepository;

    public FloodReport create(CreateFloodReport report, String victimId) {

        FloodReport floodReport = new FloodReport();
        floodReport.setTitle(report.getTitle());
        floodReport.setVictimId(victimId);
        floodReport.setLocation(
                new GeoJsonPoint(
                        report.getLongitude(),
                        report.getLatitude()
                )
        );
        floodReport.setSeverityScore(report.getSeverityScore());
        floodReport.setDescription(report.getDescription());
        FloodReport savedReport = floodReportRepository.save(floodReport);
        double roundedLat =
                Math.round(report.getLatitude() * 100.0) / 100.0;

        double roundedLng =
                Math.round(report.getLongitude() * 100.0) / 100.0;

        RegionSeverity region =
                regionSeverityRepository
                        .findByCoordinates(
                                roundedLat,
                                roundedLng
                        );
        if(region != null){

            int oldCount = region.getReportCount();

            double oldAverage = region.getAverageSeverity();

            double newAverage =
                    (
                            (oldAverage * oldCount)
                                    + report.getSeverityScore()
                    )
                            /
                            (oldCount + 1);


            region.setAverageSeverity(newAverage);

            region.setReportCount(oldCount + 1);

            region.setRiskLevel(
                    calculateRiskLevel(newAverage)
            );

            region.setUpdatedAt(System.currentTimeMillis());

            regionSeverityRepository.save(region);

        }

        else{

            RegionSeverity newRegion =
                    new RegionSeverity();

            newRegion.setLocation(
                    new GeoJsonPoint(
                            roundedLng,
                            roundedLat
                    )
            );

            newRegion.setAverageSeverity(
                    report.getSeverityScore().doubleValue()
            );

            newRegion.setReportCount(1);

            newRegion.setRiskLevel(
                    calculateRiskLevel(
                            report.getSeverityScore()
                    )
            );

            newRegion.setUpdatedAt(
                    System.currentTimeMillis()
            );

            regionSeverityRepository.save(newRegion);

        }

        return savedReport;
    }

    public List<FloodReport> getMyReports(String victimId){
        return floodReportRepository.findByVictimId(victimId);
    }


    private String calculateRiskLevel(double avg){

        if(avg < 3){
            return "LOW";
        }

        else if(avg < 6){
            return "MEDIUM";
        }

        else if(avg < 8){
            return "HIGH";
        }

        else{
            return "CRITICAL";
        }
    }
}