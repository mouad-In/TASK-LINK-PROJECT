import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Input } from '../components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/Badge';
import { Search, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/components/lib/utils';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setActiveConversation,
  markConversationRead,
} from '@/features/messages/messagesSlice';

const Messages = ({ userType = 'client' }) => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { id: urlConvId } = useParams();

  const currentUser     = useSelector((state) => state.auth.user);
  const { conversations, activeConversation, messages, isLoading, isSending } =
    useSelector((state) => state.messages);

  const [newMessage, setNewMessage]   = useState('');
  const [search,     setSearch]       = useState('');
  const messagesEndRef = useRef(null);

  // 1. جلب المحادثات عند التحميل
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchConversations(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  // 2. إذا في ID في الـ URL → افتح تلك المحادثة مباشرة
  useEffect(() => {
    if (urlConvId && conversations.length > 0) {
      const conv = conversations.find((c) => String(c.id) === String(urlConvId));
      if (conv) {
        dispatch(setActiveConversation(conv));
        dispatch(fetchMessages(conv.id));
        dispatch(markConversationRead(conv.id));
      }
    }
  }, [urlConvId, conversations, dispatch]);

  // 3. scroll لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    dispatch(setActiveConversation(conv));
    dispatch(fetchMessages(conv.id));
    dispatch(markConversationRead(conv.id));
    navigate(`/${userType}/messages/${conv.id}`);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    const content = newMessage.trim();
    setNewMessage('');
    await dispatch(sendMessage({ conversationId: activeConversation.id, content }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.participantName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-border bg-card shadow-sm">

        {/* ── Sidebar ── */}
        <div className={cn(
          'w-full md:w-80 flex-shrink-0 border-r border-border flex flex-col',
          activeConversation && 'hidden md:flex'
        )}>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 bg-muted/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading && !conversations.length ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No conversations yet</div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50',
                    activeConversation?.id === conv.id && 'bg-primary/5 border-l-2 border-l-primary'
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={conv.participantAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm">
                        {getInitials(conv.participantName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-sm text-foreground truncate">{conv.participantName}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{formatTime(conv.last_message_time)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message ?? 'No messages yet'}</p>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center ml-2">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* ── Chat Area ── */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
              <button
                onClick={() => dispatch(setActiveConversation(null))}
                className="md:hidden p-1 rounded-lg hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar className="w-9 h-9">
                <AvatarImage src={activeConversation.participantAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs">
                  {getInitials(activeConversation.participantName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{activeConversation.participantName}</h3>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No messages yet. Say hello! 👋
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isMe = String(msg.senderId ?? msg.sender_id) === String(currentUser?.id);
                    return (
                      <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        )}>
                          <p>{msg.content}</p>
                          <p className={cn('text-xs mt-1', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {formatTime(msg.createdAt ?? msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-muted/50 border-border"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-primary text-primary-foreground"
                  size="icon"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="text-5xl">💬</div>
              <p className="font-medium text-foreground">Select a conversation</p>
              <p className="text-sm">Choose from your conversations on the left</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;