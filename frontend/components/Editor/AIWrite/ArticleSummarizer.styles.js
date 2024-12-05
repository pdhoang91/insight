// src/components/ArticleSummarizer/ArticleSummarizer.styles.js

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
  
  export default styles;
  