import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Edit2, Repeat, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function ChatPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, message }
    const [editingMessage, setEditingMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const location = useLocation();

    // 1. Initialize User
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("userRole");
        setCurrentUser({ email, role });
    }, []);

    // 2. Fetch Chats on Load
    useEffect(() => {
        if (!currentUser?.email) return;

        const fetchChats = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-chats?email=${currentUser.email}`);
                const data = await res.json();
                if (res.ok) {
                    // Enrich chats with "Other Person" name (could be fetched or just inferred)
                    // For now, we just rely on email if name not available, or fetch full details.
                    // Ideally /get-chats should return enriched data.
                    // We'll simplisticly assume participants[0] or [1] is the other person.
                    // Backend now returns enriched data with 'otherName' and 'otherProfilePic'
                    const enrichedChats = data.chats.map(chat => {
                        const otherEmail = chat.participants.find(p => p !== currentUser.email);
                        return {
                            ...chat,
                            name: chat.otherName || otherEmail,
                            otherEmail: otherEmail,
                            profilePic: chat.otherProfilePic
                        };
                    });
                    setChats(enrichedChats);
                }
            } catch (error) {
                console.error("Error fetching chats", error);
            }
        };

        fetchChats();

        // Polling for new chats every 10s (simple real-time)
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);

    }, [currentUser]);

    // 3. Handle Navigation from "Find Doctors" (Start New Chat)
    useEffect(() => {
        if (!currentUser?.email || !location.state?.startChatWith) return;

        const doctor = location.state.startChatWith;
        const otherEmail = doctor.email;

        // Auto-fill booking message if intent exists
        if (location.state.bookingIntent) {
            setNewMessage(`Hi Dr. ${doctor.name}, I would like to book an appointment.`);
        }

        // Check availability in existing chats
        const existingChat = chats.find(c => c.participants.includes(otherEmail));

        if (existingChat) {
            setSelectedChat(existingChat);
        } else {
            // Setup temporary "Pending" chat state
            // It gets created for real only when first message sent
            setSelectedChat({
                id: 'new',
                name: doctor.name,
                otherEmail: otherEmail,
                participants: [currentUser.email, otherEmail],
                messages: []
            });
        }

    }, [currentUser, chats, location.state]);

    // 4. Fetch Messages when Chat Selected
    useEffect(() => {
        if (!selectedChat || selectedChat.id === 'new') {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-messages/${selectedChat.id}`);
                const data = await res.json();
                if (res.ok) {
                    // Only update if new messages arrived (check length for simplicity)
                    setMessages(prev => {
                        if (prev.length !== data.messages.length) {
                            return data.messages;
                        }
                        // Check last ID to be safe if length same (e.g. edit/delete - rare here)
                        if (prev.length > 0 && data.messages.length > 0) {
                            if (prev[prev.length - 1].id !== data.messages[data.messages.length - 1].id) {
                                return data.messages;
                            }
                        }
                        return prev; // No change, prevents effect trigger
                    });
                }
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        fetchMessages();
        // Poll for new messages every 3s
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);

    }, [selectedChat]);

    // Scroll to bottom only when messages increase (new message arrived)
    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            if (editingMessage) {
                // Handle Edit
                const res = await fetch(`${import.meta.env.VITE_API_BASE}/edit-message`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chatId: selectedChat.id,
                        messageId: editingMessage.id,
                        newText: newMessage
                    })
                });

                if (res.ok) {
                    // Update local state
                    setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: newMessage, isEdited: true } : m));
                    setEditingMessage(null);
                    setNewMessage("");
                }
            } else {
                // Handle New Message
                const payload = {
                    sender: currentUser.email,
                    recipient: selectedChat.otherEmail,
                    text: newMessage,
                    chatId: selectedChat.id === 'new' ? null : selectedChat.id
                };

                const res = await fetch(`${import.meta.env.VITE_API_BASE}/send-message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok) {
                    // If it was a new chat, update the ID so subsequent messages use it
                    if (selectedChat.id === 'new' && data.chatId) {
                        setSelectedChat(prev => ({ ...prev, id: data.chatId }));
                        // Also trigger a refresh of chat list
                    }

                    // Optimistic Update
                    const newMsg = {
                        id: Date.now(),
                        text: newMessage,
                        sender: currentUser.email,
                        timestamp: new Date().toISOString()
                    };
                    setMessages([...messages, newMsg]);
                    setNewMessage("");
                }
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 pt-5">
            {/* Sidebar - Chat List */}
            <div className="w-1/3 md:w-1/4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-cyan-500" /> Messages
                    </h2>
                </div>
                <div className="overflow-y-auto flex-1">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 ${selectedChat?.id === chat.id ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                    {chat.profilePic ? (
                                        <img src={chat.profilePic} alt={chat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white truncate max-w-[150px]">{chat.name}</h3>
                                    <p className="text-sm text-slate-500 truncate max-w-[150px]">{chat.lastMessage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-sm">No conversations yet.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900/50">
                {selectedChat ? (
                    <>
                        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 font-bold overflow-hidden">
                                {selectedChat.profilePic ? (
                                    <img src={selectedChat.profilePic} alt={selectedChat.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedChat.name?.charAt(0).toUpperCase() || "U"
                                )}
                            </div>
                            <span className="font-bold text-lg text-slate-800 dark:text-white">{selectedChat.name}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Dummy Welcome Message */}
                            <div className="flex justify-center my-4">
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                                    Conversation started
                                </span>
                            </div>

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === currentUser.email ? 'justify-end' : 'justify-start'}`}
                                    onContextMenu={(e) => {
                                        if (msg.sender === currentUser.email) {
                                            e.preventDefault();
                                            setContextMenu({ x: e.pageX, y: e.pageY, message: msg });
                                        }
                                    }}
                                >
                                    <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === currentUser.email ? 'bg-cyan-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'} relative group`}>
                                        <p>{msg.text} {msg.isEdited && <span className="text-[10px] opacity-70 italic">(edited)</span>}</p>
                                        <p className={`text-[10px] mt-1 ${msg.sender === currentUser.email ? 'text-cyan-100' : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Context Menu */}
                        {contextMenu && (
                            <div
                                className="fixed bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 z-50 min-w-[120px]"
                                style={{ top: contextMenu.y, left: contextMenu.x - 100 }} // adjust left to show next to click
                                onClick={() => setContextMenu(null)}
                            >
                                <button
                                    onClick={() => {
                                        setEditingMessage(contextMenu.message);
                                        setNewMessage(contextMenu.message.text);
                                        setContextMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setNewMessage(contextMenu.message.text);
                                        setContextMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    <Repeat size={14} /> Resend
                                </button>
                            </div>
                        )}

                        {/* Close Menu on global click */}
                        {contextMenu && <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)}></div>}

                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                            {editingMessage && (
                                <div className="flex justify-between items-center text-xs text-slate-500 mb-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                                    <span>Editing message...</span>
                                    <button onClick={() => { setEditingMessage(null); setNewMessage(""); }}><X size={14} /></button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-none focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800 dark:text-white"
                                />
                                <button type="submit" className="p-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={64} className="mb-4 opacity-50" />
                        <p className="text-xl font-semibold">Select a conversation</p>
                        <p className="text-sm">Choose a doctor or patient to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
