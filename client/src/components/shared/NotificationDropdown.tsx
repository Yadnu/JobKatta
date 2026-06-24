'use client';

import { useRouter } from 'next/navigation';
import { Bell, BriefcaseIcon, CheckCheck, User2, Unlock, ThumbsDown, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useMarkAllRead, useMarkRead } from '@/hooks/useNotifications';
import type { Notification } from '@/types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  APPLICATION_RECEIVED: <BriefcaseIcon className="h-4 w-4 text-blue-500" />,
  STATUS_CHANGED: <User2 className="h-4 w-4 text-amber-500" />,
  JOB_APPROVED: <ThumbsUp className="h-4 w-4 text-green-500" />,
  JOB_REJECTED: <ThumbsDown className="h-4 w-4 text-red-500" />,
  CONTACT_UNLOCKED: <Unlock className="h-4 w-4 text-purple-500" />,
};

function NotificationRow({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const router = useRouter();

  const handleClick = () => {
    if (!notif.isRead) onRead(notif.id);
    if (notif.link) router.push(notif.link);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
    >
      <span className="mt-0.5 shrink-0">{TYPE_ICONS[notif.type] ?? <Bell className="h-4 w-4 text-slate-400" />}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
          {notif.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notif.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
    </button>
  );
}

export default function NotificationDropdown() {
  const { data } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-blue-600 hover:text-blue-700 px-2"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notif={n} onRead={(id) => markRead.mutate(id)} />
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
