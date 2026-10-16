package com.testing.springpractice.authapp.Controller;

import com.testing.springpractice.authapp.DTO.CreateDonation;
import com.testing.springpractice.authapp.DTO.HeatmapResponse;
import com.testing.springpractice.authapp.Service.DonorService;
import com.testing.springpractice.authapp.Service.RegionSeverityService;
import com.testing.springpractice.authapp.models.Donation;
import com.testing.springpractice.authapp.models.NgoRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donor")
public class DonorController {
    @Autowired
    RegionSeverityService regionSeverityService;
    @Autowired
    DonorService donorService;
    @GetMapping("/heatmap")
    public List<HeatmapResponse> heatmap() {

        return regionSeverityService.getHeatmap();
    }




    @GetMapping("/requests")
    public List<NgoRequest> requests(){
        return donorService.requests();
    }


    @PostMapping("/donate/{ngoRequestId}")
    public Donation donate(
            @RequestBody CreateDonation donation,
            @RequestParam String donorId,
            @PathVariable String ngoRequestId
    ){
        return donorService.donate(
                donation,
                donorId,
                ngoRequestId
        );
    }

    @GetMapping("/my-donations")
    public List<Donation> myDonations(
            @RequestParam String donorId
    ){
        return donorService.myDonations(donorId);
    }
}
