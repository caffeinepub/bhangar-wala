import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetUserAddresses, useDeleteAddress } from '../hooks/useQueries';

export default function Addresses() {
  const navigate = useNavigate();
  const { data: addresses = [], isLoading } = useGetUserAddresses();
  const deleteAddress = useDeleteAddress();

  async function handleDelete(id: bigint) {
    if (confirm('Delete this address?')) {
      await deleteAddress.mutateAsync(Number(id));
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/profile' })}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Saved Addresses</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Addresses Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first pickup address to get started.</p>
            <Button onClick={() => navigate({ to: '/add-address' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={Number(addr.id)}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {addr.addressLabel || 'Home'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {addr.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        navigate({
                          to: '/edit-address/$id',
                          params: { id: Number(addr.id).toString() },
                        })
                      }
                      className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deleteAddress.isPending}
                      className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      {deleteAddress.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => navigate({ to: '/add-address' })}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
