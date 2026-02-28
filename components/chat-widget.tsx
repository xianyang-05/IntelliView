"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, X, Search, Send, ArrowLeft, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db } from "@/lib/firebase"
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    Timestamp,
    getDoc,
    writeBatch,
} from "firebase/firestore"

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
    updated_at?: string
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
const EMPLOYEE_USER_ID = "kKryYn2e28aWeDIdQd8lXvIuN1W2" // Alex Chan
const HR_USER_ID = "IvQlCvZUVlRhWuRJ5kjmQEBpMFT2" // Rachel Lim
const MANAGER_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890" // David Wong

// ── Role display helpers ──
const ROLE_LABELS: Record<string, string> = {
    hr_admin: "HR Team",
    manager: "Managers",
    employee: "Employees",
    candidate: "Candidates",
}
const ROLE_ORDER = ["hr_admin", "manager", "employee", "candidate"]
const ROLE_AVATAR_COLORS: Record<string, string> = {
    hr_admin: "from-purple-100 to-violet-100 text-purple-700",
    manager: "from-amber-100 to-orange-100 text-amber-700",
    employee: "from-emerald-100 to-teal-100 text-emerald-700",
}

// ═══════════════════════════════════════
// CHAT WIDGET COMPONENT
// ═══════════════════════════════════════
export function ChatWidget({ isHrMode, isCandidateMode = false, currentUserIdOverride, autoOpenUserId, autoOpenMessage, onAutoOpenHandled }: {
    isHrMode: boolean
    isCandidateMode?: boolean
    currentUserIdOverride?: string | null
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
    const unsubMessagesRef = useRef<(() => void) | null>(null)

    const currentUserId = currentUserIdOverride || (isHrMode ? HR_USER_ID : EMPLOYEE_USER_ID)
    console.log("ChatWidget mounted with currentUserId:", currentUserId, "override:", currentUserIdOverride);

    // ── Auto-open from external trigger ──
    useEffect(() => {
        if (autoOpenUserId) {
            const doAutoOpen = async () => {
                const userDoc = await getDoc(doc(db, "users", autoOpenUserId))
                if (userDoc.exists()) {
                    await openChat({ id: userDoc.id, ...userDoc.data() } as ChatUser, autoOpenMessage || undefined)
                }
                onAutoOpenHandled?.()
            }
            doAutoOpen()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenUserId])

    // ── Listen for custom "open-chat-with" events ──
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.userId) {
                const doOpen = async () => {
                    const userDoc = await getDoc(doc(db, "users", detail.userId))
                    if (userDoc.exists()) {
                        await openChat({ id: userDoc.id, ...userDoc.data() } as ChatUser, detail.prefillMessage || undefined)
                    }
                }
                doOpen()
            }
        }
        window.addEventListener("open-chat-with", handler)
        return () => window.removeEventListener("open-chat-with", handler)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId])

    // ── Scroll to bottom ──
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }, [])

    // ── Fetch contacts ──
    const fetchContacts = useCallback(async () => {
        const snapshot = await getDocs(collection(db, "users"))
        const users: ChatUser[] = []
        snapshot.forEach((d) => {
            if (d.id !== currentUserId) {
                users.push({ id: d.id, ...d.data() } as ChatUser)
            }
        })
        setContacts(users)
    }, [currentUserId])

    // ── Fetch conversations with unread counts ──
    const fetchConversations = useCallback(async () => {
        // Firestore doesn't support OR on different fields in a single query,
        // so we do two queries and merge
        const q1 = query(
            collection(db, "chat_conversations"),
            where("participant_1", "==", currentUserId),
            orderBy("updated_at", "desc")
        )
        const q2 = query(
            collection(db, "chat_conversations"),
            where("participant_2", "==", currentUserId),
            orderBy("updated_at", "desc")
        )

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
        const convosMap = new Map<string, any>()
        snap1.forEach((d) => convosMap.set(d.id, { id: d.id, ...d.data() }))
        snap2.forEach((d) => convosMap.set(d.id, { id: d.id, ...d.data() }))
        const convos = Array.from(convosMap.values())

        const enriched: Conversation[] = []
        let totalUnreadCount = 0

        for (const c of convos) {
            const otherId = c.participant_1 === currentUserId ? c.participant_2 : c.participant_1
            let matchedContact = contacts.find((u) => u.id === otherId)

            // Get last message
            const msgQ = query(
                collection(db, "chat_messages"),
                where("conversation_id", "==", c.id),
                orderBy("created_at", "desc"),
                limit(1)
            )
            const msgSnap = await getDocs(msgQ)
            let lastMsg: any = null
            msgSnap.forEach((d) => { lastMsg = d.data() })

            // Get unread count
            const unreadQ = query(
                collection(db, "chat_messages"),
                where("conversation_id", "==", c.id),
                where("is_read", "==", false),
                where("sender_id", "!=", currentUserId)
            )
            const unreadSnap = await getDocs(unreadQ)
            const unread = unreadSnap.size

            totalUnreadCount += unread

            if (!matchedContact) {
                if (otherId === "demo-candidate-001") {
                    matchedContact = {
                        id: otherId,
                        email: "candidate@zerohr.com",
                        full_name: "Jordan Lee (Candidate)",
                        role: "candidate",
                        job_title: null,
                        department: null,
                        avatar_url: null,
                    }
                } else if (otherId.includes("candidate")) {
                    matchedContact = {
                        id: otherId,
                        email: "",
                        full_name: "Candidate",
                        role: "candidate",
                        job_title: null,
                        department: null,
                        avatar_url: null,
                    }
                } else {
                    try {
                        const userDoc = await getDoc(doc(db, "users", otherId))
                        if (userDoc.exists()) {
                            matchedContact = { id: userDoc.id, ...userDoc.data() } as ChatUser
                        }
                    } catch (e) {}
                }
            }
            console.log("Resolving chat window. OtherId:", otherId, "MatchedContact:", matchedContact);


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
                last_message: lastMsg?.content || "",
                last_message_time: lastMsg?.created_at || c.created_at,
                unread_count: unread,
            })
        }

        // Sort by last_message_time descending
        enriched.sort((a, b) => {
            const timeA = a.last_message_time || ""
            const timeB = b.last_message_time || ""
            return timeB.localeCompare(timeA)
        })

        setConversations(enriched)
        setTotalUnread(totalUnreadCount)
    }, [currentUserId, contacts])

    // ── Fetch & subscribe to messages for active conversation ──
    const subscribeToMessages = useCallback((conversationId: string) => {
        // Unsubscribe from previous
        unsubMessagesRef.current?.()

        const msgQ = query(
            collection(db, "chat_messages"),
            where("conversation_id", "==", conversationId),
            orderBy("created_at", "asc")
        )

        const unsub = onSnapshot(msgQ, async (snapshot) => {
            const msgs: Message[] = []
            const batch = writeBatch(db)
            let needsBatchCommit = false

            snapshot.forEach((d) => {
                const data = d.data()
                msgs.push({ id: d.id, ...data } as Message)

                // Mark unread messages as read
                if (!data.is_read && data.sender_id !== currentUserId) {
                    batch.update(d.ref, { is_read: true })
                    needsBatchCommit = true
                }
            })

            setMessages(msgs)
            scrollToBottom()

            if (needsBatchCommit) {
                await batch.commit()
            }
        })

        unsubMessagesRef.current = unsub
    }, [currentUserId, scrollToBottom])

    // ── Initial data fetch ──
    useEffect(() => {
        fetchContacts()
    }, [fetchContacts])

    useEffect(() => {
        if (contacts.length > 0) fetchConversations()
    }, [contacts, fetchConversations])

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            unsubMessagesRef.current?.()
        }
    }, [])

    // ── Find or create conversation ──
    const openChat = async (contact: ChatUser, prefillMessage?: string) => {
        const p1 = currentUserId < contact.id ? currentUserId : contact.id
        const p2 = currentUserId < contact.id ? contact.id : currentUserId

        // Try to find existing
        const existingQ = query(
            collection(db, "chat_conversations"),
            where("participant_1", "==", p1),
            where("participant_2", "==", p2),
            limit(1)
        )
        const existingSnap = await getDocs(existingQ)

        let convo: any
        if (!existingSnap.empty) {
            const d = existingSnap.docs[0]
            convo = { id: d.id, ...d.data() }
        } else {
            const now = new Date().toISOString()
            const newDoc = await addDoc(collection(db, "chat_conversations"), {
                participant_1: p1,
                participant_2: p2,
                created_at: now,
                updated_at: now,
            })
            convo = { id: newDoc.id, participant_1: p1, participant_2: p2, created_at: now, updated_at: now }
        }

        if (convo) {
            setActiveConversation({
                ...convo,
                other_user: contact,
            })
            setView("chat")
            subscribeToMessages(convo.id)
            if (prefillMessage) {
                setNewMessage(prefillMessage)
            }
        }
    }

    // ── Send message ──
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || sending) return
        setSending(true)

        const now = new Date().toISOString()
        const msg = {
            conversation_id: activeConversation.id,
            sender_id: currentUserId,
            content: newMessage.trim(),
            is_read: false,
            created_at: now,
        }

        await addDoc(collection(db, "chat_messages"), msg)

        // Update conversation timestamp
        await updateDoc(doc(db, "chat_conversations", activeConversation.id), {
            updated_at: now,
        })

        setNewMessage("")
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
    const filteredContacts = contacts.filter((c) => {
        const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.job_title || "").toLowerCase().includes(searchQuery.toLowerCase())

        let matchesRole = true
        if (isCandidateMode) {
            matchesRole = false
        } else if (isHrMode) {
            matchesRole = c.role === "employee" || c.role === "candidate"
        } else {
            matchesRole = c.role === "hr_admin"
        }

        return matchesSearch && matchesRole
    })

    // ── Handle popup click ──
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
                            {!isCandidateMode && (
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
                            )}

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
                                {!isCandidateMode && ROLE_ORDER.map((role) => {
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
                                {!isCandidateMode && filteredContacts.length === 0 && (
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
                                    onClick={() => { setView("contacts"); fetchConversations(); unsubMessagesRef.current?.() }}
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
                                    onClick={() => { setView("closed"); unsubMessagesRef.current?.() }}
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
