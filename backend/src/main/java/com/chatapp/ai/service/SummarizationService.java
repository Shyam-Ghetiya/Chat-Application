package com.chatapp.ai.service;

import com.chatapp.ai.dto.SummarizeRequest;
import com.chatapp.ai.provider.LLMProvider;
import com.chatapp.entity.Conversation;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import com.chatapp.repository.ConversationMemberRepository;
import com.chatapp.repository.ConversationRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SummarizationService {
    
    @Autowired
    private LLMProvider llmProvider;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private ConversationMemberRepository conversationMemberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Summarize conversation based on request parameters
     */
    public String summarizeConversation(String userEmail, SummarizeRequest request) {
        // Verify user is member of conversation
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Conversation conversation = conversationRepository.findById(request.getConversationId())
            .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        if (!conversationMemberRepository.existsByConversationAndUser(conversation, user)) {
            throw new RuntimeException("Not authorized to access this conversation");
        }
        
        // Fetch messages based on summary type
        List<Message> messages = fetchMessagesForSummary(request);
        
        if (messages.isEmpty()) {
            return "No messages to summarize.";
        }
        
        // Build conversation text
        String conversationText = buildConversationText(messages);
        
        // Generate summary
        String systemPrompt = buildSummarizationSystemPrompt(request);
        String userPrompt = buildSummarizationUserPrompt(conversationText, request);
        
        return llmProvider.generateCompletion(systemPrompt, userPrompt);
    }
    
    private List<Message> fetchMessagesForSummary(SummarizeRequest request) {
        List<Message> messages = new ArrayList<>();
        Long conversationId = request.getConversationId();
        
        switch (request.getSummaryType().toUpperCase()) {
            case "ENTIRE":
                messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
                break;
                
            case "LAST_20":
                messages = messageRepository.findTop20ByConversationIdOrderByCreatedAtDesc(conversationId);
                reverseList(messages);
                break;
                
            case "LAST_50":
                messages = messageRepository.findTop50ByConversationIdOrderByCreatedAtDesc(conversationId);
                reverseList(messages);
                break;
                
            case "LAST_100":
                messages = messageRepository.findTop100ByConversationIdOrderByCreatedAtDesc(conversationId);
                reverseList(messages);
                break;
                
            case "SELECTED":
                if (request.getSelectedMessageIds() != null && !request.getSelectedMessageIds().isEmpty()) {
                    messages = messageRepository.findByIdInOrderByCreatedAtAsc(request.getSelectedMessageIds());
                }
                break;
                
            case "DATE_RANGE":
                if (request.getStartDate() != null && request.getEndDate() != null) {
                    messages = messageRepository.findByConversationIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                        conversationId, request.getStartDate(), request.getEndDate());
                }
                break;
                
            default:
                throw new RuntimeException("Invalid summary type: " + request.getSummaryType());
        }
        
        // Filter out deleted messages
        return messages.stream()
            .filter(msg -> msg.getDeletedAt() == null)
            .collect(Collectors.toList());
    }
    
    private void reverseList(List<Message> messages) {
        int left = 0, right = messages.size() - 1;
        while (left < right) {
            Message temp = messages.get(left);
            messages.set(left, messages.get(right));
            messages.set(right, temp);
            left++;
            right--;
        }
    }
    
    private String buildConversationText(List<Message> messages) {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        for (Message message : messages) {
            String senderName = message.getSender().getName();
            String timestamp = message.getCreatedAt().format(formatter);
            String content = message.getContent();
            
            sb.append(String.format("[%s] %s: %s\n", timestamp, senderName, content));
        }
        
        return sb.toString();
    }
    
    private String buildSummarizationSystemPrompt(SummarizeRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an intelligent assistant specialized in summarizing conversations.\n\n");
        
        // Add style-specific instructions
        switch (request.getStyle().toUpperCase()) {
            case "BULLET_POINTS":
                prompt.append("Format your summary as clear, concise bullet points.\n");
                prompt.append("Each bullet should capture a key point from the conversation.\n");
                break;
                
            case "PARAGRAPH":
                prompt.append("Format your summary as flowing paragraphs.\n");
                prompt.append("Write in a narrative style that captures the essence of the conversation.\n");
                break;
                
            case "ACTION_ITEMS":
                prompt.append("Focus on extracting action items and tasks mentioned in the conversation.\n");
                prompt.append("Format as a list of actionable items with responsible parties if mentioned.\n");
                break;
                
            case "MEETING_NOTES":
                prompt.append("Format your summary as meeting notes.\n");
                prompt.append("Include: Topics Discussed, Decisions Made, Action Items, and Next Steps.\n");
                break;
                
            case "KEY_HIGHLIGHTS":
                prompt.append("Extract and present the most important highlights from the conversation.\n");
                prompt.append("Focus on critical information, decisions, and conclusions.\n");
                break;
        }
        
        // Add length-specific instructions
        prompt.append("\n");
        switch (request.getLength().toUpperCase()) {
            case "SHORT":
                prompt.append("Keep the summary brief and concise (2-3 sentences or 3-5 bullet points).\n");
                break;
            case "MEDIUM":
                prompt.append("Provide a moderate-length summary (4-6 sentences or 6-10 bullet points).\n");
                break;
            case "DETAILED":
                prompt.append("Provide a comprehensive, detailed summary (multiple paragraphs or 10+ bullet points).\n");
                break;
        }
        
        // Add general rules
        prompt.append("""
            
            GENERAL RULES:
            1. Preserve important context and key information
            2. Keep participant names when relevant
            3. Mention important decisions, deadlines, and commitments
            4. Identify and include action items if present
            5. Ignore simple greetings and pleasantries unless contextually important
            6. Ignore duplicate or repetitive messages
            7. Focus on the substance and meaningful content
            8. Maintain chronological flow if relevant
            9. Be objective and neutral in tone
            """);
        
        // Add language instruction
        if (!request.getLanguage().equalsIgnoreCase("English")) {
            prompt.append(String.format("\n10. Provide the summary in %s language.\n", request.getLanguage()));
        } else {
            prompt.append("\n10. Provide the summary in English.\n");
        }
        
        prompt.append("\nReturn ONLY the summary. Do not include any meta-commentary or explanations about the summary itself.");
        
        return prompt.toString();
    }
    
    private String buildSummarizationUserPrompt(String conversationText, SummarizeRequest request) {
        return String.format("""
            Summarize the following conversation:
            
            %s
            
            Summary Type: %s
            Length: %s
            Style: %s
            Language: %s
            """, 
            conversationText, 
            request.getSummaryType(), 
            request.getLength(), 
            request.getStyle(),
            request.getLanguage());
    }
}
