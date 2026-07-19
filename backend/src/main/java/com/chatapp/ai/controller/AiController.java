package com.chatapp.ai.controller;

import com.chatapp.ai.dto.SummarizeRequest;
import com.chatapp.ai.dto.SummarizeResponse;
import com.chatapp.ai.dto.TranslateRequest;
import com.chatapp.ai.dto.TranslateResponse;
import com.chatapp.ai.service.SummarizationService;
import com.chatapp.ai.service.TranslationService;
import com.chatapp.dto.ErrorResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    @Autowired
    private TranslationService translationService;
    
    @Autowired
    private SummarizationService summarizationService;
    
    /**
     * Translate text from one language to another
     */
    @PostMapping("/translate")
    public ResponseEntity<?> translateText(@Valid @RequestBody TranslateRequest request) {
        try {
            String translatedText = translationService.translate(
                request.getText(),
                request.getSourceLanguage(),
                request.getTargetLanguage()
            );
            
            TranslateResponse response = new TranslateResponse(
                translatedText,
                request.getSourceLanguage(),
                request.getTargetLanguage()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Translation failed: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Summarize a conversation
     */
    @PostMapping("/summarize")
    public ResponseEntity<?> summarizeConversation(
        @Valid @RequestBody SummarizeRequest request,
        Authentication authentication
    ) {
        try {
            String userEmail = authentication.getName();
            String summary = summarizationService.summarizeConversation(userEmail, request);
            
            // Get message count (simplified - could be more precise)
            int messageCount = getMessageCount(request);
            
            SummarizeResponse response = new SummarizeResponse(
                summary,
                messageCount,
                request.getSummaryType(),
                request.getLength(),
                request.getStyle(),
                request.getLanguage()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Summarization failed: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Health check endpoint for AI features
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok().body(new HealthResponse("AI features are operational"));
    }
    
    private int getMessageCount(SummarizeRequest request) {
        switch (request.getSummaryType().toUpperCase()) {
            case "LAST_20": return 20;
            case "LAST_50": return 50;
            case "LAST_100": return 100;
            case "SELECTED": 
                return request.getSelectedMessageIds() != null 
                    ? request.getSelectedMessageIds().size() 
                    : 0;
            default: return 0;
        }
    }
    
    // Inner class for health response
    private static class HealthResponse {
        public String status;
        
        public HealthResponse(String status) {
            this.status = status;
        }
        
        public String getStatus() {
            return status;
        }
    }
}
