package com.testing.springpractice.authapp.repo;

import com.testing.springpractice.authapp.models.Donation;
import com.testing.springpractice.authapp.models.DonationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends MongoRepository<Donation, String> {
    List<Donation> findByStatus(String pending);
    List<Donation> findByNgoRequestIdInAndStatus(
            List<String> ngoRequestIds,
            DonationStatus status
    );
    List<Donation> findByDonorId(String donorId);
}
