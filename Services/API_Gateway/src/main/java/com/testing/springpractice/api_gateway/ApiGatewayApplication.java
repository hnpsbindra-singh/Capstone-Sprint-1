package com.testing.springpractice.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@SpringBootApplication
public class ApiGatewayApplication {
    @Bean
    public CorsWebFilter corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        String authUri = System.getenv().getOrDefault("AUTH_SERVICE_URI", "https://capstone-sprint-1.vercel.app");
        String victimUri = System.getenv().getOrDefault("VICTIM_SERVICE_URI", "https://victim-service-latest.onrender.com");
        String ngoUri = System.getenv().getOrDefault("NGO_SERVICE_URI", "https://ngoservice.vercel.app");
        String donorUri = System.getenv().getOrDefault("DONOR_SERVICE_URI", "https://donorservice.vercel.app");
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f.dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_UNIQUE")
                                       .dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_UNIQUE"))
                        .uri(authUri))
                .route("ngo-service", r -> r
                        .path("/api/ngo/**")
                        .filters(f -> f.dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_UNIQUE")
                                       .dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_UNIQUE"))
                        .uri(ngoUri))
                .route("donor-service", r -> r
                        .path("/api/donor/**")
                        .filters(f -> f.dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_UNIQUE")
                                       .dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_UNIQUE"))
                        .uri(donorUri))
                .route("admin-service", r -> r
                        .path("/api/admin/**")
                        .filters(f -> f.dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_UNIQUE")
                                       .dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_UNIQUE"))
                        .uri("http://localhost:5004"))
                .route("victim-service", r -> r
                        .path("/api/victim/**")
                        .filters(f -> f.dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_UNIQUE")
                                       .dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_UNIQUE"))
                        .uri(victimUri))
                .build();
    }

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

}
