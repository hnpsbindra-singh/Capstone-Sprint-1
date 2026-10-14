package com.testing.springpractice.victimservice.config;

import com.testing.springpractice.victimservice.DTO.JwtPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;


public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterConfig rateLimiterConfig;

    public RateLimitingFilter(RateLimiterConfig rateLimiterConfig) {
        this.rateLimiterConfig = rateLimiterConfig;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        if (!path.equals("/api/victim/create")){
            filterChain.doFilter(request, response);
            return;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication==null){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User Invalid");
        }
        JwtPrincipal jwtPrincipal = (JwtPrincipal) authentication.getPrincipal();
        String email = jwtPrincipal.getName();
        if (!rateLimiterConfig.rateLimiter(email)){
            response.setStatus(429);
            response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            return;
        }
        filterChain.doFilter(request, response);
    }

}
