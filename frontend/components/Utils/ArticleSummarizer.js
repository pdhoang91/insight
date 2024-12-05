import React, { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa6';
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
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
    marginTop: '8px',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  languageSelect: {
    marginBottom: '16px'
  },
  promptArea: {
    marginTop: '16px',
    marginBottom: '16px'
  }
};

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

  const defaultPrompts = {
    vi: `Hãy viết lại bài viết technical này với phong cách thân thiện và hài hước hơn:

1. Mở đầu:
- Thêm một hook/mở đầu thú vị để thu hút người đọc
- Sử dụng phép so sánh hoặc ẩn dụ dễ hiểu để giới thiệu vấn đề
- Giải thích ngắn gọn tại sao chủ đề này quan trọng

2. Nội dung chính:
- Chia nhỏ các khái niệm phức tạp thành những phần dễ hiểu
- Thêm ví dụ thực tế và so sánh hài hước khi giải thích
- Sử dụng giọng điệu conversational và thân thiện
- Thêm các tips và lưu ý quan trọng dưới dạng "Pro tip:" hoặc "Fun fact:"
- Giữ lại tất cả thông tin kỹ thuật quan trọng nhưng diễn đạt đơn giản hơn

3. Kết luận:
- Tóm tắt các điểm chính một cách ngắn gọn
- Thêm một câu kết thú vị hoặc call-to-action
- Có thể kèm theo một joke/meme liên quan để kết thúc

Yêu cầu bổ sung:
- Sử dụng nhiều emoji phù hợp để làm nổi bật các phần 
- Thêm các tiêu đề phụ hài hước nhưng vẫn liên quan
- Giữ giọng văn vui tươi nhưng vẫn chuyên nghiệp
- Đảm bảo nội dung vẫn chính xác và đáng tin cậy về mặt kỹ thuật

Hãy viết lại bài viết sau theo hướng dẫn trên:

[Nội dung bài viết sau]: `,

    en: `Let's rewrite this technical article with a friendly and humorous tone:

1. Introduction:
- Add an interesting hook to grab readers' attention
- Use relatable metaphors or analogies to introduce the topic
- Briefly explain why this topic matters

2. Main Content:
- Break down complex concepts into digestible chunks
- Add real-world examples and humorous comparisons
- Use a conversational and friendly tone
- Include important tips as "Pro tip:" or "Fun fact:"
- Keep all technical information accurate while making it more accessible

3. Conclusion:
- Summarize key points concisely
- Add an engaging closing line or call-to-action
- Maybe throw in a related joke/meme to wrap things up

Additional Requirements:
- Use appropriate emojis to highlight sections
- Add humorous but relevant subheadings
- Keep the tone fun while maintaining professionalism
- Ensure technical accuracy and reliability

Please rewrite the following article according to these guidelines:

[Article content]: `,

    zh: `让我们以友好幽默的语气重写这篇技术文章：

1. 开篇：
- 添加有趣的开场白来吸引读者
- 使用易懂的比喻或类比来介绍主题
- 简要说明这个主题的重要性

2. 主要内容：
- 将复杂概念分解成容易理解的部分
- 添加实际例子和幽默的比较
- 使用对话式和友好的语气
- 以"专业提示："或"趣味知识："的形式包含重要提示
- 保持技术信息准确的同时使其更容易理解

3. 结论：
- 简明扼要地总结要点
- 添加一个有趣的结束语或行动号召
- 可以在最后加入相关的笑话/梗图

补充要求：
- 使用适当的表情符号突出各个部分
- 添加幽默但相关的副标题
- 保持有趣的同时维持专业性
- 确保技术准确性和可靠性

请按照以上指南重写以下文章：

[文章内容]: `,

    ja: `このテクニカル記事を親しみやすくユーモアのある調子で書き直しましょう：

1. 導入：
- 読者の興味を引く面白いフックを追加
- トピックを紹介するために分かりやすい比喻やアナロジーを使用
- このトピックの重要性を簡潔に説明

2. 主要内容：
- 複雑な概念を理解しやすい部分に分解
- 実例とユーモアのある比較を追加
- 会話的で親しみやすい口調を使用
- 重要なヒントを「プロのヒント：」や「豆知識：」として含める
- 技術情報の正確性を保ちながら、より分かりやすく表現

3. 結論：
- 要点を簡潔にまとめる
- 魅力的な締めくくりや行動喚起を追加
- 関連するジョーク/ミームで締めくくることも可能

追加要件：
- 適切な絵文字でセクションを強調
- ユーモアがあり関連性のある小見出しを追加
- 専門性を保ちながら楽しい調子を維持
- 技術的な正確性と信頼性を確保

以下の記事をこれらのガイドラインに従って書き直してください：

[記事の内容]: `
};

  // Set default prompt when language changes
  React.useEffect(() => {
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

          <div style={styles.promptArea}>
            <textarea
              placeholder="Tùy chỉnh prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              style={styles.textarea}
            />
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