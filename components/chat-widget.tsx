"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, X, Search, Send, ArrowLeft, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js"

// ── Types ──
interface ChatUser {
    id: string
    email: string
    full_name: string
    role: string
    job_title: string | null
    department: string | null
    avatar_url: string | null
}

interface Conversation {
    id: string
    participant_1: string
    participant_2: string
    created_at: string
    other_user?: ChatUser
    last_message?: string
    last_message_time?: string
    unread_count?: number
}

interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    is_read: boolean
    created_at: string
}

// ── Constants ──
const EMPLOYEE_USER_ID = "c9422b3d-9b24-4a45-8e6f-dc578d4a28e7" // Alex Chan
const HR_USER_ID = "8b48b8b0-c0c8-46e8-a940-325df35942da" // Rachel Lim
const MANAGER_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890" // David Wong

// ── Role display helpers ──
const ROLE_LABELS: Record<string, string> = {
    hr_admin: "HR Team",
    manager: "Managers",
    employee: "Employees",
}
const ROLE_ORDER = ["hr_admin", "manager", "employee"]
const ROLE_AVATAR_COLORS: Record<string, string> = {
    hr_admin: "from-purple-100 to-violet-100 text-purple-700",
    manager: "from-amber-100 to-orange-100 text-amber-700",
    employee: "from-emerald-100 to-teal-100 text-emerald-700",
}

// ── Supabase client singleton ──
let _supabaseChat: SupabaseClient | null = null
function getSupabaseChat(): SupabaseClient {
    if (!_supabaseChat) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
        _supabaseChat = createClient(url, key, {
            realtime: { params: { eventsPerSecond: 10 } },
        })
    }
    return _supabaseChat
}

