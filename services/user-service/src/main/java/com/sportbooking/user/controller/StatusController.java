package com.sportbooking.user.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Connectivity endpoint for milestone 1; business APIs follow in milestone 2. */
@RestController
@RequestMapping("/api/users")
public class StatusController {
    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of("service", "user-service", "status", "UP", "milestone", "1");
    }
}
