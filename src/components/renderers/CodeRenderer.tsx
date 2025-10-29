import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Code, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import './CodeRenderer.css'

interface CodeRendererProps {
  code: string
  language?: string
  title?: string
}

export default function CodeRenderer({ code, language = 'text', title }: CodeRendererProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-renderer">
      <div className="code-header">
        <div className="code-title">
          <Code size={16} />
          <span>{title || language}</span>
        </div>
        <button className="copy-button" onClick={handleCopy} title="复制代码">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div className="code-content">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: '0 0 8px 8px',
            fontSize: '0.875rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

