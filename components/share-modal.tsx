'use client'

import { useState } from 'react'

interface ShareModalProps {
  show: boolean
  onClose: () => void
  categoryName: string
  shareUrl: string
}

export function ShareModal({
  show,
  onClose,
  categoryName,
  shareUrl,
}: ShareModalProps) {
  const [copyStatus, setCopyStatus] = useState('')

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus(''), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus(''), 2000)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out my ${categoryName} bookmarks`)
    const body = encodeURIComponent(
      `Hi!\n\nI wanted to share my ${categoryName} bookmarks with you. You can view them at:\n\n${shareUrl}\n\nBest regards!`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const openSharedCategory = () => {
    window.open(shareUrl, '_blank')
  }

  if (!show) return null

  return (
    <div
      className={`modal-overlay ${show ? 'show' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fa-solid fa-share me-2"></i>
            Share Category
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p className="mb-3">
            <strong>{categoryName}</strong> - Share this link with others to let
            them view your bookmarks in read-only mode.
          </p>

          <div className="emoji-share-container">
            <div className="emoji-link-display">
              <div
                className="emoji-wrapper"
                onClick={openSharedCategory}
                title="Click to open shared category"
              >
                <span className="share-emoji">📚</span>
                <div className="emoji-glow"></div>
              </div>
              <div className="share-info">
                <p className="share-title">Shareable Link</p>
                <p className="share-description">
                  Click the book to preview or copy the link below
                </p>
              </div>
            </div>

            <div className="share-buttons">
              <button
                className={`copy-btn primary ${
                  copyStatus === 'copied' ? 'copied' : ''
                }`}
                onClick={() => copyToClipboard(shareUrl)}
                title="Copy the complete shareable URL"
              >
                <i
                  className={`fa-solid ${
                    copyStatus === 'copied' ? 'fa-check' : 'fa-copy'
                  } me-1`}
                ></i>
                {copyStatus === 'copied' ? 'Copied!' : 'Copy Link'}
              </button>
              <button className="copy-btn secondary" onClick={shareViaEmail}>
                <i className="fa-solid fa-envelope me-1"></i>
                Email
              </button>
            </div>
          </div>

          <div className="mt-3">
            <small className="text-muted">
              <i className="fa-solid fa-info-circle me-1"></i>
              Click the 📚 emoji to preview the shared category or use the copy
              button to share the link.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
