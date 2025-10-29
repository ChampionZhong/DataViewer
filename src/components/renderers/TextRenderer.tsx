import { FileText } from 'lucide-react'
import './TextRenderer.css'

interface TextRendererProps {
  content: string
  label?: string
  variant?: 'default' | 'reasoning'
}

export default function TextRenderer({ 
  content, 
  label,
  variant = 'default' 
}: TextRendererProps) {
  const isReasoning = variant === 'reasoning'
  
  return (
    <div className={`text-renderer ${isReasoning ? 'reasoning' : ''}`}>
      <div className="text-header">
        <FileText size={16} />
        <span>{label || (isReasoning ? '推理过程' : '文本内容')}</span>
      </div>
      <div className="text-content">
        {content}
      </div>
    </div>
  )
}

