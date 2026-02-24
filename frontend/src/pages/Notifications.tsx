import { Bell, BellOff, Trash2, CheckCheck, Package, Star, IndianRupee, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetNotifications, useMarkAllNotificationsRead, useClearAllNotifications } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP: Record<string, React.ReactNode> = {
  '📦': <Package className="w-5 h-5" />,
  '⭐': <Star className="w-5 h-5" />,
  '💰': <IndianRupee className="w-5 h-5" />,
  '🚛': <Truck className="w-5 h-5" />,
};

function getIconBg(icon: string): string {
  if (icon === '💰') return 'bg-green-100 text-green-600';
  if (icon === '⭐') return 'bg-yellow-100 text-yellow-600';
  if (icon === '🚛') return 'bg-blue-100 text-blue-600';
  return 'bg-primary-light text-primary';
}

export default function Notifications() {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    await clearAll.mutateAsync();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-white">Notifications</h1>
            <p className="text-white/80 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 text-white text-xs font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearAll.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 text-white text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <BellOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="font-heading font-semibold text-foreground">No notifications yet</p>
            <p className="text-muted-foreground text-sm text-center">
              You'll receive updates about your bookings here.
            </p>
          </div>
        ) : (
          [...notifications]
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map(notif => {
              const ts = new Date(Number(notif.timestamp) / 1_000_000);
              const iconBg = getIconBg(notif.icon);
              return (
                <div
                  key={notif.id.toString()}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    notif.isRead
                      ? 'bg-card border-border'
                      : 'bg-primary-light border-primary/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    {ICON_MAP[notif.icon] || <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notif.isRead ? 'text-foreground' : 'text-primary'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isNaN(ts.getTime()) ? '' : formatDistanceToNow(ts, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
