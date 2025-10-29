import { Info, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import CodeRenderer from './renderers/CodeRenderer'
import MathRenderer from './renderers/MathRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import TextRenderer from './renderers/TextRenderer'
import ToolCallRenderer from './renderers/ToolCallRenderer'
import { detectDataType, isCodeContent } from '../utils/dataTypeDetector'
import './DetailPanel.css'

interface DetailPanelProps {
  path: string
  value: any
}

export default function DetailPanel({ path, value }: DetailPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const textToCopy = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getValueType = (): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return typeof value
  }

  const getByteSize = (): number => {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    return new Blob([str]).size
  }

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / 1048576).toFixed(2) + ' MB'
  }

  const renderValue = () => {
    const fieldType = detectDataType(path, value)

    // 尝试特殊渲染
    switch (fieldType) {
      case 'code': {
        const codeInfo = isCodeContent(value)
        if (codeInfo.isCode) {
          return (
            <CodeRenderer
              code={codeInfo.content || ''}
              language={codeInfo.language}
              title="代码"
            />
          )
        }
        break
      }
      case 'math':
        return <MathRenderer content={value} />
      
      case 'image':
        return <ImageRenderer src={value} alt={path} />
      
      case 'reasoning':
        return <TextRenderer content={value} label="推理" variant="reasoning" />
      
      case 'text':
        if (typeof value === 'string' && value.length > 100) {
          return <TextRenderer content={value} label="文本" />
        }
        break
      
      case 'tool_call':
        return <ToolCallRenderer data={value} />
    }

    // 默认渲染
    if (typeof value === 'string') {
      return (
        <div className="detail-value-string">
          <div className="value-display">{value}</div>
        </div>
      )
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <div className="detail-value-primitive">
          <div className="value-display">{String(value)}</div>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="detail-value-complex">
          <div className="value-summary">
            数组包含 <strong>{value.length}</strong> 个元素
          </div>
          <pre className="value-json">{JSON.stringify(value, null, 2)}</pre>
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value)
      return (
        <div className="detail-value-complex">
          <div className="value-summary">
            对象包含 <strong>{keys.length}</strong> 个属性
          </div>
          <pre className="value-json">{JSON.stringify(value, null, 2)}</pre>
        </div>
      )
    }

    return (
      <div className="detail-value-null">
        <div className="value-display">{String(value)}</div>
      </div>
    )
  }

  const valueType = getValueType()
  const byteSize = getByteSize()

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title">
          <Info size={18} />
          <span>详细信息</span>
        </div>
        <button className="detail-copy-btn" onClick={handleCopy} title="复制值">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className="detail-content">
        {/* 路径信息 */}
        <div className="detail-section">
          <div className="section-label">路径</div>
          <div className="section-value path-value">{path || '(根)'}</div>
        </div>

        {/* 类型信息 */}
        <div className="detail-section">
          <div className="section-label">类型</div>
          <div className="section-value">
            <span className={`type-badge type-${valueType}`}>{valueType}</span>
          </div>
        </div>

        {/* 大小信息 */}
        <div className="detail-section">
          <div className="section-label">大小</div>
          <div className="section-value">{formatBytes(byteSize)}</div>
        </div>

        {/* 数组/对象长度 */}
        {Array.isArray(value) && (
          <div className="detail-section">
            <div className="section-label">长度</div>
            <div className="section-value">{value.length} 个元素</div>
          </div>
        )}

        {typeof value === 'object' && value !== null && !Array.isArray(value) && (
          <div className="detail-section">
            <div className="section-label">属性数</div>
            <div className="section-value">{Object.keys(value).length} 个属性</div>
          </div>
        )}

        {/* 字符串长度 */}
        {typeof value === 'string' && (
          <div className="detail-section">
            <div className="section-label">字符数</div>
            <div className="section-value">{value.length} 个字符</div>
          </div>
        )}

        {/* 值预览 */}
        <div className="detail-section detail-value-section">
          <div className="section-label">值预览</div>
          <div className="section-value-content">
            {renderValue()}
          </div>
        </div>
      </div>
    </div>
  )
}

