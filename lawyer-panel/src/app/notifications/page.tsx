'use client';

import React, { useState } from 'react';
import { LawyerShell } from '@/components/layout/LawyerShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  useNotificationsList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '@/hooks/useLawyerNotifications';
import {
  Bell,
  CheckCircle2,
  FileQuestion,
  Briefcase,
  MessageSquare,
  Calendar,
  Info,
  Check
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { AppNotification } from '@/types/lawyer';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data: notifications, isLoading } = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const allItems = notifications || [];
  const filteredItems = filter === 'unread' ? allItems.filter((n) => !n.isRead) : allItems;
  const unreadCount = allItems.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'query':
        return <FileQuestion className="w-4 h-4 text-amber-600" />;
      case 'matter':
        return <Briefcase className="w-4 h-4 text-navy-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'consultation':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <LawyerShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications & Alerts</h1>
            <p className="text-sm text-slate-500">
              Stay informed of new query assignments, client updates, and consultation requests.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              isLoading={markAllRead.isPending}
              className="text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Mark All as Read ({unreadCount})
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Notifications ({allItems.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'unread'
                ? 'bg-navy-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>

        {/* Notifications list */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading notifications...</div>
        ) : filteredItems.length === 0 ? (
          <Card className="text-center py-16">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'unread' ? 'You have read all your alerts.' : 'No notifications in your inbox.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Card
                key={item._id}
                className={`transition-colors ${
                  item.isRead ? 'bg-white' : 'bg-gold-50/20 border-gold-200'
                }`}
              >
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-gold-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.link && (
                          <Link
                            href={item.link}
                            className="text-navy-700 hover:text-navy-900 font-semibold underline"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(item._id)}
                      className="text-xs text-slate-500 hover:text-navy-900 flex-shrink-0"
                    >
                      Mark Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LawyerShell>
  );
}

