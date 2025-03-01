import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatBubble: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your OpenLibro assistant. How can I help you with your reading journey today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      generateResponse(inputValue);
    }, 1000);
  };

  const generateResponse = (userInput: string) => {
    // Simple response generation logic
    let response = '';
    const lowercaseInput = userInput.toLowerCase();
    
    if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
      response = "Hello! How can I assist you with OpenLibro today?";
    } else if (lowercaseInput.includes('book') && (lowercaseInput.includes('recommend') || lowercaseInput.includes('suggestion'))) {
      response = "Based on the books in our library, you might enjoy 'The Midnight Chronicles' by Eliza Morgan or 'Echoes of Tomorrow' by Sophia Williams. Would you like more information about either of these?";
    } else if (lowercaseInput.includes('how') && lowercaseInput.includes('earn')) {
      response = "You can earn $OPENVOTE tokens by completing daily and monthly tasks in the Earn section. These tokens can be used to vote on library submissions and earn rewards.";
    } else if (lowercaseInput.includes('staking')) {
      response = "Staking allows you to lock your $LIBRO tokens to receive $sLIBRO tokens. When you stake 50,000 $sLIBRO, you receive 100,000 $OPENVOTE tokens and gain access to the Audit System.";
    } else if (lowercaseInput.includes('thank')) {
      response = "You're welcome! Feel free to ask if you have any other questions about OpenLibro.";
    } else {
      response = "I'm here to help with questions about OpenLibro's features, books, or token system. Could you provide more details about what you're looking for?";
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: response,
      sender: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat bubble button */}
      <button
        onClick={toggleChat}
        className={`${
          isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
        } text-white rounded-full p-3 shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat window */}
      <div
        className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border rounded-lg shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
          isOpen
            ? 'opacity-100 scale-100 w-80 h-96 sm:w-96 sm:h-[28rem]'
            : 'opacity-0 scale-90 w-0 h-0'
        }`}
      >
        {/* Chat header */}
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 flex justify-between items-center`}>
          <div className="flex items-center">
            <Bot className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>OpenLibro Assistant</h3>
          </div>
          <button
            onClick={toggleChat}
            className={`p-1 rounded-full ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
            }`}
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat messages */}
        <div className={`flex-1 overflow-y-auto p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {messages.map(message => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.sender === 'user'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.sender === 'assistant' ? (
                    <Bot className="h-4 w-4 mr-1" />
                  ) : (
                    <User className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.sender === 'assistant' ? 'Assistant' : 'You'}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                <div className="text-right mt-1">
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  <span className="text-xs opacity-75">Assistant</span>
                </div>
                <div className="flex space-x-1 my-2 px-2">
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <form onSubmit={handleSubmit} className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className={`flex-1 px-3 py-2 rounded-l-lg focus:outline-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } border`}
            />
            <button
              type="submit"
              className={`px-3 py-2 rounded-r-lg ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={inputValue.trim() === '' || isTyping}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBubble;