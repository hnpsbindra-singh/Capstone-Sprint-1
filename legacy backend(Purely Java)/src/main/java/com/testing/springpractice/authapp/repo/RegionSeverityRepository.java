package com.testing.springpractice.authapp.repo;

import com.testing.springpractice.authapp.models.RegionSeverity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionSeverityRepository extends MongoRepository<RegionSeverity, String> {
    @Query("{ 'location.coordinates': [ ?0, ?1 ] }")
    RegionSeverity findByCoordinates(
            double longitude,
            double latitude
    );
}
