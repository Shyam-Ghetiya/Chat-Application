package com.chatapp.service;

import com.chatapp.dto.ProfileResponse;
import com.chatapp.dto.UpdateAboutRequest;
import com.chatapp.dto.UpdateProfilePictureRequest;
import com.chatapp.dto.UpdateProfileRequest;
import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ProfileService {
    
    @Autowired
    private UserRepository userRepository;
    
    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToProfileResponse(user);
    }
    
    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        
        if (request.getAbout() != null) {
            user.setAbout(request.getAbout());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return mapToProfileResponse(updatedUser);
    }
    
    @Transactional
    public ProfileResponse updateProfilePicture(String email, UpdateProfilePictureRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfilePicture(request.getProfilePicture());
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return mapToProfileResponse(updatedUser);
    }
    
    @Transactional
    public ProfileResponse updateAbout(String email, UpdateAboutRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setAbout(request.getAbout());
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return mapToProfileResponse(updatedUser);
    }
    
    @Transactional
    public ProfileResponse removeProfilePicture(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfilePicture(null);
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        
        return mapToProfileResponse(updatedUser);
    }
    
    @Transactional
    public void updateOnlineStatus(String email, boolean isOnline) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setIsOnline(isOnline);
        if (!isOnline) {
            user.setLastSeen(LocalDateTime.now());
        }
        userRepository.save(user);
    }
    
    private ProfileResponse mapToProfileResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getAbout(),
                user.getLastSeen(),
                user.getIsOnline(),
                user.getCreatedAt()
        );
    }
}
