"use client"

import { useState } from "react"
import { MessageSquare, Send, Bot, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EmployeeChat() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      content: "Hello! I'm your HR assistant. How can I help you today?",
      timestamp: "10:00 AM"
    },
    {
      id: 2,
      sender: "user",
      content: "What's the policy for remote work?",
      timestamp: "10:01 AM"
    },
    {
      id: 3,
      sender: "bot",
      content: "Our remote work policy allows employees to work from home up to 3 days per week. You'll need to coordinate with your team lead and ensure you're available during core hours (10 AM - 4 PM). Would you like more details?",
      timestamp: "10:01 AM"
    }
  ])

  const chatHistory = [
    { title: "Leave policy questions", date: "Yesterday", messages: 8 },
    { title: "Benefits enrollment", date: "3 days ago", messages: 12 },
    { title: "Expense reimbursement", date: "1 week ago", messages: 6 },
    { title: "Remote work setup", date: "2 weeks ago", messages: 10 }
  ]

  const handleSend = () => {
    if (!message.trim()) return
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    setMessage("")
  }

  return (
    <div className="flex h-full">
      {/* Chat History Sidebar */}
      <aside className="w-80 border-r bg-card p-6">
        <h2 className="text-xl font-bold mb-6">Chat History</h2>
        <div className="space-y-3">
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
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
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
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-lg ${
                  msg.sender === 'bot' ? 'bg-primary/10' : 'bg-secondary'
                }`}>
                  {msg.sender === 'bot' ? (
                    <Bot className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-lg max-w-lg ${
                    msg.sender === 'bot' 
                      ? 'bg-secondary text-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-6">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
