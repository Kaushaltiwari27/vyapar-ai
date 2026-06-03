"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User } from "lucide-react";
import { toast } from "react-hot-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Is mahine ka total revenue kya hai?",
  "Kaun se deals close hone wale hain?",
  "Kaunse invoices overdue hain?",
  "Mera best customer kaun hai?",
  "Pipeline mein kitni value hai?"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Namaste! Main Vyapaar Mitra hoon. Aap apne business data (customers, deals, invoices) ke baare mein kuch bhi pooch sakte hain." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const query = overrideInput || input;
    if (!query.trim() || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantMessage;
            return newMessages;
          });
        }
      }
    } catch (error: unknown) {
      toast.error((error as Error).message);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, kuch error aaya server connect karne mein." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      
      {/* Left Sidebar - Suggested Questions */}
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col py-6">
        <div className="px-6 mb-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Suggested
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(q);
                handleSubmit(undefined, q);
              }}
              disabled={isLoading}
              className="w-full text-left p-3 text-sm text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors border border-slate-100 hover:border-indigo-100"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                  m.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : 'VM'}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                  VM
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sawaal puchiye... (eg. Mera total revenue kya hai?)"
              className="flex-1 h-12 bg-slate-50"
              disabled={isLoading}
            />
            <Button type="submit" className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 p-0" disabled={isLoading || !input.trim()}>
              <Send className="w-5 h-5 text-white" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
