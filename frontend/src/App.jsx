import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SendHorizontal, ThumbsUp, ThumbsDown, RefreshCw, BarChart3, X } from 'lucide-react';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return url.replace(/\/$/, '');
};

const API_URL = getApiUrl();

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ☁️, je suis Léa, ravie de vous accompagner aujourd\'hui pour le confort de votre bébé. ✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [responseTimes, setResponseTimes] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    axios.get(`${API_URL}/quick-questions`)
      .then(res => setQuickQuestions(res.data.questions))
      .catch(() => {});
  }, []);

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        message: text,
        history: messages
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        messageIndex: response.data.message_index,
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (response.data.response_time_ms) {
        setResponseTimes(prev => [...prev, response.data.response_time_ms]);
      }
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

  const handleFeedback = async (messageIndex, rating) => {
    const key = messageIndex;
    if (feedbackGiven[key]) return;

    setFeedbackGiven(prev => ({ ...prev, [key]: rating }));

    try {
      await axios.post(`${API_URL}/feedback`, {
        message_index: messageIndex,
        rating: rating,
      });
    } catch {
      // Silently fail for feedback
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`${API_URL}/reset`);
    } catch {}
    setMessages([
      { role: 'assistant', content: 'Bonjour ☁️, je suis Léa, ravie de vous accompagner aujourd\'hui pour le confort de votre bébé. ✨' }
    ]);
    setFeedbackGiven({});
    setResponseTimes([]);
  };

  const handleShowStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
      setShowStats(true);
    } catch {}
  };

  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

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
      <header className="glass sticky top-0 bg-white/70 backdrop-blur-md border-b border-slate-200 py-3 px-4 sm:py-4 sm:px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl shadow-inner animate-pulse">
            ☁️
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-800">Petit Nuage</h1>
            <p className="text-xs text-slate-500 font-medium">Léa • Assistante virtuelle</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShowStats}
            className="text-slate-400 hover:text-sky-500 transition-colors p-2 rounded-full hover:bg-sky-50"
            title="Voir les statistiques"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-sky-500 transition-colors p-2 rounded-full hover:bg-sky-50"
            title="Nouvelle conversation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Modal */}
      {showStats && stats && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowStats(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Statistiques de la session</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-sky-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-sky-600">{stats.total_messages}</p>
                <p className="text-xs text-slate-500">Messages échangés</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.satisfaction_rate}%</p>
                <p className="text-xs text-slate-500">Satisfaction</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.total_conversations}</p>
                <p className="text-xs text-slate-500">Conversations</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">{avgResponseTime}ms</p>
                <p className="text-xs text-slate-500">Temps moyen</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-4 h-4" /> {stats.positive_feedback}
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <ThumbsDown className="w-4 h-4" /> {stats.negative_feedback}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {/* Quick Questions - shown when only the welcome message exists */}
          {messages.length === 1 && quickQuestions.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2 font-medium">Questions fréquentes :</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-white/80 backdrop-blur-sm border border-sky-200 text-sky-600 rounded-full px-3 py-1.5 hover:bg-sky-50 hover:border-sky-300 transition-all shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                {/* Feedback buttons for assistant messages */}
                {msg.role === 'assistant' && msg.messageIndex !== undefined && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
                    {feedbackGiven[msg.messageIndex] ? (
                      <span className="text-xs text-slate-400">
                        {feedbackGiven[msg.messageIndex] === 'up' ? '👍 Merci !' : '👎 Noté'}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFeedback(msg.messageIndex, 'up')}
                          className="text-slate-300 hover:text-green-500 transition-colors p-1 rounded"
                          title="Réponse utile"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.messageIndex, 'down')}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                          title="Réponse non utile"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
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
      <footer className="p-3 sm:p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 relative z-20">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message ici..."
              className="w-full border border-slate-200 rounded-full px-4 sm:px-5 py-3 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all text-sm bg-white/50 backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-all shadow-lg shadow-sky-200 disabled:shadow-none hover:scale-105 active:scale-95"
          >
            <SendHorizontal className="w-5 h-5" />
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
