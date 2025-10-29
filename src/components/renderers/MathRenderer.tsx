import { BlockMath, InlineMath } from 'react-katex'
import { PiIcon } from 'lucide-react'
import './MathRenderer.css'

interface MathRendererProps {
  content: string
}

export default function MathRenderer({ content }: MathRendererProps) {
  // 解析内容中的数学公式
  const renderMathContent = () => {
    const parts: JSX.Element[] = []
    let lastIndex = 0
    
    // 匹配块级公式 $$...$$
    const blockMathRegex = /\$\$([\s\S]+?)\$\$/g
    // 匹配行内公式 $...$
    const inlineMathRegex = /\$([^\$\n]+?)\$/g
    
    // 先处理块级公式
    let blockMatch
    const blockMatches: Array<{ start: number; end: number; content: string; isBlock: boolean }> = []
    
    while ((blockMatch = blockMathRegex.exec(content)) !== null) {
      blockMatches.push({
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length,
        content: blockMatch[1],
        isBlock: true
      })
    }
    
    // 再处理行内公式（排除块级公式范围）
    let inlineMatch
    const allMatches = [...blockMatches]
    
    while ((inlineMatch = inlineMathRegex.exec(content)) !== null) {
      const start = inlineMatch.index
      const end = start + inlineMatch[0].length
      
      // 检查是否在块级公式范围内
      const inBlockRange = blockMatches.some(block => start >= block.start && end <= block.end)
      if (!inBlockRange) {
        allMatches.push({
          start,
          end,
          content: inlineMatch[1],
          isBlock: false
        })
      }
    }
    
    // 按位置排序
    allMatches.sort((a, b) => a.start - b.start)
    
    // 构建渲染内容
    allMatches.forEach((match, index) => {
      // 添加公式前的文本
      if (match.start > lastIndex) {
        const text = content.substring(lastIndex, match.start)
        if (text) {
          parts.push(<span key={`text-${index}`}>{text}</span>)
        }
      }
      
      // 添加数学公式
      try {
        if (match.isBlock) {
          parts.push(
            <div key={`math-${index}`} className="block-math">
              <BlockMath math={match.content} />
            </div>
          )
        } else {
          parts.push(
            <span key={`math-${index}`} className="inline-math">
              <InlineMath math={match.content} />
            </span>
          )
        }
      } catch (err) {
        // 如果渲染失败，显示原始内容
        parts.push(
          <code key={`math-error-${index}`} className="math-error">
            {match.isBlock ? `$$${match.content}$$` : `$${match.content}$`}
          </code>
        )
      }
      
      lastIndex = match.end
    })
    
    // 添加剩余文本
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex)
      if (text) {
        parts.push(<span key="text-final">{text}</span>)
      }
    }
    
    return parts.length > 0 ? parts : <span>{content}</span>
  }

  return (
    <div className="math-renderer">
      <div className="math-header">
        <PiIcon size={16} />
        <span>数学公式</span>
      </div>
      <div className="math-content">
        {renderMathContent()}
      </div>
    </div>
  )
}

