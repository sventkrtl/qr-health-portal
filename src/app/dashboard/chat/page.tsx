'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Send, Bot, User, ArrowLeft, Loader2, Plus, Trash2, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSessions(data);
    }
  };

  const loadMessages = async (sessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: new Date(m.created_at),
      })));
    }
    setCurrentSessionId(sessionId);
  };

  const createNewSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single();

    if (data) {
      setSessions([data, ...sessions]);
      setCurrentSessionId(data.id);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;

    // Create new session if none exists
    if (!sessionId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: input.slice(0, 50) })
        .select()
        .single();

      if (newSession) {
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setSessions([newSession, ...sessions]);
      }
    }

    if (!sessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: input,
      });

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: data.response,
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition ${
                  currentSessionId === session.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => loadMessages(session.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">{session.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition"
                >
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">QR Health Assistant</h1>
              <p className="text-sm text-gray-500">Powered by Ollama AI</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <Bot className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h2>
                <p className="text-gray-600">
                  Ask me anything about your health records, medical terminology, or general wellness tips.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your health..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}