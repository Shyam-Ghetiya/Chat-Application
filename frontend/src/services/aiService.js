import { post, get } from './api'

/**
 * Translate text from one language to another
 */
export async function translateText(text, sourceLanguage, targetLanguage) {
  return post('/ai/translate', {
    text,
    sourceLanguage,
    targetLanguage,
  })
}

/**
 * Summarize a conversation
 */
export async function summarizeConversation(request) {
  return post('/ai/summarize', request)
}

/**
 * Check AI service health
 */
export async function checkAiHealth() {
  return get('/ai/health')
}

/**
 * Supported languages for translation
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'English', name: 'English', flag: '🇬🇧' },
  { code: 'Hindi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { code: 'Gujarati', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
  { code: 'Tamil', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'Telugu', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
  { code: 'Malayalam', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
  { code: 'Marathi', name: 'Marathi (मराठी)', flag: '🇮🇳' },
  { code: 'Punjabi', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
  { code: 'Spanish', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'French', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'German', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'Japanese', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'Chinese', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'Arabic', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'Russian', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'Portuguese', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'Italian', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'Korean', name: 'Korean (한국어)', flag: '🇰🇷' },
]

/**
 * Summary types
 */
export const SUMMARY_TYPES = [
  { value: 'ENTIRE', label: 'Entire Conversation' },
  { value: 'LAST_20', label: 'Last 20 Messages' },
  { value: 'LAST_50', label: 'Last 50 Messages' },
  { value: 'LAST_100', label: 'Last 100 Messages' },
  { value: 'SELECTED', label: 'Selected Messages' },
  { value: 'DATE_RANGE', label: 'Date Range' },
]

/**
 * Summary lengths
 */
export const SUMMARY_LENGTHS = [
  { value: 'SHORT', label: 'Short' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'DETAILED', label: 'Detailed' },
]

/**
 * Summary styles
 */
export const SUMMARY_STYLES = [
  { value: 'BULLET_POINTS', label: 'Bullet Points' },
  { value: 'PARAGRAPH', label: 'Paragraph' },
  { value: 'ACTION_ITEMS', label: 'Action Items' },
  { value: 'MEETING_NOTES', label: 'Meeting Notes' },
  { value: 'KEY_HIGHLIGHTS', label: 'Key Highlights' },
]
