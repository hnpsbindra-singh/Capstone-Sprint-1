package com.testing.springpractice.victimservice.repo;

import com.testing.springpractice.victimservice.models.FloodReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloodReportRepository extends MongoRepository<FloodReport, String> {
    @Query(value = "{ 'victimId': ?0, 'isDeleted': { $ne: true } }", sort = "{ 'severityScore': -1 }")
    List<FloodReport> findActiveByVictimId(String victimId);

    @Query(value = "{ 'isDeleted': { $ne: true } }", sort = "{ 'severityScore': -1 }")
    List<FloodReport> findAllActive();

    List<FloodReport> findByVictimIdOrderBySeverityScoreDesc(String victimId);

    List<FloodReport> findAllByOrderBySeverityScoreDesc();
}
