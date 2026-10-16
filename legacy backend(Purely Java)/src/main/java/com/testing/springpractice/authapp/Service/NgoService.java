package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.DTO.CreateNgoRequest;
import com.testing.springpractice.authapp.models.*;
import com.testing.springpractice.authapp.repo.DonationRepository;
import com.testing.springpractice.authapp.repo.NgoReqRepository;
import com.testing.springpractice.authapp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NgoService {
    @Autowired
    NgoReqRepository ngoReqRepository;

    @Autowired
    EmailService emailService;
    @Autowired
    UserRepo userRepo;

    @Autowired
    DonationRepository donationRepository;

    public List<Donation> availableDonations(
            String ngoId
    ){

        List<NgoRequest> requests =
                ngoReqRepository.findByNgoId(ngoId);

        List<String> requestIds =
                requests.stream()
                        .map(NgoRequest::getId)
                        .toList();

        return donationRepository
                .findByNgoRequestIdInAndStatus(
                        requestIds,
                        DonationStatus.PENDING
                );
    }

    public List<NgoRequest> myRequests(String ngoId){
        return ngoReqRepository.findByNgoId(ngoId);
    }
    public NgoRequest request(CreateNgoRequest request, String ngoId) {
        NgoRequest ngoRequest = new NgoRequest();
        ngoRequest.setDescription(request.getDescription());
        ngoRequest.setLocation(new GeoJsonPoint(request.getLongitude(), request.getLatitude()));
        ngoRequest.setNgoId(ngoId);
        ngoRequest.setTitle(request.getTitle());
        ngoRequest.setResourceNeeded(request.getResourceNeeded());
        ngoRequest.setQuantityNeeded(request.getQuantityNeeded());
        ngoRequest.setQuantityReceived(0L);
        ngoRequest.setStatus(RequestStatus.OPEN);

        return ngoReqRepository.save(ngoRequest);



    }

    public void accept(String id, String ngoId) {

        Donation donation =
                donationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Donation not found"
                                )
                        );

        String ngoRequestId =
                donation.getNgoRequestId();

        NgoRequest ngoRequest =
                ngoReqRepository.findById(ngoRequestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "NGO Request not found"
                                )
                        );


        if(!ngoRequest.getNgoId().equals(ngoId)) {

            throw new RuntimeException(
                    "Invalid Access"
            );
        }



        if(donation.getStatus()
                != DonationStatus.PENDING) {

            throw new RuntimeException(
                    "Donation must be in pending queue first"
            );
        }



        long remaining =
                ngoRequest.getQuantityNeeded()
                        - ngoRequest.getQuantityReceived();

        if(donation.getQuantity() > remaining){

            throw new RuntimeException(
                    "Donation exceeds required quantity"
            );
        }



        donation.setStatus(
                DonationStatus.ACCEPTED
        );



        long updatedQuantity =
                ngoRequest.getQuantityReceived()
                        + donation.getQuantity();

        ngoRequest.setQuantityReceived(
                updatedQuantity
        );



        if(updatedQuantity
                >= ngoRequest.getQuantityNeeded()) {

            ngoRequest.setStatus(
                    RequestStatus.COMPLETED
            );
        }



        ngoReqRepository.save(ngoRequest);



        System.out.println(donation.getDonorId());

        emailService.sendAcceptance(
                donation.getDonorId()
        );



        donationRepository.save(donation);
    }

    public void deliever(String id, String ngoId) {
        Donation donation =
                donationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Donation not found"
                                )
                        );

        String ngoRequestId =
                donation.getNgoRequestId();

        NgoRequest ngoRequest =
                ngoReqRepository.findById(ngoRequestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "NGO Request not found"
                                )
                        );

        if(!ngoRequest.getNgoId().equals(ngoId)) {

            throw new RuntimeException(
                    "Invalid Access"
            );
        }

        if(donation.getStatus()
                != DonationStatus.ACCEPTED) {

            throw new RuntimeException(
                    "Donation must be accepted first"
            );
        }
        donation.setStatus(
                DonationStatus.DELIVERED
        );

        Users user = userRepo.findById(donation.getDonorId()).orElseThrow(
                ()-> new RuntimeException("Donor Not Found"));
        emailService.sendDelieverd(user.getUsername());

        donationRepository.save(donation);
    }

    public List<NgoRequest> allRequests() {
        return ngoReqRepository.findAll();
    }

    public List<Donation> allDonations() {
        return donationRepository.findAll();

    }
}
