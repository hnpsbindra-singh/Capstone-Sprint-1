package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.DTO.CreateDonation;
import com.testing.springpractice.authapp.models.Donation;
import com.testing.springpractice.authapp.models.DonationStatus;
import com.testing.springpractice.authapp.models.NgoRequest;
import com.testing.springpractice.authapp.models.RequestStatus;
import com.testing.springpractice.authapp.repo.DonationRepository;
import com.testing.springpractice.authapp.repo.NgoReqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.AccessType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonorService {
    @Autowired
    DonationRepository donationRepository;
    @Autowired
    NgoReqRepository ngoReqRepository;
    public List<NgoRequest> requests() {
        return ngoReqRepository.findByStatusNot(RequestStatus.COMPLETED);
    }

    public Donation donate(
            CreateDonation donation,
            String donorId,
            String ngoRequestId
    ) {


        NgoRequest ngoRequest =
                ngoReqRepository.findById(ngoRequestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "NGO Request Not Found"
                                )
                        );


        if(ngoRequest.getStatus()
                == RequestStatus.COMPLETED){

            throw new RuntimeException(
                    "Request already completed"
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

        // CREATE DONATION

        Donation newDonation =
                new Donation();

        newDonation.setDonorId(donorId);

        newDonation.setNgoRequestId(
                ngoRequestId
        );

        newDonation.setItemName(
                donation.getItemName()
        );

        newDonation.setQuantity(
                donation.getQuantity()
        );

        newDonation.setStatus(
                DonationStatus.PENDING
        );



        return donationRepository.save(
                newDonation
        );
    }

    public List<Donation> myDonations(String donorId) {
        return donationRepository.findByDonorId(donorId);
    }
}
