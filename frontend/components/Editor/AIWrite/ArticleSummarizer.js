// src/components/ArticleSummarizer/ArticleSummarizer.jsx

import React, { useState, useEffect } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa6';
import { fetchArticle, summarizeArticle } from '../../../services/aiService';
import styles from './ArticleSummarizer.styles';
import defaultPrompts from './defaultPrompts';

const ArticleSummarizer = () => {
  const [inputType, setInputType] = useState('text');
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [customPrompt, setCustomPrompt] = useState('');

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'o1-mini', name: 'o1-mini' },
    { id: 'gpt-4o', name: 'gpt-4o' },
  ];

  const languages = [
    { id: 'vi', name: 'Tiếng Việt' },
    { id: 'en', name: 'English' },
    { id: 'zh', name: '中文' },
    { id: 'ja', name: '日本語' },
  ];

  // Set default prompt when language changes
  useEffect(() => {
    setCustomPrompt(defaultPrompts[selectedLanguage]);
  }, [selectedLanguage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const summarizePrompt = (content) => `
    ${customPrompt}
    
    ${content}
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');

    try {
      let content = input;

      if (inputType === 'url') {
        content = await fetchArticle(input);
      }

      const prompt = summarizePrompt(content);
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
          <div style={styles.languageSelect}>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={styles.select}
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

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

          {/* <div style={styles.promptArea}>
            <textarea
              placeholder="Tùy chỉnh prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              style={styles.textarea}
            />
          </div> */}

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={styles.summaryTitle}>Bản Viết Lại:</h3>
              <button 
                onClick={handleCopy}
                style={{
                  ...styles.copyButton,
                  background: copied ? '#4CAF50' : '#f0f0f0',
                  color: copied ? 'white' : 'black'
                }}
                className="hover:bg-gray-200 transition-colors"
              >
                {copied ? <FaCheck size={16} /> : <FaCopy size={16} />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>
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
