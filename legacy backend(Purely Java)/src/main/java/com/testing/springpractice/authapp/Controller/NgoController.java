package com.testing.springpractice.authapp.Controller;

import com.testing.springpractice.authapp.DTO.CreateNgoRequest;
import com.testing.springpractice.authapp.DTO.HeatmapResponse;
import com.testing.springpractice.authapp.Service.EmailService;
import com.testing.springpractice.authapp.Service.NgoService;
import com.testing.springpractice.authapp.Service.RegionSeverityService;
import com.testing.springpractice.authapp.models.Donation;
import com.testing.springpractice.authapp.models.NgoRequest;
import com.testing.springpractice.authapp.models.RegionSeverity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ngo")
public class NgoController {
    @Autowired
    NgoService ngoService;

    @Autowired
    EmailService emailService;
    @Autowired
    RegionSeverityService regionSeverityService;

    @PostMapping("/request")
    public NgoRequest request(@RequestBody CreateNgoRequest request, @RequestParam String ngoId){
        return ngoService.request(request, ngoId);
    }
    @GetMapping("/heatmap")
    public List<HeatmapResponse> heatmap() {

        return regionSeverityService.getHeatmap();
    }

    @GetMapping("/available-donations")
    public List<Donation> availableDonations(
            @RequestParam String ngoId
    ){
        return ngoService.availableDonations(ngoId);
    }
    @GetMapping("/my-requests")
    public List<NgoRequest> myRequests(
            @RequestParam String ngoId
    ){
        return ngoService.myRequests(ngoId);
    }

    @PostMapping("/accept/{id}")
    public void acceptDonation(@PathVariable String id, @RequestParam String ngoId){
        ngoService.accept(id, ngoId);
    }
    @PostMapping("/delivered/{id}")
    public void deliveredDonation(@PathVariable String id, @RequestParam String ngoId){
        ngoService.deliever(id, ngoId);
    }



}
