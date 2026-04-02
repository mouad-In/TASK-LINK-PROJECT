import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { fetchConversations, fetchMessages, sendMessage, setCurrentConversation } from '../features/messages/messagesSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Messages = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, messages, activeConversation, isLoading } = useSelector((state) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchMessages(activeConversation.id));
    }
  }, [dispatch, activeConversation]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversation) {
      dispatch(sendMessage({
        conversationId: activeConversation.id,
        senderId: user.id,
        content: newMessage.trim()
      }));
      setNewMessage('');
    }
  };

  const handleSelectConversation = (conversation) => {
      dispatch(setCurrentConversation(conversation));  };

  const filteredConversations = conversations.filter(conv => 
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Conversations List */}
        <Card className="md:col-span-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Messages</h2>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {conversation.participantName.charAt(0)}
                        </span>
                      </div>
                      {conversation.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800 truncate">
                          {conversation.participantName}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <span className="ml-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col h-full overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {activeConversation.participantName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{activeConversation.participantName}</p>
                    <p className="text-sm text-gray-500">
                      {activeConversation.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        message.senderId === user.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user.id ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm">
                    <Paperclip size={20} />
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <ImageIcon size={20} />
                  </Button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit" variant="primary">
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Your Messages</h3>
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;

