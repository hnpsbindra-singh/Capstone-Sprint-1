package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.DTO.HeatmapResponse;
import com.testing.springpractice.authapp.models.RegionSeverity;
import com.testing.springpractice.authapp.repo.RegionSeverityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegionSeverityService {
    @Autowired
    RegionSeverityRepository regionSeverityRepository;

    public List<HeatmapResponse> getHeatmap() {

        List<RegionSeverity> regions =
                regionSeverityRepository.findAll();

        return regions.stream()
                .map(region -> {

                    HeatmapResponse response =
                            new HeatmapResponse();

                    response.setLatitude(
                            region.getLocation().getY()
                    );

                    response.setLongitude(
                            region.getLocation().getX()
                    );

                    response.setAverageSeverity(
                            region.getAverageSeverity()
                    );

                    response.setReportCount(
                            region.getReportCount()
                    );

                    response.setRiskLevel(
                            region.getRiskLevel()
                    );

                    return response;

                }).toList();
    }
}
