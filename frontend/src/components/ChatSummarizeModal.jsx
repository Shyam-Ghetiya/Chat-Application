import { useState } from 'react'
import { Modal, Button } from './ui'
import * as aiService from '../services/aiService'
import { FiDownload, FiCopy, FiRefreshCw, FiLoader, FiCheckCircle } from 'react-icons/fi'

function ChatSummarizeModal({ isOpen, onClose, conversationId }) {
  const [summaryType, setSummaryType] = useState('LAST_50')
  const [length, setLength] = useState('MEDIUM')
  const [style, setStyle] = useState('BULLET_POINTS')
  const [language, setLanguage] = useState('English')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Date range state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSummary('')

    try {
      const request = {
        conversationId,
        summaryType,
        length,
        style,
        language,
      }
      
      // Add date range if applicable
      if (summaryType === 'DATE_RANGE') {
        if (!startDate || !endDate) {
          setError('Please select both start and end dates')
          setLoading(false)
          return
        }
        request.startDate = new Date(startDate).toISOString()
        request.endDate = new Date(endDate).toISOString()
      }

      const response = await aiService.summarizeConversation(request)
      setSummary(response.summary)
    } catch (err) {
      setError(err.message || 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-summary-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Summarize Chat" size="lg">
      <div className="space-y-6">
        {/* Summary Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary Type
          </label>
          <select
            value={summaryType}
            onChange={(e) => setSummaryType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            {aiService.SUMMARY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range (conditional) */}
        {summaryType === 'DATE_RANGE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Summary Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary Length
          </label>
          <div className="flex gap-2">
            {aiService.SUMMARY_LENGTHS.map((len) => (
              <button
                key={len.value}
                onClick={() => setLength(len.value)}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                  length === len.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {len.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary Style
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            {aiService.SUMMARY_STYLES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            {aiService.SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        {!summary && (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Generating Summary...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Display */}
        {summary && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 dark:text-gray-100">
                {summary}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <FiCheckCircle className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleDownload}
              >
                <FiDownload className="mr-2" />
                Download
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleRegenerate}
                disabled={loading}
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  <FiRefreshCw className="mr-2" />
                )}
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ChatSummarizeModal
