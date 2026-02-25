import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  useGetAllSupportTickets,
  useUpdateSupportTicketStatus,
} from '../hooks/useQueries';
import type { SupportTicket, TicketStatus } from '../hooks/useQueries';

const STATUS_FILTERS: Array<'All' | TicketStatus> = ['All', 'open', 'resolved'];

export default function AdminSupportTickets() {
  const navigate = useNavigate();
  const { data: tickets = [], isLoading } = useGetAllSupportTickets();
  const updateStatus = useUpdateSupportTicketStatus();
  const [filter, setFilter] = useState<'All' | TicketStatus>('All');

  const filtered = filter === 'All' ? tickets : tickets.filter((t) => t.status === filter);

  async function handleToggle(ticket: SupportTicket) {
    const newStatus: TicketStatus = ticket.status === 'open' ? 'resolved' : 'open';
    await updateStatus.mutateAsync({ id: ticket.id, status: newStatus });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Support Tickets</h1>
        </div>
      </header>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 border-b border-border overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tickets found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ticket.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                      {ticket.status === 'open' ? 'Open' : 'Resolved'}
                    </Badge>
                    <Switch
                      checked={ticket.status === 'resolved'}
                      onCheckedChange={() => handleToggle(ticket)}
                      disabled={updateStatus.isPending}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
