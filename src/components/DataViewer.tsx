import { useState, useMemo } from 'react'
import { FileCode, Search, List, Eye, Columns, PanelRightClose, PanelRightOpen } from 'lucide-react'
import ReactJson from 'react-json-view'
import ColumnView from './ColumnView'
import DetailPanel from './DetailPanel'
import CodeRenderer from './renderers/CodeRenderer'
import MathRenderer from './renderers/MathRenderer'
import ImageRenderer from './renderers/ImageRenderer'
import TextRenderer from './renderers/TextRenderer'
import ToolCallRenderer from './renderers/ToolCallRenderer'
import { detectDataType, isCodeContent, analyzeDataStructure } from '../utils/dataTypeDetector'
import type { DataType } from '../utils/dataTypeDetector'
import './DataViewer.css'

interface DataViewerProps {
  data: any
}

type ViewMode = 'column' | 'smart' | 'json' | 'raw'

export default function DataViewer({ data }: DataViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('column')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [selectedValue, setSelectedValue] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(true)

  // 分析数据结构
  const analyzedFields = useMemo(() => analyzeDataStructure(data), [data])

  // 搜索过滤
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    const search = (obj: any, term: string): any => {
      if (obj === null || obj === undefined) return null

      const lowerTerm = term.toLowerCase()

      if (typeof obj === 'string') {
        return obj.toLowerCase().includes(lowerTerm) ? obj : null
      }

      if (typeof obj === 'number' || typeof obj === 'boolean') {
        return obj.toString().toLowerCase().includes(lowerTerm) ? obj : null
      }

      if (Array.isArray(obj)) {
        const filtered = obj.map(item => search(item, term)).filter(item => item !== null)
        return filtered.length > 0 ? filtered : null
      }

      if (typeof obj === 'object') {
        const filtered: any = {}
        let hasMatch = false

        for (const [key, value] of Object.entries(obj)) {
          if (key.toLowerCase().includes(lowerTerm)) {
            filtered[key] = value
            hasMatch = true
          } else {
            const searchedValue = search(value, term)
            if (searchedValue !== null) {
              filtered[key] = searchedValue
              hasMatch = true
            }
          }
        }

        return hasMatch ? filtered : null
      }

      return null
    }

    return search(data, searchTerm) || data
  }, [data, searchTerm])

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  // 渲染特定类型的数据
  const renderTypedContent = (key: string, value: any, type: DataType) => {
    switch (type) {
      case 'code': {
        const codeInfo = isCodeContent(value)
        if (codeInfo.isCode) {
          return (
            <CodeRenderer
              code={codeInfo.content || ''}
              language={codeInfo.language}
              title={key}
            />
          )
        }
        return null
      }

      case 'math':
        return <MathRenderer content={value} />

      case 'image':
        return <ImageRenderer src={value} alt={key} />

      case 'reasoning':
        return <TextRenderer content={value} label={key} variant="reasoning" />

      case 'text':
        if (typeof value === 'string' && value.length > 50) {
          return <TextRenderer content={value} label={key} />
        }
        return null

      case 'tool_call':
        return <ToolCallRenderer data={value} />

      default:
        return null
    }
  }

  // 渲染智能视图
  const renderSmartView = (obj: any, path: string = '') => {
    if (obj === null || obj === undefined) {
      return <div className="null-value">null</div>
    }

    if (typeof obj !== 'object') {
      return <div className="primitive-value">{JSON.stringify(obj)}</div>
    }

    if (Array.isArray(obj)) {
      return (
        <div className="array-container">
          {obj.map((item, index) => {
            const itemPath = `${path}[${index}]`
            const itemType = detectDataType(itemPath, item)
            const rendered = renderTypedContent(itemPath, item, itemType)

            if (rendered) {
              return <div key={index} className="array-item">{rendered}</div>
            }

            return (
              <div key={index} className="array-item-wrapper">
                <div className="array-item-header">
                  <span className="item-index">[{index}]</span>
                </div>
                {renderSmartView(item, itemPath)}
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div className="object-container">
        {Object.entries(obj).map(([key, value]) => {
          const fieldPath = path ? `${path}.${key}` : key
          const fieldType = detectDataType(key, value)
          const isExpanded = expandedSections.has(fieldPath)

          // 尝试特殊渲染
          const specialRender = renderTypedContent(key, value, fieldType)
          if (specialRender) {
            return (
              <div key={key} className="field-item special">
                <div className="field-key">{key}</div>
                {specialRender}
              </div>
            )
          }

          // 基本类型直接显示
          if (typeof value !== 'object' || value === null) {
            return (
              <div key={key} className="field-item primitive">
                <span className="field-key">{key}:</span>
                <span className="field-value">{JSON.stringify(value)}</span>
              </div>
            )
          }

          // 对象和数组使用折叠面板
          return (
            <div key={key} className="field-item collapsible">
              <button
                className="field-header"
                onClick={() => toggleSection(fieldPath)}
              >
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
                <span className="field-key">{key}</span>
                <span className="field-type">
                  {Array.isArray(value) ? `Array(${value.length})` : 'Object'}
                </span>
              </button>
              {isExpanded && (
                <div className="field-content">
                  {renderSmartView(value, fieldPath)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="data-viewer">
      <div className="viewer-header">
        <h2>数据详情</h2>
        
        <div className="viewer-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="搜索字段或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="view-mode-tabs">
            <button
              className={`tab-btn ${viewMode === 'column' ? 'active' : ''}`}
              onClick={() => setViewMode('column')}
              title="列视图（推荐）"
            >
              <Columns size={16} />
              列视图
            </button>
            {viewMode === 'column' && (
              <button
                className="tab-btn detail-toggle"
                onClick={() => setShowDetail(!showDetail)}
                title={showDetail ? '隐藏详情面板' : '显示详情面板'}
              >
                {showDetail ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
            )}
            <button
              className={`tab-btn ${viewMode === 'smart' ? 'active' : ''}`}
              onClick={() => setViewMode('smart')}
              title="智能渲染"
            >
              <Eye size={16} />
              智能视图
            </button>
            <button
              className={`tab-btn ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
              title="JSON树形视图"
            >
              <List size={16} />
              JSON树
            </button>
            <button
              className={`tab-btn ${viewMode === 'raw' ? 'active' : ''}`}
              onClick={() => setViewMode('raw')}
              title="原始JSON"
            >
              <FileCode size={16} />
              原始数据
            </button>
          </div>
        </div>
      </div>

      <div className={`viewer-content ${viewMode === 'column' ? 'with-detail-panel' : ''}`}>
        {viewMode === 'column' && (
          <div className="column-view-wrapper">
            <div className="column-view-main">
              <ColumnView 
                data={filteredData}
                onSelect={(path, value) => {
                  setSelectedPath(path)
                  setSelectedValue(value)
                }}
              />
            </div>
            {showDetail && selectedPath && (
              <div className="detail-panel-wrapper">
                <DetailPanel path={selectedPath} value={selectedValue} />
              </div>
            )}
          </div>
        )}

        {viewMode === 'smart' && (
          <div className="smart-view">
            {renderSmartView(filteredData)}
          </div>
        )}

        {viewMode === 'json' && (
          <div className="json-view">
            <ReactJson
              src={filteredData}
              name={false}
              displayDataTypes={true}
              displayObjectSize={true}
              enableClipboard={true}
              collapsed={1}
              theme="rjv-default"
              iconStyle="triangle"
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--background)',
                fontSize: '0.9375rem',
                lineHeight: '1.6'
              }}
            />
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="raw-view">
            <pre>{JSON.stringify(filteredData, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="viewer-stats">
        <span>检测到 {analyzedFields.length} 个字段</span>
        <span>•</span>
        <span>
          {analyzedFields.filter(f => f.type === 'code').length} 个代码块
        </span>
        <span>•</span>
        <span>
          {analyzedFields.filter(f => f.type === 'math').length} 个数学公式
        </span>
        <span>•</span>
        <span>
          {analyzedFields.filter(f => f.type === 'image').length} 张图片
        </span>
      </div>
    </div>
  )
}

