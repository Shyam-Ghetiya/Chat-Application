package com.chatapp.ai.service;

import com.chatapp.ai.provider.LLMProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TranslationService {
    
    @Autowired
    private LLMProvider llmProvider;
    
    /**
     * Translate text from source language to target language
     */
    public String translate(String text, String sourceLanguage, String targetLanguage) {
        String systemPrompt = buildTranslationSystemPrompt();
        String userPrompt = buildTranslationUserPrompt(text, sourceLanguage, targetLanguage);
        
        return llmProvider.generateCompletion(systemPrompt, userPrompt);
    }
    
    private String buildTranslationSystemPrompt() {
        return """
            You are a professional translator with expertise in multiple languages.
            Your task is to translate text accurately while preserving meaning, tone, and formatting.
            
            RULES:
            1. Preserve the exact meaning and tone of the original text
            2. Keep emojis exactly as they are (🙂, ❤️, etc.)
            3. Keep URLs exactly as they are (https://example.com)
            4. Keep email addresses exactly as they are (user@example.com)
            5. Keep phone numbers exactly as they are (+1-234-567-8900)
            6. Preserve formatting (line breaks, spaces, punctuation)
            7. Preserve proper nouns (names, places, brands)
            8. Do not add any explanations or additional text
            9. Do not translate code snippets or technical terms that shouldn't be translated
            10. Return ONLY the translated text, nothing else
            
            If the text cannot be translated, return it as is.
            """;
    }
    
    private String buildTranslationUserPrompt(String text, String sourceLanguage, String targetLanguage) {
        return String.format("""
            Translate the following text from %s to %s:
            
            %s
            """, sourceLanguage, targetLanguage, text);
    }
}
