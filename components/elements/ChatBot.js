import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import usePosts from '@/hooks/usePosts';
import useCategory from '@/hooks/useCategory';
import axiosInstance from '@/util/axiosInstance';
import { getBlogPostUrl, getCategoryUrl } from '@/util/urlHelpers';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: 'Add interactivity, no code needed. I can help you find the right news and articles, and provide business insights about the market. How can I assist you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { data: postsData } = usePosts({ enabled: isOpen });
  const { data: categoriesData } = useCategory({ enabled: isOpen });

  const posts = postsData?.frontPagePosts || postsData?.trendingPosts || [];
  const categories = categoriesData || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const searchArticles = (query) => {
    if (!query || query.trim() === '') return [];

    const searchTerm = query.toLowerCase();
    const matchingPosts = posts.filter((post) => {
      const title = (post.title || '').toLowerCase();
      const category = (post.Category?.name || '').toLowerCase();
      return title.includes(searchTerm) || category.includes(searchTerm);
    });

    return matchingPosts.slice(0, 5); // Return top 5 matches
  };

  const getBusinessInsights = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Market insights keywords
    if (lowerQuery.includes('market') || lowerQuery.includes('trend') || lowerQuery.includes('insight')) {
      return {
        type: 'insight',
        content: `Here are some key market insights:\n\n• Stay updated with our trending articles covering the latest market movements\n• Explore our categories to find industry-specific insights\n• Check out our featured posts for in-depth analysis\n\nWould you like me to find specific articles about market trends?`,
      };
    }

    // Business insights
    if (lowerQuery.includes('business') || lowerQuery.includes('corporate') || lowerQuery.includes('company')) {
      return {
        type: 'insight',
        content: `Business insights available:\n\n• Corporate news and analysis\n• Company profiles and interviews\n• Industry trends and forecasts\n• Strategic business advice\n\nI can help you find articles on specific companies or business topics. What would you like to explore?`,
      };
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let responseText = '';
    let responseType = 'text';
    let responseData = null;

    const query = inputValue.toLowerCase();

    // Check for article search
    if (query.includes('find') || query.includes('search') || query.includes('article') || query.includes('news') || query.includes('post')) {
      const matchingPosts = searchArticles(inputValue);
      
      if (matchingPosts.length > 0) {
        responseType = 'articles';
        responseData = matchingPosts;
        responseText = `I found ${matchingPosts.length} article(s) matching your search:`;
      } else {
        responseText = "I couldn't find any articles matching your search. Try searching by category or topic. You can also browse our trending articles or explore categories.";
      }
    }
    // Check for category requests
    else if (query.includes('category') || query.includes('topic') || query.includes('type')) {
      if (categories.length > 0) {
        responseType = 'categories';
        responseData = categories;
        responseText = `Here are the available categories:`;
      } else {
        responseText = 'Categories are currently being loaded. Please try again in a moment.';
      }
    }
    // Check for business insights
    else if (query.includes('insight') || query.includes('market') || query.includes('business') || query.includes('trend')) {
      const insight = getBusinessInsights(inputValue);
      if (insight) {
        responseText = insight.content;
      } else {
        responseText = `I can help you with:\n\n• Finding specific articles and news\n• Market trends and insights\n• Business analysis\n• Category browsing\n\nWhat would you like to explore?`;
      }
    }
    // Greeting
    else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      responseText = `Hello! I'm here to help you navigate Corp Crunch. I can help you:\n\n• Find articles and news\n• Explore categories\n• Get business and market insights\n\nWhat would you like to do?`;
    }
    // Help
    else if (query.includes('help')) {
      responseText = `I can help you with:\n\n• **Search articles**: "Find articles about technology" or "Search for business news"\n• **Browse categories**: "Show me categories" or "What topics are available?"\n• **Market insights**: "Tell me about market trends" or "Business insights"\n• **General help**: Ask me anything about navigating the site\n\nTry asking me to find something specific!`;
    }
    // Default response
    else {
      // Try to find articles anyway
      const matchingPosts = searchArticles(inputValue);
      if (matchingPosts.length > 0) {
        responseType = 'articles';
        responseData = matchingPosts;
        responseText = `I found these articles that might interest you:`;
      } else {
        responseText = `I can help you find articles, explore categories, or provide business insights. Try asking:\n\n• "Find articles about [topic]"\n• "Show me categories"\n• "Market insights"\n• "Business trends"`;
      }
    }

    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      text: responseText,
      responseType,
      data: responseData,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className={`chatbot-container ${isOpen ? 'chatbot-open' : ''}`}>
        {!isOpen ? (
          <div className="chatbot-icon-only" onClick={() => setIsOpen(!isOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        ) : (
          <div className="chatbot-header" onClick={() => setIsOpen(!isOpen)}>
            <div className="chatbot-header-content">
              <span className="chatbot-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
              <span className="chatbot-title">Chat Assistant</span>
            </div>
            <button className="chatbot-toggle" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
              {isOpen ? '−' : '+'}
            </button>
          </div>
        )}

        {isOpen && (
          <div className="chatbot-body">
            <div className="chatbot-messages">
              {messages.map((message) => (
                <div key={message.id} className={`chatbot-message chatbot-message-${message.type}`}>
                  {message.type === 'assistant' && message.responseType === 'articles' && message.data ? (
                    <div className="chatbot-articles-response">
                      <p className="chatbot-message-text">{message.text}</p>
                      <div className="chatbot-articles-list">
                        {message.data.map((post) => (
                          <Link
                            key={post.id || post.slug}
                            href={getBlogPostUrl(post)}
                            className="chatbot-article-item"
                          >
                            <div className="chatbot-article-content">
                              <h4 className="chatbot-article-title">{post.title}</h4>
                              {post.Category?.name && (
                                <span className="chatbot-article-category">{post.Category.name}</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : message.type === 'assistant' && message.responseType === 'categories' && message.data ? (
                    <div className="chatbot-categories-response">
                      <p className="chatbot-message-text">{message.text}</p>
                      <div className="chatbot-categories-list">
                        {message.data.map((category) => (
                          <Link
                            key={category.id}
                            href={getCategoryUrl(category)}
                            className="chatbot-category-item"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="chatbot-message-text">{message.text}</p>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-message chatbot-message-assistant">
                  <p className="chatbot-message-text chatbot-typing">Thinking...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
              <input
                ref={inputRef}
                type="text"
                className="chatbot-input"
                placeholder="Ask me about articles, categories, or market insights..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className="chatbot-send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          right: 20px;
          bottom: 20px;
          width: 380px;
          max-width: calc(100vw - 40px);
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .chatbot-icon-only {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #ff2092;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255, 32, 146, 0.4);
          transition: all 0.3s ease;
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 1000;
        }

        .chatbot-icon-only:hover {
          background: #e00282;
          box-shadow: 0 6px 25px rgba(255, 32, 146, 0.5);
          transform: scale(1.1);
        }

        .chatbot-container:not(.chatbot-open) .chatbot-header {
          border-radius: 50px;
          padding: 12px 20px;
        }

        .chatbot-header {
          background: #ff2092;
          color: white;
          padding: 16px 20px;
          border-radius: 16px 16px 0 0;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(255, 32, 146, 0.4);
          transition: all 0.3s ease;
        }

        .chatbot-header:hover {
          background: #e00282;
          box-shadow: 0 6px 25px rgba(255, 2, 146, 0.5);
        }

        .chatbot-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chatbot-icon {
          font-size: 20px;
          display: flex;
          align-items: center;
        }

        .chatbot-title {
          font-size: 15px;
          font-weight: 600;
        }

        .chatbot-toggle {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 18px;
          font-weight: 300;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .chatbot-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-body {
          background: white;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          display: flex;
          flex-direction: column;
          height: 600px;
          max-height: calc(100vh - 200px);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #ff0292;
          border-radius: 10px;
        }

        .chatbot-message {
          display: flex;
          flex-direction: column;
          max-width: 85%;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-message-user {
          align-self: flex-end;
        }

        .chatbot-message-assistant {
          align-self: flex-start;
        }

        .chatbot-message-text {
          padding: 12px 16px;
          border-radius: 18px;
          line-height: 1.5;
          white-space: pre-line;
          word-wrap: break-word;
        }

        .chatbot-message-user .chatbot-message-text {
          background: linear-gradient(135deg, #e0d5f7 0%, #d4c5f0 100%);
          color: #2d1b4e;
          border-bottom-right-radius: 4px;
        }

        .chatbot-message-assistant .chatbot-message-text {
          background: #ff0292;
          color: white;
          border-bottom-left-radius: 4px;
        }

        .chatbot-typing {
          position: relative;
        }

        .chatbot-typing::after {
          content: '...';
          animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }

        .chatbot-articles-response,
        .chatbot-categories-response {
          width: 100%;
        }

        .chatbot-articles-list,
        .chatbot-categories-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chatbot-article-item,
        .chatbot-category-item {
          display: block;
          padding: 12px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          text-decoration: none;
          color: white;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chatbot-article-item:hover,
        .chatbot-category-item:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateX(4px);
        }

        .chatbot-article-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chatbot-article-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          color: white;
        }

        .chatbot-article-category {
          font-size: 12px;
          opacity: 0.9;
          color: white;
        }

        .chatbot-category-item {
          text-align: center;
          font-weight: 500;
        }

        .chatbot-input-container {
          display: flex;
          padding: 16px;
          border-top: 1px solid #e5e5e5;
          gap: 8px;
          background: #fafafa;
        }

        .chatbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e5e5e5;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chatbot-input:focus {
          border-color: #667eea;
        }

        .chatbot-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .chatbot-send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #ff0292;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .chatbot-send-button:hover:not(:disabled) {
          background: #e00282;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 2, 146, 0.4);
        }

        .chatbot-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 991.98px) {
          .chatbot-container {
            right: 10px;
            bottom: 10px;
            width: calc(100vw - 20px);
          }
          .chatbot-icon-only {
            right: 10px;
            bottom: 10px;
            width: 50px;
            height: 50px;
          }
        }

        @media (max-width: 768px) {
          .chatbot-container {
            width: calc(100vw - 20px);
            right: 10px;
            bottom: 10px;
          }
          .chatbot-icon-only {
            right: 10px;
            bottom: 10px;
            width: 48px;
            height: 48px;
          }

          .chatbot-body {
            height: 500px;
            max-height: calc(100vh - 150px);
          }
        }

        @media (max-width: 480px) {
          .chatbot-container {
            width: calc(100vw - 10px);
            right: 5px;
            bottom: 5px;
          }
          .chatbot-icon-only {
            right: 10px;
            bottom: 10px;
            width: 44px;
            height: 44px;
          }
          .chatbot-icon-only svg {
            width: 20px;
            height: 20px;
          }

          .chatbot-message {
            max-width: 90%;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
