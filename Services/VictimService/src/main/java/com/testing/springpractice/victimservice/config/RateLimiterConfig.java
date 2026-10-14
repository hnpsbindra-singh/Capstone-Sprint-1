package com.testing.springpractice.victimservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RateLimiterConfig {

    private final StringRedisTemplate stringRedisTemplate;
    private final Integer max = 5;
    private final Duration duration = Duration.ofHours(1);

    public RateLimiterConfig(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public boolean rateLimiter(String email){
        try {
            String key = "ratelimit:victim:create:" + email.trim().toLowerCase();
            Long count = stringRedisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                stringRedisTemplate.expire(key, duration);
            }
            return count != null && count <= max;
        } catch (Exception e) {
            return true;
        }
    }
}
