package com.chatapp.controller;

import com.chatapp.dto.TestResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping
    public ResponseEntity<TestResponse> test() {
        TestResponse response = new TestResponse(
            "success",
            "Backend is running successfully!",
            LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Healthy");
    }
}
