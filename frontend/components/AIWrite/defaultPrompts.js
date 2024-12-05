// src/components/ArticleSummarizer/defaultPrompts.js

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
  
  1. 导入：
  - 読者の興味を引く面白いフックを追加
  - トピックを紹介するために分かりやすい比喩やアナロジーを使用
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
  
  export default defaultPrompts;
  