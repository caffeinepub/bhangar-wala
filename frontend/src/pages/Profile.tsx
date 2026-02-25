import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { User, MapPin, LogOut, ChevronRight, Bell, Moon, Edit2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleEditOpen = () => {
    setEditName(profile?.name || '');
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!profile) return;
    await saveProfile.mutateAsync({
      ...profile,
      name: editName.trim(),
    });
    setEditOpen(false);
  };

  const handleLogout = () => {
    // Clear localStorage auth session and all cached query data
    localStorage.removeItem('auth_session');
    sessionStorage.removeItem('otp_phone');
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-10"
        style={{ background: 'linear-gradient(135deg, oklch(0.527 0.154 150) 0%, oklch(0.42 0.14 150) 100%)' }}
      >
        <h1 className="font-heading text-xl font-bold text-white mb-4">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-white text-xl">{initials}</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
            ) : (
              <>
                <p className="font-heading font-bold text-white text-lg">{profile?.name || 'User'}</p>
                <p className="text-white/70 text-sm">{profile?.phone || ''}</p>
              </>
            )}
          </div>
          <button
            onClick={handleEditOpen}
            className="p-2 rounded-full bg-white/20 text-white min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-6">
        {/* Admin Panel Quick Access */}
        <div
          className="rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-sm cursor-pointer"
          style={{ background: 'linear-gradient(135deg, oklch(0.25 0.10 150) 0%, oklch(0.20 0.08 200) 100%)' }}
          onClick={() => navigate({ to: '/admin' })}
        >
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-white text-sm">Admin Panel</p>
              <p className="text-white/60 text-xs">Manage bookings, partners, rates & more</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/50 shrink-0" />
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account</p>
          </div>
          <button
            onClick={() => navigate({ to: '/addresses' })}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Manage Addresses</p>
              <p className="text-xs text-muted-foreground">Add or edit pickup locations</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleEditOpen}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Edit Profile</p>
              <p className="text-xs text-muted-foreground">Update your name and photo</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Settings Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Settings</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Bell className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Booking updates & alerts</p>
            </div>
            <Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} />
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full min-h-[52px] rounded-xl border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        {/* Footer */}
        <div className="pt-2 pb-2 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bhangar Wala. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'bhangar-wala')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="min-h-[48px]"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editName.trim() || saveProfile.isPending}
                className="flex-1 rounded-xl"
                style={{ background: 'oklch(0.527 0.154 150)' }}
              >
                {saveProfile.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
