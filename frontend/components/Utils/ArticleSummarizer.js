import React, { useState } from 'react';
import { fetchArticle, summarizeArticle } from '../../services/aiService';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    //boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    width: '100%'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    width: '100%'
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    width: '100%',
    minHeight: '150px',
    resize: 'vertical'
  },
  button: {
    padding: '12px 24px',
    background: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed'
  },
  error: {
    padding: '12px',
    background: '#fff2f2',
    color: '#d32f2f',
    borderRadius: '4px',
    marginTop: '16px'
  },
  summaryContainer: {
    marginTop: '24px'
  },
  summaryTitle: {
    fontSize: '18px',
    marginBottom: '12px',
    color: '#333'
  },
  summary: {
    padding: '16px',
    background: '#f5f5f5',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap'
  }
};


const ArticleSummarizer = () => {
  const [inputType, setInputType] = useState('text');
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'o1-mini', name: 'o1-mini' },
    { id: 'gpt-4o', name: 'gpt-4o' },
  ];

  const summarizePrompt = (content) => `
    Hãy viết lại nội dung bài viết sau một cách rõ ràng và mạch lạc. 
    Đảm bảo giữ lại các ý chính và thông tin quan trọng. Đảm bảo nội dung bài viết có các bố cục rõ ràng như mở bài, thân bài, kết bài.
    Nội dung bài viết:
    
    ${content}
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');

    try {
      let content = input;

      // Nếu là URL, fetch nội dung bài viết
      if (inputType === 'url') {
        content = await fetchArticle(input);
      }

      // Tạo prompt với nội dung
      const prompt = summarizePrompt(content);

      // Gọi API ChatGPT để tóm tắt
      const summarizedText = await summarizeArticle(content, model, prompt);
      setSummary(summarizedText);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Viết Lại Bài Viết Với ChatGPT</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <select 
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setInput('');
              }}
              style={styles.select}
            >
              <option value="text">Nội dung văn bản</option>
              <option value="url">Link bài viết</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            {inputType === 'url' ? (
              <input
                type="text"
                placeholder="Nhập URL bài viết..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={styles.input}
              />
            ) : (
              <textarea
                placeholder="Nhập nội dung bài viết..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                style={styles.textarea}
              />
            )}
          </div>

          <div style={styles.inputGroup}>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={styles.select}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            style={{
              ...styles.button,
              ...((!input.trim() || loading) ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'Đang xử lý...' : 'Tóm Tắt'}
          </button>
        </form>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {summary && (
          <div style={styles.summaryContainer}>
            <h3 style={styles.summaryTitle}>Bản Viết Lại:</h3>
            <div style={styles.summary}>
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleSummarizer;