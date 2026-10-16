package com.testing.springpractice.authapp.Controller;

import com.testing.springpractice.authapp.DTO.HeatmapResponse;
import com.testing.springpractice.authapp.Service.AdminService;
import com.testing.springpractice.authapp.Service.NgoService;
import com.testing.springpractice.authapp.Service.RegionSeverityService;
import com.testing.springpractice.authapp.models.Donation;
import com.testing.springpractice.authapp.models.FloodReport;
import com.testing.springpractice.authapp.models.NgoRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    AdminService adminService;

    @Autowired
    RegionSeverityService regionSeverityService;

    @Autowired
    NgoService ngoService;

    @GetMapping("/reports")
    public List<FloodReport> reports(){
        return adminService.reports();
    }

    @GetMapping("/heatmap")
    public List<HeatmapResponse> heatmap(){
        return regionSeverityService.getHeatmap();
    }

    @GetMapping("/ngo-requests")
    public List<NgoRequest> ngoRequests(){
        return ngoService.allRequests();
    }

    @GetMapping("/donations")
    public List<Donation> donations(){
        return ngoService.allDonations();
    }
}
