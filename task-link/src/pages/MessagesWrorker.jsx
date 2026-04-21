import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../layouts/DashboardLayout';
import { Input } from '../components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/components/lib/utils';
// ✅
import {
  addMessage,
  setActiveConversation,
  setConversations,
  markConversationRead,
  setTypingStatus,
  updateMessageStatus,
} from '@/features/messages/messagesSlice';

const DEMO_CONVERSATIONS = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '',
    lastMessage: 'I can start the cleaning tomorrow at 9 AM',
    time: '2 min',
    unread: 3,
    online: true,
    role: 'Cleaner',
    typing: false,
    messages: [
      { id: '1', text: 'Hi! I saw your task for home cleaning. I\'m interested!', sender: 'other', time: '10:30 AM', status: 'read' },
      { id: '2', text: 'Great! Can you tell me about your experience?', sender: 'me', time: '10:32 AM', status: 'read' },
      { id: '3', text: 'I have 5 years of professional cleaning experience. I bring my own supplies and equipment.', sender: 'other', time: '10:34 AM', status: 'read' },
      { id: '4', text: 'That sounds perfect. When can you start?', sender: 'me', time: '10:35 AM', status: 'read' },
      { id: '5', text: 'I can start the cleaning tomorrow at 9 AM', sender: 'other', time: '10:36 AM', status: 'read' },
    ],
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: '',
    lastMessage: 'The repair estimate is $150 for the plumbing fix',
    time: '1 hr',
    unread: 1,
    online: true,
    role: 'Plumber',
    typing: true,
    messages: [
      { id: '1', text: 'Hello, I\'d like to fix your plumbing issue.', sender: 'other', time: '9:00 AM', status: 'read' },
      { id: '2', text: 'What\'s the estimated cost?', sender: 'me', time: '9:05 AM', status: 'read' },
      { id: '3', text: 'The repair estimate is $150 for the plumbing fix', sender: 'other', time: '9:10 AM', status: 'read' },
    ],
  },
  {
    id: '3',
    name: 'Emily Park',
    avatar: '',
    lastMessage: 'Thanks for choosing me! I\'ll be there on Friday.',
    time: '3 hr',
    unread: 0,
    online: false,
    role: 'Interior Designer',
    typing: false,
    messages: [
      { id: '1', text: 'Hi! I\'d love to help with your interior design project.', sender: 'other', time: 'Yesterday', status: 'read' },
      { id: '2', text: 'Can you share your portfolio?', sender: 'me', time: 'Yesterday', status: 'read' },
      { id: '3', text: 'Of course! Here\'s a link to my recent work: portfolio.design/emily', sender: 'other', time: 'Yesterday', status: 'read' },
      { id: '4', text: 'Impressive work! You\'re hired.', sender: 'me', time: 'Yesterday', status: 'read' },
      { id: '5', text: 'Thanks for choosing me! I\'ll be there on Friday.', sender: 'other', time: 'Yesterday', status: 'read' },
    ],
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: '',
    lastMessage: 'I\'ve fixed the network issue. Everything is working now.',
    time: '1 day',
    unread: 0,
    online: false,
    role: 'IT Specialist',
    typing: false,
    messages: [
      { id: '1', text: 'I can help with your network setup.', sender: 'other', time: 'Mon', status: 'read' },
      { id: '2', text: 'I\'ve fixed the network issue. Everything is working now.', sender: 'other', time: 'Mon', status: 'read' },
    ],
  },
  {
    id: '5',
    name: 'Lisa Nguyen',
    avatar: '',
    lastMessage: 'The moving truck is booked for Saturday morning.',
    time: '2 days',
    unread: 0,
    online: false,
    role: 'Mover',
    typing: false,
    messages: [
      { id: '1', text: 'I can help with your move this weekend!', sender: 'other', time: 'Sun', status: 'read' },
      { id: '2', text: 'How many helpers will you bring?', sender: 'me', time: 'Sun', status: 'read' },
      { id: '3', text: 'I\'ll bring 2 helpers and a large truck.', sender: 'other', time: 'Sun', status: 'read' },
      { id: '4', text: 'The moving truck is booked for Saturday morning.', sender: 'other', time: 'Sun', status: 'read' },
    ],
  },
];

const MessagesWorker = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversation } = useSelector((state) => state.messages);
 const userType = useSelector((state) => state.auth?.userType);
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Load demo data on mount
  useEffect(() => {
    dispatch(setConversations(DEMO_CONVERSATIONS));
    dispatch(setActiveConversation(DEMO_CONVERSATIONS[0]));
  }, [dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const newMsg = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    dispatch(addMessage({
      conversationId: activeConversation.id,
      message: newMsg,
    }));

    setNewMessage('');

    // Simulate message delivery and read status
    setTimeout(() => {
      dispatch(updateMessageStatus({
        conversationId: activeConversation.id,
        messageId: newMsg.id,
        status: 'delivered',
      }));
    }, 1000);

    setTimeout(() => {
      dispatch(updateMessageStatus({
        conversationId: activeConversation.id,
        messageId: newMsg.id,
        status: 'read',
      }));
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectConversation = (conv) => {
    dispatch(setActiveConversation(conv));
    dispatch(markConversationRead(conv.id));
    setShowMobileChat(true);
  };

  const StatusIcon = ({ status }) => {
    if (status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-primary" />;
    if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
    return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  if (!conversations.length || !activeConversation) {
    return (
      <DashboardLayout userType={userType}>
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="h-[calc(100vh-7rem)] flex rounded-2xl border border-border bg-card overflow-hidden">
        {/* Conversation List */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-96 border-r border-border flex flex-col shrink-0',
            showMobileChat && 'hidden md:flex'
          )}
        >
          {/* List Header */}
          <div className="p-4 border-b border-border space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 bg-muted/50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation Items */}
          <ScrollArea className="flex-1">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left',
                  activeConversation.id === conv.id && 'bg-primary/5 border-l-2 border-l-primary'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-semibold">
                      {conv.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm text-foreground truncate">{conv.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground truncate pr-2">
                      {conv.typing ? (
                        <span className="text-primary italic">typing...</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                    {conv.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] justify-center rounded-full shrink-0">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0',
            !showMobileChat && 'hidden md:flex'
          )}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <button
              onClick={() => setShowMobileChat(false)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConversation.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-semibold">
                  {activeConversation.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {activeConversation.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">{activeConversation.name}</h3>
              <p className="text-xs text-muted-foreground">
                {activeConversation.typing ? (
                  <span className="text-primary">typing...</span>
                ) : activeConversation.online ? (
                  'Online'
                ) : (
                  `Last seen ${activeConversation.time} ago`
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {activeConversation.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    )}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1',
                        msg.sender === 'me' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <span
                        className={cn(
                          'text-[10px]',
                          msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {msg.time}
                      </span>
                      {msg.sender === 'me' && <StatusIcon status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {activeConversation.typing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                className="flex-1 bg-muted/50 border-0"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                onClick={handleSend}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MessagesWorker;