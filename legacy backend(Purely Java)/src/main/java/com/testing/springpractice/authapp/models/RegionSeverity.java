package com.testing.springpractice.authapp.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "RegionSeverity")
public class RegionSeverity {

    @Id
    private String id;
    @GeoSpatialIndexed
    private GeoJsonPoint location;
    private Double averageSeverity;
    private Integer reportCount;
    private String riskLevel;
    private Long updatedAt;
}