package com.testing.springpractice.authapp.repo;

import com.testing.springpractice.authapp.models.FloodReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloodReportRepository extends MongoRepository<FloodReport, String> {
    List<FloodReport> findByVictimId(String victimId);
}
