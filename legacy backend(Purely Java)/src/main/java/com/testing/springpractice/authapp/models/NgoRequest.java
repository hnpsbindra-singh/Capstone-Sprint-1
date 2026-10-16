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
@Document(collection = "ResourceRequest")
public class NgoRequest {
    @Id
    private String id;

    private String ngoId;
    private String title;
    private String description;
    private String resourceNeeded;
    private Long quantityNeeded;
    private Long quantityReceived;
    private RequestStatus status;
    @GeoSpatialIndexed
    private GeoJsonPoint location;


}
