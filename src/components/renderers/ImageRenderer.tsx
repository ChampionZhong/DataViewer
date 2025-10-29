import { useState } from 'react'
import { ImageIcon, ZoomIn, ExternalLink } from 'lucide-react'
import './ImageRenderer.css'

interface ImageRendererProps {
  src: string
  alt?: string
}

export default function ImageRenderer({ src, alt = '图片' }: ImageRendererProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleImageClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(src, '_blank')
  }

  return (
    <>
      <div className="image-renderer">
        <div className="image-header">
          <div className="image-title">
            <ImageIcon size={16} />
            <span>图片</span>
          </div>
          <button 
            className="image-action-btn" 
            onClick={handleOpenInNewTab}
            title="在新标签页打开"
          >
            <ExternalLink size={14} />
          </button>
        </div>
        <div className="image-container">
          {!loaded && !error && (
            <div className="image-loading">加载中...</div>
          )}
          {error && (
            <div className="image-error">
              <ImageIcon size={24} />
              <span>图片加载失败</span>
              <a href={src} target="_blank" rel="noopener noreferrer" className="image-link">
                查看原图
              </a>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`image-content ${loaded ? 'loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            onClick={handleImageClick}
            title="点击放大"
          />
          {loaded && !error && (
            <div className="image-zoom-hint">
              <ZoomIn size={16} />
              点击放大
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="image-modal" onClick={handleImageClick}>
          <div className="image-modal-content">
            <img src={src} alt={alt} />
          </div>
          <div className="image-modal-close">点击任意处关闭</div>
        </div>
      )}
    </>
  )
}

