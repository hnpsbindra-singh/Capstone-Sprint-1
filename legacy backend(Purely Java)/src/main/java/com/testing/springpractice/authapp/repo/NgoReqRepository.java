package com.testing.springpractice.authapp.repo;

import com.testing.springpractice.authapp.models.Donation;
import com.testing.springpractice.authapp.models.DonationStatus;
import com.testing.springpractice.authapp.models.NgoRequest;
import com.testing.springpractice.authapp.models.RequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NgoReqRepository extends MongoRepository<NgoRequest, String> {
    List<NgoRequest> findByNgoId(String ngoId);

    List<NgoRequest> findByStatusNot(RequestStatus status);
}
