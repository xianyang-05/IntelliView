"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Bot, User, History, X, Loader2, Briefcase, CalendarDays, Receipt, Globe, FileText, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContractContent } from "./contract-content"

interface ChatMessage {
  id: number
  sender: "bot" | "user"
  content: string
  timestamp: string
  source?: string | null
  confidence?: string
  actions?: { label: string, page: string, type?: string, payload?: any }[]
}

const QUICK_SUGGESTIONS = [
  { label: "🏖️ Leave Balance", query: "What is my current leave balance?", icon: CalendarDays },
  { label: "🏠 Remote Work Policy", query: "What is the remote work policy?", icon: Globe },
  { label: "💰 Salary & Deductions", query: "Show me my salary breakdown and deductions", icon: Briefcase },
  { label: "🧾 Expense Claims", query: "How do I submit an expense claim?", icon: Receipt },
  { label: "📋 Benefits Overview", query: "What employee benefits are available?", icon: FileText },
  { label: "❓ General HR Help", query: "What HR services can you help me with?", icon: HelpCircle },
]

interface EmployeeChatProps {
  onNavigate?: (page: string, payload?: any) => void
  userEmail?: string
  userRole?: string
}

export function EmployeeChat({ onNavigate, userEmail, userRole }: EmployeeChatProps) {
  const [message, setMessage] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [viewingProof, setViewingProof] = useState(false)
  const [proofSection, setProofSection] = useState<string | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      content: "Hello! I'm your HR assistant powered by AI. I can help you with company policies, leave balances, salary info, and more. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const chatHistory = [
    { title: "Leave policy questions", date: "Yesterday", messages: 8 },
    { title: "Benefits enrollment", date: "3 days ago", messages: 12 },
    { title: "Expense reimbursement", date: "1 week ago", messages: 6 },
    { title: "Remote work setup", date: "2 weeks ago", messages: 10 }
  ]

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage = text.trim()
    setMessage("")
    setShowSuggestions(false)

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: messages.length + 1,
      sender: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => m.id > 1) // skip the initial greeting
        .map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content
        }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          model: "claude-sonnet-4",
          user_email: userEmail || "alex.chen@zerohr.com",
          user_role: userRole || "employee",
          history: history
        })
      })

      const data = await response.json()

      // Use actions from backend if provided, otherwise fallback to empty array
      const backendActions = data.actions || []
      const actions = backendActions.map((action: any) => ({
        label: action.label,
        page: action.type === 'view_proof' ? 'contracts' : 'requests',
        type: action.type,
        payload: action.payload
      }))

      const botMsg: ChatMessage = {
        id: messages.length + 2,
        sender: "bot",
        content: data.response || "Sorry, I couldn't process that request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        confidence: data.confidence,
        actions: actions.length > 0 ? actions : undefined
      }
      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMsg: ChatMessage = {
        id: messages.length + 2,
        sender: "bot",
        content: "⚠️ Could not connect to the AI server. Please make sure the backend is running (`python backend/server.py`).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => sendMessage(message)
  const handleSuggestionClick = (query: string) => sendMessage(query)

  return (
    <div className="flex h-full relative">
      {/* Chat History Sidebar - Overlay */}
      {showHistory && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowHistory(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-card border-r z-50 shadow-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Chat History</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              <div className="p-4 space-y-3">
                {chatHistory.map((chat, index) => (
                  <Card key={index} className="hover:bg-secondary cursor-pointer transition-colors">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1">{chat.title}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{chat.date}</span>
                        <span>{chat.messages} messages</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </aside>
        </>
      )}

      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            {/* Chat History Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="shrink-0"
            >
              <History className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ask HR</h1>
              <p className="text-sm text-muted-foreground">Get instant answers to your questions</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-lg h-fit ${msg.sender === 'bot' ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                  {msg.sender === 'bot' ? (
                    <Bot className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-lg max-w-lg ${msg.sender === 'bot'
                    ? 'bg-secondary text-foreground'
                    : 'bg-primary text-primary-foreground'
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                    {msg.source && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        📎 {msg.source}
                      </span>
                    )}
                    {msg.confidence && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${msg.confidence === 'high' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                        }`}>
                        {msg.confidence === 'high' ? '✓ High confidence' : '○ Medium confidence'}
                      </span>
                    )}
                  </div>
                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-1">
                      {msg.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => {
                            if (action.type === 'view_proof' || action.payload?.section_id) {
                              setProofSection(action.payload?.section_id)
                              setViewingProof(true)
                            } else {
                              onNavigate?.(action.page, action.payload)
                            }
                          }}
                        >
                          {action.label === 'Request Action' && <Send className="h-3.5 w-3.5" />}
                          {action.label.includes('View') && <FileText className="h-3.5 w-3.5" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Quick Suggestion Chips */}
            {showSuggestions && messages.length === 1 && !isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 pb-2 max-w-xl">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className="flex items-center gap-2 px-3 py-2.5 text-left text-sm rounded-xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <span className="text-base">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 rounded-lg h-fit bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="inline-block p-4 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-6">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              placeholder="Ask about policies, leave, salary, expenses..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSend} size="icon" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Proof Dialog */}
      <Dialog open={viewingProof} onOpenChange={setViewingProof}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col sm:rounded-2xl">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle>Contract Proof</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="py-6">
              <ContractContent highlightSectionId={proofSection} />
            </div>
          </ScrollArea>
          <div className="pt-2 border-t flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setViewingProof(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}
