'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageCircle, Plus, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import { useMyTickets, useCreateTicket, useTicket } from '@/hooks/useSupport';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { SupportTicket, TicketStatus } from '@/types';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Please describe your issue in at least 20 characters'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  OPEN: {
    label: 'Open',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: XCircle,
  },
};

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  const Icon = config.icon;
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs flex items-center gap-1 border', config.className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <MessageCircle className="h-8 w-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">No support tickets yet</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-4">
        Having an issue? Open a ticket and our support team will get back to you.
      </p>
      <Button size="sm" onClick={onNew} className="gap-2">
        <Plus className="h-4 w-4" />
        Open a Ticket
      </Button>
    </div>
  );
}

function TicketDetailDialog({
  ticketId,
  open,
  onClose,
}: {
  ticketId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: ticket, isLoading } = useTicket(ticketId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <MessageCircle className="h-5 w-5 text-primary-500 shrink-0" />
            <span className="truncate">{ticket?.subject ?? 'Support Ticket'}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : ticket ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <TicketStatusBadge status={ticket.status} />
              <span className="text-xs text-slate-400">
                Opened {formatDate(ticket.createdAt)}
              </span>
            </div>

            {/* User message */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">Your message</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.message}</p>
            </div>

            {/* Admin reply */}
            {ticket.adminReply ? (
              <div className="rounded-lg bg-primary-50 border border-primary-100 p-4">
                <p className="text-xs font-semibold text-primary-600 mb-2">Support reply</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.adminReply}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
                <p className="text-xs text-slate-400">
                  No reply yet — our team will respond shortly.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center">Ticket not found.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TicketCard({
  ticket,
  onClick,
}: {
  ticket: SupportTicket;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm hover:border-slate-300 transition-all group"
    >
      <div className="mt-0.5 h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <MessageCircle className="h-4 w-4 text-primary-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{ticket.subject}</p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ticket.message}</p>
        <div className="flex items-center gap-3 mt-2">
          <TicketStatusBadge status={ticket.status} />
          <span className="text-xs text-slate-400">{formatDate(ticket.createdAt)}</span>
          {ticket.adminReply && (
            <span className="text-xs text-emerald-600 font-medium">Reply received</span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-2.5 shrink-0" />
    </button>
  );
}

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data, isLoading } = useMyTickets(page);
  const createTicket = useCreateTicket();

  const tickets: SupportTicket[] = data?.data ?? [];
  const pagination = data?.pagination;

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', message: '' },
  });

  function openNew() {
    form.reset({ subject: '', message: '' });
    setNewDialogOpen(true);
  }

  function onSubmit(values: TicketFormValues) {
    createTicket.mutate(values, {
      onSuccess: () => setNewDialogOpen(false),
    });
  }

  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Support"
        subtitle={
          tickets.length > 0
            ? `${openCount} open ticket${openCount !== 1 ? 's' : ''} · ${tickets.length} total`
            : 'Get help from our support team'
        }
        action={
          <Button onClick={openNew} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState onNew={openNew} />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => setSelectedTicketId(ticket.id)}
            />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <Pagination
          page={page}
          pages={pagination.pages}
          onPageChange={setPage}
          className="mt-4"
        />
      )}

      {/* New Ticket Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary-500" />
              Open a Support Ticket
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Cannot upload my resume"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your issue in detail…"
                        rows={5}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewDialogOpen(false)}
                  disabled={createTicket.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTicket.isPending}>
                  {createTicket.isPending ? 'Submitting…' : 'Submit Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      {selectedTicketId && (
        <TicketDetailDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </div>
  );
}
