package com.chatapp.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Component
public class GroqProvider implements LLMProvider {
    
    @Value("${groq.api.key}")
    private String apiKey;
    
    @Value("${groq.api.url}")
    private String apiUrl;
    
    @Value("${groq.api.model}")
    private String model;
    
    @Value("${groq.api.timeout:30000}")
    private int timeout;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public GroqProvider() {
        this.webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public String generateCompletion(String systemPrompt, String userPrompt) {
        if (!isAvailable()) {
            throw new RuntimeException("Groq API is not configured. Please set GROQ_API_KEY.");
        }
        
        try {
            // Build request payload
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2048);
            
            // Create messages array
            ArrayNode messages = objectMapper.createArrayNode();
            
            // Add system message
            ObjectNode systemMessage = objectMapper.createObjectNode();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);
            messages.add(systemMessage);
            
            // Add user message
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", userPrompt);
            messages.add(userMessage);
            
            requestBody.set("messages", messages);
            
            // Make API call
            String response = webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(timeout))
                .block();
            
            // Parse response
            JsonNode responseJson = objectMapper.readTree(response);
            JsonNode choices = responseJson.get("choices");
            
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode firstChoice = choices.get(0);
                JsonNode message = firstChoice.get("message");
                if (message != null) {
                    JsonNode content = message.get("content");
                    if (content != null) {
                        return content.asText();
                    }
                }
            }
            
            throw new RuntimeException("Invalid response format from Groq API");
            
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Groq API error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate completion: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("your-groq-api-key-here");
    }
}
