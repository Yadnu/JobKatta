'use client';

import { useState } from 'react';
import { MessageCircle, Send, ChevronLeft } from 'lucide-react';
import {
  useAdminTickets,
  useReplyTicket,
  useUpdateTicketStatus,
  type SupportTicket,
} from '@/hooks/useAdmin';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDate, timeAgo } from '@/lib/utils';

const statusColors: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
};

function TicketDetailPanel({
  ticket,
  onBack,
}: {
  ticket: SupportTicket;
  onBack: () => void;
}) {
  const [reply, setReply] = useState('');
  const replyMutation = useReplyTicket();
  const updateStatus = useUpdateTicketStatus();

  function handleSendReply() {
    if (!reply.trim()) return;
    replyMutation.mutate(
      { id: ticket.id, reply: reply.trim() },
      { onSuccess: () => setReply('') }
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-800 truncate">{ticket.subject}</h2>
          <p className="text-xs text-slate-500">
            {ticket.user.email} · {ticket.user.role} · {timeAgo(ticket.createdAt)}
          </p>
        </div>
        <Select
          value={ticket.status}
          onValueChange={(status) => updateStatus.mutate({ id: ticket.id, status })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Thread */}
      <div className="p-5 space-y-4">
        {/* User message */}
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-600 mb-1">{ticket.user.email}</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.message}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">{formatDate(ticket.createdAt)}</p>
          </div>
        </div>

        {/* Admin reply */}
        {ticket.adminReply && (
          <div className="flex gap-3 flex-row-reverse">
            <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs font-semibold text-slate-600 mb-1">Admin</p>
              <div className="rounded-lg bg-violet-50 border border-violet-200 px-4 py-3 text-left">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.adminReply}</p>
              </div>
              <p className="text-xs text-slate-400 mt-1">{formatDate(ticket.updatedAt)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reply form */}
      {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
        <div className="px-5 pb-5 space-y-3">
          <Textarea
            placeholder="Write a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
          />
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={!reply.trim() || replyMutation.isPending}
            onClick={handleSendReply}
          >
            <Send className="h-4 w-4 mr-2" />
            {replyMutation.isPending ? 'Sending…' : 'Send Reply'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminSupportPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const { data, isLoading } = useAdminTickets(page);
  const tickets: SupportTicket[] = (data?.data ?? []) as SupportTicket[];
  const pagination = data?.pagination;

  if (selected) {
    return (
      <div className="space-y-6">
        <PageHeader title="Support Tickets" subtitle="Manage user support requests." />
        <TicketDetailPanel ticket={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" subtitle="Manage user support requests." />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No support tickets"
            description="No tickets have been submitted yet."
          />
        ) : (
          <>
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 last:border-0 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {ticket.user.email} · {ticket.user.role}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      'inline-block text-xs font-medium px-2 py-0.5 rounded-full border',
                      statusColors[ticket.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'
                    )}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{timeAgo(ticket.createdAt)}</span>
                  {ticket.adminReply && (
                    <span className="text-xs text-violet-500 font-medium">Replied</span>
                  )}
                </div>
              </button>
            ))}
            {pagination && pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
