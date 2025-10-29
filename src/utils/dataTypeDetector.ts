// 数据类型检测工具
export type DataType = 
  | 'code'
  | 'math'
  | 'image'
  | 'tool_call'
  | 'reasoning'
  | 'text'
  | 'json'
  | 'array'
  | 'object'
  | 'primitive'

export interface TypedField {
  key: string
  value: any
  type: DataType
  metadata?: Record<string, any>
}

// 代码语言检测关键词
const CODE_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'shell',
  'bash', 'html', 'css', 'json', 'xml', 'yaml', 'markdown'
]

// 检测是否为数学公式（LaTeX）
export function isMathContent(value: string): boolean {
  if (typeof value !== 'string') return false
  
  // 检测 LaTeX 数学符号
  const mathPatterns = [
    /\$\$.+\$\$/s,              // 块级公式 $$...$$
    /\$.+\$/,                   // 行内公式 $...$
    /\\frac\{/,                 // 分数
    /\\sqrt\{/,                 // 根号
    /\\sum_/,                   // 求和
    /\\int_/,                   // 积分
    /\\lim_/,                   // 极限
    /\\begin\{.*\}/,           // LaTeX 环境
    /[\\](alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|phi|omega)/, // 希腊字母
    /\^[{]?[0-9]+[}]?/,        // 上标
    /_{[{]?[0-9]+[}]?/         // 下标
  ]
  
  return mathPatterns.some(pattern => pattern.test(value))
}

// 检测是否为代码
export function isCodeContent(value: any): { isCode: boolean; language?: string; content?: string } {
  // 检测对象形式的代码 { language: "python", content: "..." }
  if (typeof value === 'object' && value !== null) {
    if ('language' in value && 'content' in value) {
      return {
        isCode: true,
        language: value.language,
        content: value.content
      }
    }
    if ('code' in value && typeof value.code === 'string') {
      return {
        isCode: true,
        content: value.code,
        language: value.language
      }
    }
  }
  
  // 检测字符串中的代码块标记
  if (typeof value === 'string') {
    // 检测三个反引号代码块
    const codeBlockMatch = value.match(/```(\w+)?\n([\s\S]+?)```/)
    if (codeBlockMatch) {
      return {
        isCode: true,
        language: codeBlockMatch[1] || 'text',
        content: codeBlockMatch[2]
      }
    }
    
    // 检测代码特征（多行且包含编程语法）
    const lines = value.split('\n')
    if (lines.length > 3) {
      const codeIndicators = [
        /^(import|from|export|const|let|var|function|class|def|public|private)\s/m,
        /[;{}()[\]]/,
        /^\s*(if|for|while|switch|try|catch)\s*\(/m,
        /=>|->|\|\|/,
        /(==|!=|<=|>=|&&|\|\|)/
      ]
      
      const indicatorCount = codeIndicators.filter(pattern => pattern.test(value)).length
      if (indicatorCount >= 2) {
        return { isCode: true, content: value }
      }
    }
  }
  
  return { isCode: false }
}

// 检测是否为图片URL或base64
export function isImageContent(value: any): boolean {
  if (typeof value !== 'string') return false
  
  // 检测图片URL
  const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i
  if (imageUrlPattern.test(value)) return true
  
  // 检测base64图片
  const base64Pattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/
  if (base64Pattern.test(value)) return true
  
  return false
}

// 检测是否为工具调用
export function isToolCall(value: any): boolean {
  if (typeof value !== 'object' || value === null) return false
  
  // 检测常见的工具调用模式
  const toolCallPatterns = [
    'function' in value && 'arguments' in value,
    'tool' in value && 'parameters' in value,
    'name' in value && 'arguments' in value && 'type' in value,
    'function_call' in value,
    'tool_call' in value
  ]
  
  return toolCallPatterns.some(Boolean)
}

// 检测是否为推理内容
export function isReasoningContent(key: string, value: any): boolean {
  if (typeof value !== 'string') return false
  
  const reasoningKeywords = [
    'reasoning', 'reason', 'thought', 'thinking', 'analysis',
    'rationale', 'explanation', 'chain_of_thought', 'cot'
  ]
  
  const keyLower = key.toLowerCase()
  return reasoningKeywords.some(keyword => keyLower.includes(keyword))
}

// 主类型检测函数
export function detectDataType(key: string, value: any): DataType {
  // 基本类型
  if (value === null || value === undefined) return 'primitive'
  
  const valueType = typeof value
  if (valueType === 'number' || valueType === 'boolean') return 'primitive'
  
  // 数组
  if (Array.isArray(value)) return 'array'
  
  // 字符串内容检测
  if (valueType === 'string') {
    // 图片检测优先级最高
    if (isImageContent(value)) return 'image'
    
    // 数学公式
    if (isMathContent(value)) return 'math'
    
    // 代码检测
    const codeCheck = isCodeContent(value)
    if (codeCheck.isCode) return 'code'
    
    // 推理内容
    if (isReasoningContent(key, value)) return 'reasoning'
    
    // 默认文本
    return 'text'
  }
  
  // 对象检测
  if (valueType === 'object') {
    // 工具调用
    if (isToolCall(value)) return 'tool_call'
    
    // 代码对象
    const codeCheck = isCodeContent(value)
    if (codeCheck.isCode) return 'code'
    
    // 检测是否为纯数据对象
    const keys = Object.keys(value)
    if (keys.length < 10 && !keys.some(k => typeof value[k] === 'object')) {
      return 'json'
    }
    
    return 'object'
  }
  
  return 'json'
}

// 分析整个JSON数据结构
export function analyzeDataStructure(data: any): TypedField[] {
  const fields: TypedField[] = []
  
  function traverse(obj: any, path: string = '') {
    if (obj === null || obj === undefined) return
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const key = `${path}[${index}]`
        const type = detectDataType(key, item)
        fields.push({ key, value: item, type })
        
        if (typeof item === 'object' && item !== null) {
          traverse(item, key)
        }
      })
    } else if (typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key
        const type = detectDataType(key, value)
        fields.push({ key: fullPath, value, type })
        
        if (typeof value === 'object' && value !== null && !isImageContent(value)) {
          traverse(value, fullPath)
        }
      })
    }
  }
  
  traverse(data)
  return fields
}

