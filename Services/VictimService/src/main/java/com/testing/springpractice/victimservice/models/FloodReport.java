package com.testing.springpractice.victimservice.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "FloodReports")
public class FloodReport {
    @Id
    private String id;
    private String victimId;
    private String title;
    private String description;
    @GeoSpatialIndexed
    private GeoJsonPoint location;
    private Boolean active = Boolean.TRUE;
    private Integer severityScore;
    private String severityLevel;
    private String rescuePriority;
    private String whatIsInImage;
    private String estimatedDepth;
    private String roadAccess;
    private List<String> recommendations;
    private Long createdAt;
    private Boolean isDeleted = Boolean.FALSE;
    private Long deletedAt;
}
