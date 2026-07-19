import { getFileUrl, getDownloadUrl, formatFileSize } from '../services/fileService'
import './FilePreview.css'

function FilePreview({ message }) {
  const { fileUrl, fileName, fileSize, fileType, messageType } = message
  
  if (!fileUrl) return null
  
  const fullUrl = getFileUrl(fileUrl)
  const downloadUrl = getDownloadUrl(fileUrl)
  
  const renderPreview = () => {
    switch (messageType) {
      case 'IMAGE':
        return (
          <div className="file-preview image-preview">
            <img src={fullUrl} alt={fileName} onClick={() => window.open(fullUrl, '_blank')} />
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <span className="file-size">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        )
      
      case 'VIDEO':
        return (
          <div className="file-preview video-preview">
            <video controls>
              <source src={fullUrl} type={fileType} />
              Your browser does not support the video tag.
            </video>
            <div className="file-info">
              <span className="file-name">{fileName}</span>
              <span className="file-size">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        )
      
      case 'AUDIO':
        return (
          <div className="file-preview audio-preview">
            <div className="audio-icon">🎵</div>
            <div className="file-details">
              <span className="file-name">{fileName}</span>
              <audio controls>
                <source src={fullUrl} type={fileType} />
                Your browser does not support the audio tag.
              </audio>
              <span className="file-size">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        )
      
      case 'DOCUMENT':
        return (
          <div className="file-preview document-preview">
            <div className="document-icon">📄</div>
            <div className="file-details">
              <span className="file-name">{fileName}</span>
              <span className="file-size">{formatFileSize(fileSize)}</span>
              <div className="file-actions">
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="btn-view">
                  View
                </a>
                <a href={downloadUrl} download className="btn-download">
                  Download
                </a>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="file-preview default-preview">
            <div className="file-icon">📎</div>
            <div className="file-details">
              <span className="file-name">{fileName}</span>
              <span className="file-size">{formatFileSize(fileSize)}</span>
              <a href={downloadUrl} download className="btn-download">
                Download
              </a>
            </div>
          </div>
        )
    }
  }
  
  return renderPreview()
}

export default FilePreview