// ═══════════════════════════════════════
// CHAT WIDGET COMPONENT
// ═══════════════════════════════════════
export function ChatWidget({ isHrMode, autoOpenUserId, autoOpenMessage, onAutoOpenHandled }: {
    isHrMode: boolean
    autoOpenUserId?: string | null
    autoOpenMessage?: string | null
    onAutoOpenHandled?: () => void
}) {
    const [view, setView] = useState<"closed" | "contacts" | "chat">("closed")
    const [contacts, setContacts] = useState<ChatUser[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [totalUnread, setTotalUnread] = useState(0)
    const [sending, setSending] = useState(false)
    const [incomingPopup, setIncomingPopup] = useState<{ sender: string; content: string; contact: ChatUser | null; conversationId: string } | null>(null)
    const popupTimerRef = useRef<NodeJS.Timeout | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const globalChannelRef = useRef<RealtimeChannel | null>(null)

    const currentUserId = isHrMode ? HR_USER_ID : EMPLOYEE_USER_ID
    const supabase = getSupabaseChat()

    // ── Auto-open from external trigger (e.g. "Request Info" button) ──
    useEffect(() => {
        if (autoOpenUserId) {
            // Find the contact and open chat with them
            const doAutoOpen = async () => {
                const { data } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", autoOpenUserId)
                    .single()
                if (data) {
                    await openChat(data as ChatUser, autoOpenMessage || undefined)
                }
                onAutoOpenHandled?.()
            }
            doAutoOpen()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenUserId])

    // ── Listen for custom "open-chat-with" events from other components ──
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.userId) {
                const doOpen = async () => {
                    const { data } = await supabase
                        .from("users")
                        .select("*")
                        .eq("id", detail.userId)
                        .single()
                    if (data) {
                        await openChat(data as ChatUser, detail.prefillMessage || undefined)
                    }
                }
                doOpen()
            }
        }
        window.addEventListener("open-chat-with", handler)
        return () => window.removeEventListener("open-chat-with", handler)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId, supabase])

    // ── Scroll to bottom ──
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }, [])

    // ── Fetch contacts — ALL users except self ──
    const fetchContacts = useCallback(async () => {
        const { data } = await supabase
            .from("users")
            .select("*")
            .neq("id", currentUserId)
        if (data) setContacts(data)
    }, [currentUserId, supabase])

    // ── Fetch conversations with unread counts ──
    const fetchConversations = useCallback(async () => {
        const { data: convos } = await supabase
            .from("chat_conversations")
            .select("*")
            .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
            .order("updated_at", { ascending: false })

        if (!convos) return

        // Enrich with last message and unread count
        const enriched: Conversation[] = []
        let totalUnreadCount = 0

        for (const c of convos) {
            const otherId = c.participant_1 === currentUserId ? c.participant_2 : c.participant_1
            const matchedContact = contacts.find((u) => u.id === otherId)

            // Get last message
            const { data: lastMsg } = await supabase
                .from("chat_messages")
                .select("content, created_at")
                .eq("conversation_id", c.id)
                .order("created_at", { ascending: false })
                .limit(1)

            // Get unread count
            const { count } = await supabase
                .from("chat_messages")
                .select("*", { count: "exact", head: true })
                .eq("conversation_id", c.id)
                .eq("is_read", false)
                .neq("sender_id", currentUserId)

            const unread = count || 0
            totalUnreadCount += unread

            enriched.push({
                ...c,
                other_user: matchedContact || {
                    id: otherId,
                    email: "",
                    full_name: "Unknown",
                    role: "",
                    job_title: null,
                    department: null,
                    avatar_url: null,
                },
                last_message: lastMsg?.[0]?.content || "",
                last_message_time: lastMsg?.[0]?.created_at || c.created_at,
                unread_count: unread,
            })
        }

        setConversations(enriched)
        setTotalUnread(totalUnreadCount)
    }, [currentUserId, contacts, supabase])

    // ── Fetch messages for active conversation ──
    const fetchMessages = useCallback(async (conversationId: string) => {
        const { data } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })

        if (data) {
            setMessages(data)
            scrollToBottom()

            // Mark messages as read
            await supabase
                .from("chat_messages")
                .update({ is_read: true })
                .eq("conversation_id", conversationId)
                .neq("sender_id", currentUserId)
                .eq("is_read", false)
        }
    }, [currentUserId, supabase, scrollToBottom])

    // ── Global realtime: listen for new messages across ALL conversations ──
    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

    useEffect(() => {
        if (contacts.length > 0) fetchConversations()
    }, [contacts, fetchConversations])

    useEffect(() => {
        // Subscribe to ALL new messages to update unread counts
        const channel = supabase
            .channel(`global-chat-${currentUserId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "chat_messages" },
                (payload) => {
                    const newMsg = payload.new as Message

                    // If the message is for the currently open conversation, add it
                    if (activeConversation && newMsg.conversation_id === activeConversation.id) {
                        if (newMsg.sender_id !== currentUserId) {
                            setMessages((prev) => {
                                if (prev.some((m) => m.id === newMsg.id)) return prev
                                return [...prev, newMsg]
                            })
                            scrollToBottom()
                            // Mark as read immediately
                            supabase
                                .from("chat_messages")
                                .update({ is_read: true })
                                .eq("id", newMsg.id)
                                .then()
                        }
                    }

                    // Refresh conversations list for unread counts
                    fetchConversations()
                }
            )
            .subscribe()

        globalChannelRef.current = channel
        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId, activeConversation, supabase, scrollToBottom, fetchConversations])

    // ── Find or create conversation ──
    const openChat = async (contact: ChatUser, prefillMessage?: string) => {
        // Determine participant ordering for uniqueness
        const p1 = currentUserId < contact.id ? currentUserId : contact.id
        const p2 = currentUserId < contact.id ? contact.id : currentUserId

        // Try to find existing conversation
        let { data: existing } = await supabase
            .from("chat_conversations")
            .select("*")
            .eq("participant_1", p1)
            .eq("participant_2", p2)
            .limit(1)

        let convo: any
        if (existing && existing.length > 0) {
            convo = existing[0]
        } else {
            const { data: created } = await supabase
                .from("chat_conversations")
                .insert({ participant_1: p1, participant_2: p2 })
                .select()
                .single()
            convo = created
        }

        if (convo) {
            setActiveConversation({
                ...convo,
                other_user: contact,
            })
            setView("chat")
            fetchMessages(convo.id)
            if (prefillMessage) {
                setNewMessage(prefillMessage)
            }
        }
    }

    // ── Send message ──
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || sending) return
        setSending(true)

        const msg = {
            conversation_id: activeConversation.id,
            sender_id: currentUserId,
            content: newMessage.trim(),
            is_read: false,
        }

        const { data } = await supabase
            .from("chat_messages")
            .insert(msg)
            .select()
            .single()

        if (data) {
            setMessages((prev) => [...prev, data])
            setNewMessage("")
            scrollToBottom()

            // Update conversation timestamp
            await supabase
                .from("chat_conversations")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", activeConversation.id)
        }

        setSending(false)
    }

    // ── Handle Enter key ──
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    // ── Format time ──
    const formatTime = (iso: string) => {
        const d = new Date(iso)
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        if (diff < 60000) return "now"
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        return d.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    // ── Initials from name ──
    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

    // ── Filtered contacts ──
    const filteredContacts = contacts.filter((c) =>
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.job_title || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    // ── Handle popup click → open that conversation ──
    const handlePopupClick = async () => {
        if (!incomingPopup) return
        if (incomingPopup.contact) {
            await openChat(incomingPopup.contact)
        }
        setIncomingPopup(null)
        if (popupTimerRef.current) clearTimeout(popupTimerRef.current)
    }

    // ═══════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════

    return (
        <>
            {/* ── Incoming Message Popup Notification ──── */}
            {incomingPopup && (
                <div
                    onClick={handlePopupClick}
                    className="fixed bottom-24 right-6 z-[60] w-[320px] bg-white dark:bg-slate-800 border rounded-xl shadow-2xl p-4 cursor-pointer hover:shadow-3xl transition-all duration-200 animate-in slide-in-from-bottom-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {getInitials(incomingPopup.sender)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">{incomingPopup.sender}</p>
                                <span className="text-[10px] text-muted-foreground">now</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">{incomingPopup.content}</p>
                            <p className="text-[10px] text-blue-600 mt-1 font-medium">Click to reply →</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIncomingPopup(null) }}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
            {/* ── Floating Chat Icon ────────────────── */}
            {view === "closed" && (
                <button
                    onClick={() => { setView("contacts"); fetchContacts(); fetchConversations() }}
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                >
                    <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[11px] font-bold flex items-center justify-center text-white ring-2 ring-white animate-pulse">
                            {totalUnread > 9 ? "9+" : totalUnread}
                        </span>
                    )}
                </button>
            )}

            {/* ── Panel (Contacts or Chat) ────────────────── */}
            {view !== "closed" && (
                <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                    {/* ═══ CONTACTS VIEW ═══ */}
                    {view === "contacts" && (
                        <>
                            {/* Header */}
                            <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-sm">Messages</h3>
                                    <p className="text-[11px] text-blue-100">
                                        Chat with your team
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20"
                                    onClick={() => setView("closed")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="px-3 py-2 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search contacts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-sm bg-secondary/50"
                                    />
                                </div>
                            </div>

                            {/* Recent Conversations */}
                            <ScrollArea className="flex-1">
                                {conversations.length > 0 && (
                                    <div className="px-2 pt-2">
                                        <p className="px-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                            Recent Chats
                                        </p>
                                        {conversations
                                            .filter((c) =>
                                                !searchQuery ||
                                                c.other_user?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((convo) => (
                                                <button
                                                    key={convo.id}
                                                    onClick={() => openChat(convo.other_user!)}
                                                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-secondary/80 transition-colors text-left"
                                                >
                                                    <div className="relative">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                                {getInitials(convo.other_user?.full_name || "?")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {(convo.unread_count || 0) > 0 && (
                                                            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-sm ${(convo.unread_count || 0) > 0 ? "font-semibold" : "font-medium"}`}>
                                                                {convo.other_user?.full_name}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {convo.last_message_time ? formatTime(convo.last_message_time) : ""}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs truncate ${(convo.unread_count || 0) > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                                            {convo.last_message || "No messages yet"}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                )}

                                {/* All Contacts — Grouped by Role */}
                                {ROLE_ORDER.map((role) => {
                                    const roleContacts = filteredContacts.filter((c) => c.role === role)
                                    if (roleContacts.length === 0) return null
                                    return (
                                        <div key={role} className="px-2 pt-2 pb-1">
                                            <p className="px-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                                {ROLE_LABELS[role] || role}
                                            </p>
                                            {roleContacts.map((contact) => (
                                                <button
                                                    key={contact.id}
                                                    onClick={() => openChat(contact)}
                                                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-secondary/80 transition-colors text-left"
                                                >
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className={`bg-gradient-to-br ${ROLE_AVATAR_COLORS[role] || "from-emerald-100 to-teal-100 text-emerald-700"} text-xs font-semibold`}>
                                                            {getInitials(contact.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium">{contact.full_name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {contact.job_title || contact.role}{contact.department ? ` · ${contact.department}` : ""}
                                                        </p>
                                                    </div>
                                                    <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
                                                </button>
                                            ))}
                                        </div>
                                    )
                                })}
                                {filteredContacts.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground py-8">No contacts found</p>
                                )}
                            </ScrollArea>
                        </>
                    )}

                    {/* ═══ CHAT VIEW ═══ */}
                    {view === "chat" && activeConversation && (
                        <>
                            {/* Header */}
                            <div className="px-3 py-2.5 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20 shrink-0"
                                    onClick={() => { setView("contacts"); fetchConversations() }}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                                        {getInitials(activeConversation.other_user?.full_name || "?")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{activeConversation.other_user?.full_name}</p>
                                    <p className="text-[10px] text-blue-100 truncate">
                                        {activeConversation.other_user?.job_title || activeConversation.other_user?.role}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20 shrink-0"
                                    onClick={() => setView("closed")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 px-3 py-3">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                            <MessageCircle className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No messages yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">Say hello! 👋</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {messages.map((msg) => {
                                        const isOwn = msg.sender_id === currentUserId
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isOwn
                                                        ? "bg-blue-600 text-white rounded-br-md"
                                                        : "bg-secondary text-foreground rounded-bl-md"
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                    <p
                                                        className={`text-[10px] mt-1 ${isOwn ? "text-blue-200" : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {formatTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <div className="px-3 py-2.5 border-t bg-background flex items-center gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 h-9 text-sm"
                                    autoFocus
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9 bg-blue-600 hover:bg-blue-700 shrink-0"
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    )
}
