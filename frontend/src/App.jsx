import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return url.endsWith('/chat') ? url : `${url.replace(/\/$/, '')}/chat`;
};

const API_URL = getApiUrl();

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ☁️, je suis Léa, ravie de vous accompagner aujourd’hui pour le confort de votre bébé. ✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, {
        message: input,
        history: messages // Optionnel: pour garder le contexte
      });

      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolée, je rencontre un petit problème technique. Pourriez-vous réessayer dans un instant ? ☁️"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
        <div className="bubble bubble-7"></div>
        <div className="bubble bubble-8"></div>
      </div>

      {/* Header */}
      <header className="glass sticky top-0 bg-white/70 backdrop-blur-md border-b border-slate-200 py-4 px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow-inner animate-pulse">
            ☁️
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Petit Nuage</h1>
            <p className="text-xs text-slate-500 font-medium">Léa • Assistante virtuelle</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-tr-none'
                    : 'bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-2">
                <span className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer / Input */}
      <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 relative z-20">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message ici..."
              className="w-full border border-slate-200 rounded-full px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm bg-white/50 backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-all shadow-lg shadow-sky-200 disabled:shadow-none hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Léa est une intelligence artificielle développée par Petit Nuage pour vous accompagner.
        </p>
      </footer>
    </div>
  );
}

export default App;
