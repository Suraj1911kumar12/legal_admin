'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  useConversationsList,
  useConversationMessages,
  useSendMessage,
  useMarkConversationRead
} from '@/hooks/useLawyerMessages';
import {
  MessageSquare,
  Send,
  User,
  Paperclip,
  Clock,
  Briefcase,
  Search,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function MessagesPage() {
  const { data: conversations, isLoading: loadingConvs } = useConversationsList();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: loadingMsgs } = useConversationMessages(selectedConvId || '');
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0]._id);
    }
  }, [conversations, selectedConvId]);

  // Mark read when conversation opens
  useEffect(() => {
    if (selectedConvId) {
      markRead.mutate(selectedConvId);
    }
  }, [selectedConvId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations?.find((c) => c._id === selectedConvId);

  const filteredConversations = (conversations || []).filter((conv) => {
    const term = searchQuery.toLowerCase();
    return (
      conv.customer?.name?.toLowerCase().includes(term) ||
      conv.lastMessage?.toLowerCase().includes(term) ||
      conv.matterId?.matterReference?.toLowerCase().includes(term)
    );
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvId) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConvId,
        content
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <LawyerShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Direct Client Communications</h1>
          <p className="text-sm text-slate-500">
            Secure, encrypted messaging with clients regarding authorized legal matters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
          {/* Left: Conversations List */}
          <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client or matter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConvs ? (
                <div className="p-8 text-center text-sm text-slate-400">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv._id === selectedConvId;
                  const hasUnread = (conv.unreadCountLawyer || 0) > 0;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConvId(conv._id)}
                      className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                        isSelected ? 'bg-gold-50/40 border-l-4 border-gold-500' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {conv.customer?.name ? conv.customer.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.customer?.name || 'Customer'}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}
                          </span>
                        </div>
                        {conv.matterId && (
                          <div className="flex items-center gap-1 text-[10px] text-navy-600 font-medium mb-1">
                            <Briefcase className="w-2.5 h-2.5" />
                            <span className="truncate">{conv.matterId.matterReference}</span>
                          </div>
                        )}
                        <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-gold-600 mt-1 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Center: Message Thread */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {activeConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-sm">
                      {activeConversation.customer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {activeConversation.customer?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeConversation.customer?.email}
                      </p>
                    </div>
                  </div>

                  {activeConversation.matterId && (
                    <Link
                      href={`/matters/${activeConversation.matterId._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-50 text-navy-900 text-xs font-semibold hover:bg-navy-100 transition-colors border border-navy-200/60"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-gold-600" />
                      <span>{activeConversation.matterId.matterReference}</span>
                    </Link>
                  )}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                  {loadingMsgs ? (
                    <div className="p-8 text-center text-sm text-slate-400">Loading messages...</div>
                  ) : !messages || messages.length === 0 ? (
                    <div className="p-12 text-center text-sm text-slate-400">
                      <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      No conversation history yet. Send a message to initiate communication.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderType === 'lawyer';

                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl p-3.5 text-xs shadow-sm ${
                              isMe
                                ? 'bg-navy-900 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1 pt-2 border-t border-slate-700/30">
                                {msg.attachments.map((att, i) => (
                                  <a
                                    key={i}
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-1.5 text-[11px] underline ${
                                      isMe ? 'text-gold-300' : 'text-navy-600'
                                    }`}
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{att.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                            <span>{formatDate(msg.createdAt)}</span>
                            {isMe && <CheckCircle2 className="w-3 h-3 text-gold-500" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Bar */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your legal advisory message..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-slate-900"
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMessage.isPending}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-sm font-medium">Select a client conversation to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LawyerShell>
  );
}

