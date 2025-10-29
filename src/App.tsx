import { useState } from 'react'
import { Upload, FileJson, AlertCircle } from 'lucide-react'
import DataViewer from './components/DataViewer'
import './App.css'

function App() {
  const [jsonData, setJsonData] = useState<any>(null)
  const [inputText, setInputText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleParse = () => {
    try {
      setError(null)
      const parsed = JSON.parse(inputText)
      setJsonData(parsed)
    } catch (err) {
      setError('JSON 解析失败，请检查格式是否正确')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          setError(null)
          const content = e.target?.result as string
          const parsed = JSON.parse(content)
          setJsonData(parsed)
          setInputText(content)
        } catch (err) {
          setError('文件解析失败，请确保是有效的 JSON 文件')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setJsonData(null)
    setInputText('')
    setError(null)
  }

  const loadExample = () => {
    const example = {
      type: "conversation",
      messages: [
        {
          role: "user",
          content: "请帮我解决这个数学问题：求解方程 $x^2 + 5x + 6 = 0$"
        },
        {
          role: "assistant",
          content: "我来帮你解这个一元二次方程。\n\n使用求根公式：$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$\n\n其中 $a=1, b=5, c=6$",
          reasoning: "这是一个标准的一元二次方程，可以用因式分解或求根公式求解。"
        },
        {
          role: "user",
          content: "能否用代码验证一下？"
        },
        {
          role: "assistant",
          content: "当然可以，这是 Python 代码：",
          code: {
            language: "python",
            content: "import numpy as np\n\n# 方程系数\na, b, c = 1, 5, 6\n\n# 使用求根公式\ndiscriminant = b**2 - 4*a*c\nx1 = (-b + np.sqrt(discriminant)) / (2*a)\nx2 = (-b - np.sqrt(discriminant)) / (2*a)\n\nprint(f'解为: x1={x1}, x2={x2}')\n# 输出: 解为: x1=-2.0, x2=-3.0"
          }
        },
        {
          role: "tool_call",
          function: "calculate",
          arguments: {
            expression: "(-5 + sqrt(25-24))/2",
            mode: "exact"
          },
          result: -2
        }
      ],
      metadata: {
        task_type: "math_problem_solving",
        difficulty: "easy",
        timestamp: "2025-01-15T10:30:00Z",
        image_url: "https://picsum.photos/400/300"
      }
    }
    
    setInputText(JSON.stringify(example, null, 2))
    setJsonData(example)
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <FileJson size={32} />
            <h1>LLM 数据浏览器</h1>
          </div>
          <p className="header-subtitle">专业的 JSON 数据可视化工具 - 支持文本、代码、数学公式、图片等多种数据类型</p>
        </div>
      </header>

      <div className="app-container">
        <div className="input-section">
          <div className="input-header">
            <h2>数据输入</h2>
            <div className="input-actions">
              <button className="btn-example" onClick={loadExample}>
                加载示例
              </button>
              <label className="btn-upload">
                <Upload size={18} />
                上传文件
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <textarea
            className="json-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='粘贴 JSON 数据或上传文件...\n\n示例：\n{\n  "type": "text",\n  "content": "你的数据"\n}'
          />

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="input-footer">
            <button 
              className="btn-primary" 
              onClick={handleParse}
              disabled={!inputText.trim()}
            >
              解析并查看
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleClear}
              disabled={!inputText && !jsonData}
            >
              清空
            </button>
          </div>
        </div>

        {jsonData && (
          <div className="viewer-section fade-in">
            <DataViewer data={jsonData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

