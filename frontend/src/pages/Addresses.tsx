import { useNavigate } from '@tanstack/react-router';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAddresses, useDeleteAddress } from '../hooks/useQueries';

const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-4 h-4" />,
  Work: <Briefcase className="w-4 h-4" />,
  Other: <MapPin className="w-4 h-4" />,
};

export default function Addresses() {
  const navigate = useNavigate();
  const { data: addresses = [], isLoading } = useGetAddresses();
  const deleteAddress = useDeleteAddress();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Delete this address?')) return;
    await deleteAddress.mutateAsync(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-6"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <button
          onClick={() => navigate({ to: '/profile' })}
          className="p-2 rounded-full bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center mb-3"
        >
          <MapPin className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-white">My Addresses</h1>
        <p className="text-white/80 text-sm mt-1">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-3">
        {isLoading ? (
          <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm text-center">No addresses saved yet.<br />Add your first pickup location.</p>
          </div>
        ) : (
          addresses.map(addr => (
            <div
              key={addr.id.toString()}
              className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 text-primary">
                {LABEL_ICONS[addr.addressLabel] || <MapPin className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{addr.addressLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{addr.street}</p>
                <p className="text-xs text-muted-foreground">{addr.city} - {addr.pincode}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate({ to: '/edit-address/$id', params: { id: addr.id.toString() } })}
                  className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  aria-label="Edit address"
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deleteAddress.isPending}
                  className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate({ to: '/add-address' })}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'oklch(0.527 0.154 150)' }}
        aria-label="Add new address"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
