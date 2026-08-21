import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Edit2, Repeat, X, Paperclip, FileText, File } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import localforage from 'localforage';
import { encryptPayload, decryptPayload } from '../utils/encryption';

function ChatPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, message }
    const [editingMessage, setEditingMessage] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [isAttachOpen, setIsAttachOpen] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null); // { name, data }
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const hasHandledNavigation = useRef(false);
    const location = useLocation();

    // 1. Initialize User
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("userRole");
        setCurrentUser({ email, role });

        if (email) {
            localforage.getItem(`medicalRecords_${email}`).then((records) => {
                if (records) setMedicalRecords(records);
            }).catch(e => console.error(e));
        }
    }, []);

    // 2. Fetch Chats on Load
    useEffect(() => {
        if (!currentUser?.email) return;

        const fetchChats = async () => {
            try {
                const res = await authFetch('/get-chats');
                const data = await res.json();
                if (res.ok) {
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
        const interval = setInterval(fetchChats, 8000);
        return () => clearInterval(interval);
    }, [currentUser]);

    // 4. Fetch Messages when Chat Selected
    useEffect(() => {
        if (!selectedChat || selectedChat.id === 'new') {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const res = await authFetch(`/get-messages/${selectedChat.id}`);
                const data = await res.json();
                if (res.ok) {
                    const decryptedMessages = data.messages.map(m => ({
                        ...m,
                        text: m.text ? decryptPayload(m.text, selectedChat.id) : "",
                        fileData: m.fileData ? decryptPayload(m.fileData, selectedChat.id) : null,
                        fileName: m.fileName ? decryptPayload(m.fileName, selectedChat.id) : null
                    }));

                    setMessages(prev => {
                        if (prev.length !== decryptedMessages.length) return decryptedMessages;
                        if (prev.length > 0 && decryptedMessages.length > 0) {
                            if (prev[prev.length - 1].id !== decryptedMessages[decryptedMessages.length - 1].id) {
                                return decryptedMessages;
                            }
                        }
                        return prev;
                    });
                }
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedChat]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachedFile) || !selectedChat) return;

        try {
            if (editingMessage) {
                // Encrypt message text before editing transmission to protect E2EE integrity
                const encryptedText = encryptPayload(newMessage, selectedChat.id);
                const res = await authFetch('/edit-message', {
                    method: "PUT",
                    body: JSON.stringify({
                        chatId: selectedChat.id,
                        messageId: editingMessage.id,
                        newText: encryptedText
                    })
                });

                if (res.ok) {
                    setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: newMessage, isEdited: true } : m));
                    setEditingMessage(null);
                    setNewMessage("");
                }
            } else {
                const payloadText = attachedFile && !newMessage ? "📄 Sent a document" : newMessage;
                const finalChatId = selectedChat.id === 'new' ? `${[currentUser.email, selectedChat.otherEmail].sort().join('_')}` : selectedChat.id;

                const payload = {
                    sender: currentUser.email,
                    recipient: selectedChat.otherEmail,
                    text: encryptPayload(payloadText, finalChatId),
                    fileData: attachedFile ? encryptPayload(attachedFile.data, finalChatId) : null,
                    fileName: attachedFile ? encryptPayload(attachedFile.name, finalChatId) : null,
                    chatId: selectedChat.id === 'new' ? null : selectedChat.id
                };

                const res = await authFetch('/send-message', {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    // If it was a new chat, update the ID so subsequent messages use it
                    if (selectedChat.id === 'new' && data.chatId) {
                        setSelectedChat(prev => ({ ...prev, id: data.chatId }));
                    }

                    // Optimistic Update
                    const newMsg = {
                        id: Date.now(),
                        text: payloadText,
                        fileData: attachedFile?.data || null,
                        fileName: attachedFile?.name || null,
                        sender: currentUser.email,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => {
                        const safeArray = Array.isArray(prev) ? prev : [];
                        return [...safeArray, newMsg];
                    });
                    setNewMessage("");
                    setAttachedFile(null);
                    setIsAttachOpen(false);
                } else {
                    const errData = await res.json();
                    alert(`Failed to send message: ${errData.message}`);
                }
            }
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Error: Network failure while sending message.");
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

                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
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
                                        
                                        {msg.fileData && (
                                            <div className="mt-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg flex items-center gap-2">
                                                <File size={16} />
                                                <a href={msg.fileData} download={msg.fileName} className="text-sm underline max-w-[150px] truncate block" target="_blank" rel="noopener noreferrer">
                                                    {msg.fileName || "View Document"}
                                                </a>
                                            </div>
                                        )}

                                        <p className={`text-[10px] mt-1 ${msg.sender === currentUser.email ? 'text-cyan-100' : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
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

                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 relative">
                            {editingMessage && (
                                <div className="flex justify-between items-center text-xs text-slate-500 mb-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                                    <span>Editing message...</span>
                                    <button onClick={() => { setEditingMessage(null); setNewMessage(""); }}><X size={14} /></button>
                                </div>
                            )}

                            {attachedFile && (
                                <div className="flex justify-between items-center text-xs text-cyan-700 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-300 mb-2 px-3 py-1.5 rounded-lg">
                                    <span className="flex items-center gap-2"><FileText size={14}/> Attached: {attachedFile.name}</span>
                                    <button onClick={() => setAttachedFile(null)}><X size={14} /></button>
                                </div>
                            )}
                            
                            {isAttachOpen && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 w-64 max-h-64 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-semibold text-sm">Select Document</span>
                                        <button onClick={() => setIsAttachOpen(false)}><X size={14} className="text-slate-400 hover:text-red-500"/></button>
                                    </div>
                                    {medicalRecords.length === 0 ? (
                                        <div className="text-xs text-slate-500 text-center py-4">No records found in Dashboard.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {medicalRecords.map((doc, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => { setAttachedFile({ name: doc.name, data: doc.data }); setIsAttachOpen(false); }}
                                                    className="w-full text-left text-sm p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                                >
                                                    <FileText size={14} className="text-cyan-500"/>
                                                    <span className="truncate">{doc.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <button type="button" onClick={() => setIsAttachOpen(!isAttachOpen)} className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <Paperclip size={20} />
                                </button>
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
