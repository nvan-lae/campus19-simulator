import { useRef, useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Camera, Trophy, Medal, Star, Gamepad2} from 'lucide-react';
// CSS imported via index.css

interface MatchPlayer {
  userId: number;
  username: string;
  avatarUrl: string | null;
  rank: number;
  isWinner: boolean;
  coins: number;
}

interface Match {
  id: string;
  endedAt: string;
  rank: number;
  isWinner: boolean;
  coins: number;
  players: MatchPlayer[];
}

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://localhost:3000';
  }, []);

  const [stats, setStats] = useState<UserStats>({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  });

  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!token) return;

    // Fetch Stats
    fetch(`${apiBase}/users/me/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err));

    // Fetch Matches
    fetch(`${apiBase}/users/me/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMatches(data);
        } else {
          console.error('Matches response is not an array:', data);
          setMatches([]);
        }
      })
      .catch((err) => console.error('Failed to fetch matches:', err));
  }, [apiBase, token]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setIsUploadingAvatar(true);
    setUploadError(null);

    try {
      const res = await fetch(`${apiBase}/users/avatar/delete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete avatar');
      }

      const updatedUser = await res.json();
      updateUser({ avatarUrl: updatedUser.avatarUrl });
      setUploadError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete avatar';
      setUploadError(errorMessage);
      console.error('Avatar delete error:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('Uploading avatar to:', `${apiBase}/users/avatar`);
      const res = await fetch(`${apiBase}/users/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await res.text();
      console.log('Upload response:', responseText);

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} - ${responseText}`);
      }

      const updatedUser = JSON.parse(responseText);

      if (!updatedUser || (typeof updatedUser.avatarUrl !== 'string' && updatedUser.avatarUrl !== null)) {
        throw new Error('Invalid response format from server');
      }

      updateUser({ avatarUrl: updatedUser.avatarUrl });
      setUploadError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      setUploadError(errorMessage);
      console.error('Avatar upload error:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!user || !token) {
    return null;
  }

  const userInitial = user.username?.charAt(0).toUpperCase() || '?';
  const defaultAvatarSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234f46e5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237c3aed;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23grad)'/%3E%3Ccircle cx='100' cy='60' r='30' fill='white'/%3E%3Cpath d='M 40 130 Q 40 100 100 100 Q 160 100 160 130 L 160 180 Q 160 200 100 200 Q 40 200 40 180 Z' fill='white'/%3E%3Ctext x='100' y='80' font-size='44' font-weight='bold' fill='%234f46e5' text-anchor='middle' dominant-baseline='middle'%3E${userInitial}%3C/text%3E%3C/svg%3E`;

  const getAvatarUrl = (url?: string) => {
    if (!url) return defaultAvatarSvg;
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `${apiBase}${url}`;
  };

  return (
    <div className="min-h-screen w-full bg-slate-900">
      <div className="container max-w-6xl mx-auto py-10 px-4 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Player Profile</h1>
            <p className="text-muted-foreground mt-1 text-gray-400">Manage your account settings and view your stats.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-500">Online</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* User Info Card */}
          <Card className="md:col-span-4 border-border bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700">
            <CardHeader>
              <CardTitle className='text-white'>Identity</CardTitle>
              <CardDescription className='text-gray-400'>Your personal game profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-4 text-white">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted shadow-sm transition-transform group-hover:scale-105">
                  <img
                    src={getAvatarUrl(user.avatarUrl)}
                    alt={user.username}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAvatarSvg;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? (
                      <span className="animate-spin text-primary-foreground">⏳</span>
                    ) : (
                      <Camera className="w-8 h-8 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </div>

              <input
                data-testid="avatar-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
                className="hidden"
              />

              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className='bg-gray-500'>Level 1</Badge>
                <span className="text-xs text-gray-400">Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
              </div>

              {uploadError && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md w-full">
                  {uploadError}
                </div>
              )}

              {user.avatarUrl && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  className="w-full mt-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Picture
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-8 space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.wins}</div>
                  <p className="text-xs uppercase font-semibold text-gray-400">Wins</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Gamepad2 className="w-8 h-8 text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-foreground text-white">{stats.totalMatches}</div>
                  <p className="text-xs uppercase font-semibold text-gray-400">Matches</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Medal className="w-8 h-8 text-gray-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
                  <p className="text-xs uppercase font-semibold text-gray-400">Win Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Star className="w-8 h-8 text-orange-500 mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.winRate > 50 ? 'Great!' : 'Persist'}</div>
                  <p className="text-xs uppercase font-semibold text-gray-400">Status</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats & Matches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className='text-white'>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-gray-400">Total Games</span>
                    <span className="font-mono font-medium text-white">{stats.totalMatches}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-gray-400">Wins</span>
                    <span className="font-mono font-medium text-green-500">{stats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-gray-400">Losses</span>
                    <span className="font-mono font-medium text-red-500">{stats.losses}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-gray-400">Highest Coins</span>
                    <span className="font-mono font-medium text-white">Coming Soon</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 h-full text-white">
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <p>No matches played yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {matches.map((match) => (
                        <div key={match.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${match.isWinner ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            />
                            <div>
                              <span className="font-medium block">
                                {match.isWinner ? 'Victory' : `Rank #${match.rank}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {match.coins} coins
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground block">
                              {new Date(match.endedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(match.endedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

