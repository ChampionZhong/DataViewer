import { Wrench, ArrowRight } from 'lucide-react'
import ReactJson from 'react-json-view'
import './ToolCallRenderer.css'

interface ToolCallRendererProps {
  data: any
}

export default function ToolCallRenderer({ data }: ToolCallRendererProps) {
  // 提取工具调用信息
  const getFunctionName = () => {
    return data.function || data.tool || data.name || '未知函数'
  }

  const getArguments = () => {
    return data.arguments || data.parameters || data.args || {}
  }

  const getResult = () => {
    return data.result || data.output || data.response
  }

  const functionName = getFunctionName()
  const args = getArguments()
  const result = getResult()

  return (
    <div className="tool-call-renderer">
      <div className="tool-call-header">
        <Wrench size={16} />
        <span>工具调用</span>
      </div>
      
      <div className="tool-call-content">
        <div className="tool-call-function">
          <span className="function-label">函数:</span>
          <code className="function-name">{functionName}</code>
        </div>

        {Object.keys(args).length > 0 && (
          <div className="tool-call-section">
            <div className="section-title">参数:</div>
            <div className="json-container">
              <ReactJson
                src={args}
                name={false}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={true}
                collapsed={false}
                theme="rjv-default"
                iconStyle="triangle"
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        )}

        {result !== undefined && (
          <>
            <div className="tool-call-arrow">
              <ArrowRight size={20} />
            </div>
            
            <div className="tool-call-section">
              <div className="section-title">返回结果:</div>
              <div className="json-container">
                {typeof result === 'object' ? (
                  <ReactJson
                    src={result}
                    name={false}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={true}
                    collapsed={false}
                    theme="rjv-default"
                    iconStyle="triangle"
                    style={{
                      padding: '1rem',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      fontSize: '0.875rem'
                    }}
                  />
                ) : (
                  <div className="result-primitive">
                    <code>{JSON.stringify(result)}</code>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

