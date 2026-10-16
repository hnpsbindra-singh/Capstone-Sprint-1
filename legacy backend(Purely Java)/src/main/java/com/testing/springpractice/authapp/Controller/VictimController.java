package com.testing.springpractice.authapp.Controller;

import com.testing.springpractice.authapp.DTO.CreateFloodReport;
import com.testing.springpractice.authapp.DTO.HeatmapResponse;
import com.testing.springpractice.authapp.Service.RegionSeverityService;
import com.testing.springpractice.authapp.Service.VictimService;
import com.testing.springpractice.authapp.models.FloodReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/victim")
public class VictimController {
    @Autowired
    RegionSeverityService regionSeverityService;
    @Autowired
    VictimService victimService;
    @GetMapping("/heatmap")
    public List<HeatmapResponse> heatmap() {

        return regionSeverityService.getHeatmap();
    }

    @PostMapping("/create")
    public FloodReport create(@RequestBody CreateFloodReport report
            , @RequestParam String victimId){
        return victimService.create(report, victimId);
    }
    @GetMapping("/my-reports")
    public List<FloodReport> myReports(
            @RequestParam String victimId
    ){
        return victimService.getMyReports(victimId);
    }
}
