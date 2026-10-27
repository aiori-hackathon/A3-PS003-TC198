import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Trash2
} from 'lucide-react';
import { sendAssistantMessage } from '../../services/api';

const QUICK_PROMPTS = [
  "How does FL map to Ranchi & Tumakuru?",
  "What is the Best Forecasting Model MAE?",
  "Why was Round 8 selected in FedAvg?",
  "What is the network size per FL round?"
];

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('assistant') === 'open';
    }
    return false;
  });
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am the TrafficPulse-X Assistant. Ask me anything about our Graph+LSTM forecasting models, Federated Learning architecture, Indian smart-mobility case studies (Ranchi, Tumakuru, Visakhapatnam), or active decision intelligence.',
      source: 'local_knowledge_base'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      // Build history for backend context
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendAssistantMessage(text, historyPayload);
      if (res && res.reply) {
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: res.reply,
          source: res.source,
          model: res.model
        }]);
      } else {
        throw new Error('Invalid response received from assistant service.');
      }
    } catch (err) {
      setError(err.message || 'Unable to contact assistant server.');
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: `Error connecting to assistant service: ${err.message || 'Server timeout'}. Please ensure the backend server is running on port 8000.`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you explore TrafficPulse-X today?',
        source: 'local_knowledge_base'
      }
    ]);
    setError(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">

      {/* Floating Launcher Button (When closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          title="Open TrafficPulse-X Assistant"
          aria-label="Open TrafficPulse-X Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-cyan-500/25 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask TrafficPulse-X</span>
        </button>
      )}

      {/* Floating Chat Window (When open) */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">

          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#04101A] border-b border-slate-200 dark:border-[#17364E] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-[#F7FAFF]">
                    TrafficPulse-X Assistant
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-[#8295A8] font-sans">
                  Ask about traffic intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                type="button"
                title="Clear Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#0E283E] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                title="Minimize Assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#0E283E] transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                title="Close Assistant"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#0E283E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : msg.isError
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-bl-none'
                        : 'bg-slate-100 dark:bg-[#081C2E] border border-slate-200 dark:border-[#17364E] text-slate-800 dark:text-[#E2EDF8] rounded-bl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs">
                      {msg.content}
                    </div>

                    {!isUser && msg.source && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-[#17364E]/60 text-[9px] font-mono text-slate-400 dark:text-[#7A93AA] flex items-center justify-between">
                        <span>Engine: {msg.source === 'gemini' ? 'Gemini 1.5 Flash' : 'TrafficPulse Knowledge'}</span>
                        {msg.source === 'gemini' ? (
                          <span className="text-cyan-400 font-bold">&bull; Live LLM</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">&bull; Verified Benchmark</span>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl rounded-bl-none bg-slate-100 dark:bg-[#081C2E] border border-slate-200 dark:border-[#17364E] flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="text-[10px] font-mono ml-1 text-slate-500">Synthesizing response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts (Only if few messages) */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 py-2 bg-slate-50 dark:bg-[#051321] border-t border-slate-100 dark:border-[#17364E]/60">
              <span className="text-[10px] text-slate-400 dark:text-[#7F96AA] font-mono uppercase font-bold block mb-1.5">
                Suggested questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    type="button"
                    className="text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-700 dark:text-cyan-300 hover:border-cyan-400 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-[#071727] border-t border-slate-200 dark:border-[#17364E]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about models, FL, Ranchi/Vizag, decisions..."
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || loading}
                type="button"
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
