
import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const interactivePrompts = [
  "🚀 What's my top performing job posting?",
  "🎯 Show me candidates with AI match score >90%",
  "📊 Quick analytics on recent submissions",
  "💼 Help me optimize my job descriptions",
  "🔍 Find passive candidates in tech",
  "⚡ Schedule interviews for this week"
];

export function MayaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi! I'm Maya, your AI-powered recruitment assistant.\n\nI'm here to help you streamline your hiring process with intelligent insights and automation. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Cycle through interactive prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % interactivePrompts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced responses with AI personality
  const responses = {
    "hello": "Hello there! 🌟 I'm Maya, and I'm excited to help you revolutionize your recruitment process. What challenge can I help you solve today?",
    "hi": "Hi! 👋 Ready to supercharge your hiring? I can analyze candidates, optimize job posts, and provide intelligent insights. What's on your mind?",
    "jobs": "🎯 Job management is my specialty! I can:\n\n• Analyze job performance metrics\n• Optimize descriptions for better reach\n• Predict application volumes\n• Suggest salary ranges based on market data\n\nWhich aspect interests you most?",
    "candidates": "🔍 Let me help you find the perfect candidates! I can:\n\n• Score candidates using AI algorithms\n• Identify passive talent\n• Analyze skill compatibility\n• Predict candidate success rates\n\nWhat type of role are you hiring for?",
    "submissions": "📊 I'll analyze your submissions with AI precision:\n\n• Real-time match scoring\n• Bias detection in screening\n• Predictive hiring outcomes\n• Automated ranking systems\n\nWant me to run an analysis on recent submissions?",
    "analytics": "📈 Here's what I can analyze for you:\n\n• Hiring funnel conversion rates\n• Time-to-hire optimization\n• Source effectiveness\n• Diversity metrics\n• Predictive hiring trends\n\nWhich metrics would you like to explore?",
    "ai": "🤖 My AI capabilities include:\n\n• Natural language processing for resume analysis\n• Machine learning for candidate matching\n• Predictive analytics for hiring success\n• Automated bias detection\n• Smart recommendation engines\n\nPretty cool, right? What would you like to try?",
    "help": "🚀 Here's how I can revolutionize your hiring:\n\n✨ **Smart Analysis**\n• AI-powered candidate scoring\n• Predictive hiring outcomes\n• Bias detection & mitigation\n\n🎯 **Process Optimization**\n• Interview scheduling automation\n• Job description enhancement\n• Pipeline efficiency analysis\n\n📊 **Intelligence & Insights**\n• Real-time hiring metrics\n• Market trend analysis\n• Compensation benchmarking\n\nWhat interests you most?",
    "default": "🤔 Interesting question! While I'm continuously learning and evolving, I can provide intelligent insights on recruitment strategies, candidate analysis, and hiring optimization.\n\nTry asking me about specific challenges you're facing - I love problem-solving! 🧠✨"
  };

  const getResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return responses.hello;
    } else if (lowerInput.includes('job')) {
      return responses.jobs;
    } else if (lowerInput.includes('candidate')) {
      return responses.candidates;
    } else if (lowerInput.includes('submission')) {
      return responses.submissions;
    } else if (lowerInput.includes('analytic') || lowerInput.includes('report') || lowerInput.includes('metric')) {
      return responses.analytics;
    } else if (lowerInput.includes('ai') || lowerInput.includes('intelligence') || lowerInput.includes('smart')) {
      return responses.ai;
    } else if (lowerInput.includes('help')) {
      return responses.help;
    } else {
      return responses.default;
    }
  };

  const simulateTyping = (content: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      const typingDuration = Math.min(content.length * 30, 2000); // Max 2 seconds
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, typingDuration);
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const currentInput = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI thinking/typing
    const response = getResponse(currentInput);
    await simulateTyping(response);

    const botResponse: Message = {
      id: Date.now() + 1,
      type: 'bot',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
  };

  const handleCloseChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setIsTyping(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt.replace(/[🚀🎯📊💼🔍⚡]/g, '').trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Enhanced Chat Button with AI indicators */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-2xl transition-all duration-300 transform hover:scale-110 group ${
          isOpen ? 'hidden' : 'flex'
        }`}
        size="lg"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 text-white" />
          <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-75 group-hover:opacity-100 animate-pulse"></div>
      </Button>

      {/* Enhanced Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={handleCloseChat}>
          <Card 
            className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col bg-gradient-to-b from-white to-gray-50/50 border-0 ring-1 ring-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-t-lg relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 ring-2 ring-white/30">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        <Brain className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse">
                      <Zap className="w-2 h-2 text-white ml-0.5 mt-0.5" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      Maya
                      <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                        AI
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Recruitment Assistant
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="text-white hover:bg-white/20 transition-colors relative z-50 pointer-events-auto bg-white/10 hover:bg-white/30 rounded-md p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-fade-in ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'bot' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600">
                        <Brain className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap transition-all duration-300 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.type === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600">
                      <Brain className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Prompts */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Try these AI-powered queries:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptClick(interactivePrompts[currentPromptIndex])}
                  className="w-full text-left h-auto p-2 text-xs bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all duration-300"
                >
                  {interactivePrompts[currentPromptIndex]}
                </Button>
              </div>
            </div>

            {/* Enhanced Input */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Maya anything about recruitment..."
                  className="flex-1 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="sm"
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
