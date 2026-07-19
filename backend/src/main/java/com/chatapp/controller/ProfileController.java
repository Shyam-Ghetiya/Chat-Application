package com.chatapp.controller;

import com.chatapp.dto.*;
import com.chatapp.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            ProfileResponse response = profileService.getProfile(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request, 
                                          Authentication authentication) {
        try {
            String email = authentication.getName();
            ProfileResponse response = profileService.updateProfile(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/picture")
    public ResponseEntity<?> updateProfilePicture(@RequestBody UpdateProfilePictureRequest request,
                                                  Authentication authentication) {
        try {
            String email = authentication.getName();
            ProfileResponse response = profileService.updateProfilePicture(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/picture")
    public ResponseEntity<?> removeProfilePicture(Authentication authentication) {
        try {
            String email = authentication.getName();
            ProfileResponse response = profileService.removeProfilePicture(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/about")
    public ResponseEntity<?> updateAbout(@Valid @RequestBody UpdateAboutRequest request,
                                        Authentication authentication) {
        try {
            String email = authentication.getName();
            ProfileResponse response = profileService.updateAbout(email, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
