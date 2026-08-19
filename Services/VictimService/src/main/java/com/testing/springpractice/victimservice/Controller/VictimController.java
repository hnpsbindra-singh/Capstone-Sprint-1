package com.testing.springpractice.victimservice.Controller;

import com.testing.springpractice.victimservice.DTO.CreateFloodReport;
import com.testing.springpractice.victimservice.DTO.HeatmapResponse;
import com.testing.springpractice.victimservice.Service.RegionSeverityService;
import com.testing.springpractice.victimservice.Service.VictimService;
import com.testing.springpractice.victimservice.models.FloodReport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/victim")
public class VictimController {
    final private RegionSeverityService regionSeverityService;
    final private VictimService victimService;

    public VictimController(RegionSeverityService regionSeverityService, VictimService victimService) {
        this.regionSeverityService = regionSeverityService;
        this.victimService = victimService;
    }

    @GetMapping("/heatmap")
    public List<HeatmapResponse> heatmap() {

        return regionSeverityService.getHeatmap();
    }

    @PostMapping("/create")
    public FloodReport create(@RequestPart CreateFloodReport report,
                              @RequestPart MultipartFile file) throws IOException {
        return victimService.create(report, file);
    }
    @GetMapping("/my-reports")
    public List<FloodReport> myReports(

    ){
        return victimService.getMyReports();
    }
    @GetMapping("/internal/reports")
    public List<FloodReport> getInternalReports() {
        return victimService.getAllReports();
    }

    @GetMapping("/internal/heatmap")
    public List<HeatmapResponse> getInternalHeatmap() {
        return regionSeverityService.getHeatmap();
    }

    @DeleteMapping("/internal/reports/{id}")
    public FloodReport softDeleteInternalReport(@PathVariable String id) {
        return victimService.softDeleteReport(id);
    }
}
