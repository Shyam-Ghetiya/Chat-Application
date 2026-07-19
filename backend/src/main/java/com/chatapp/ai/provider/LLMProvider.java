package com.chatapp.ai.provider;

/**
 * Interface for LLM providers
 * Allows switching between different LLM providers (Groq, OpenAI, Gemini, etc.)
 */
public interface LLMProvider {
    
    /**
     * Generate completion from the LLM
     * 
     * @param systemPrompt The system prompt to set context
     * @param userPrompt The user's input prompt
     * @return The generated text response
     */
    String generateCompletion(String systemPrompt, String userPrompt);
    
    /**
     * Check if the provider is configured and ready
     * 
     * @return true if provider is ready, false otherwise
     */
    boolean isAvailable();
}
