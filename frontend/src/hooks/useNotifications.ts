import { useGetNotifications } from './useQueries';

export function useNotifications() {
  const { data: notifications = [], isLoading, refetch } = useGetNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch,
  };
}
