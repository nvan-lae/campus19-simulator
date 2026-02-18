import { useRef, useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Camera, Trophy, Medal, Star, Gamepad2, ShieldCheck, Copy, X } from 'lucide-react';
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

  // 2FA State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

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

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      setIs2FALoading(true);
      setTwoFactorError(null);
      try {
        const res = await fetch(`${apiBase}/auth/2fa/setup`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to generate 2FA setup');
        const data = await res.json();
        setQrCodeUrl(data.qrCodeDataURL);
        setShow2FASetup(true);
      } catch (err) {
        setTwoFactorError(err instanceof Error ? err.message : 'Failed to setup 2FA');
      } finally {
        setIs2FALoading(false);
      }
    } else {
      setShow2FADisable(true);
      setVerificationCode('');
      setTwoFactorError(null);
    }
  };

  const handleVerify2FASetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code');
      return;
    }
    setIs2FALoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch(`${apiBase}/auth/2fa/verify-setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });
      if (!res.ok) throw new Error('Invalid verification code');
      const data = await res.json();
      if (data.recoveryCodes) {
        setRecoveryCodes(data.recoveryCodes);
        updateUser({ twoFactorEnabled: true });
      }
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code');
      return;
    }
    setIs2FALoading(true);
    setTwoFactorError(null);
    try {
      const res = await fetch(`${apiBase}/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });
      if (!res.ok) throw new Error('Invalid verification code');
      updateUser({ twoFactorEnabled: false });
      setShow2FADisable(false);
      setVerificationCode('');
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIs2FALoading(false);
    }
  };

  const closeSetupModal = () => {
    setShow2FASetup(false);
    setRecoveryCodes([]);
    setVerificationCode('');
    setQrCodeUrl('');
    setTwoFactorError(null);
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
  };

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
      updateUser({ avatar: updatedUser.avatarUrl });
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

      updateUser({ avatar: updatedUser.avatarUrl });
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

  const highestCoins = matches.length > 0 ? Math.max(...matches.map(m => m.coins)) : 0;

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
    <div className="w-full bg-slate-900">
      <div className="container max-w-6xl mx-auto py-10 px-4 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Player Profile</h1>
            <p className="text-muted-foreground mt-1 text-gray-400">Manage your account settings and view your stats.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handle2FAToggle(!user.twoFactorEnabled)}
              disabled={is2FALoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
                user.twoFactorEnabled 
                  ? 'bg-green-500 border-green-600 text-secondary-foreground' 
                  : 'bg-red-500 border-red-600 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">
                2FA {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-500">Online</Badge>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    {recoveryCodes.length > 0 ? 'Save Recovery Codes' : 'Setup Two-Factor Authentication'}
                  </CardTitle>
                  <button onClick={closeSetupModal} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recoveryCodes.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-300">
                      Save these recovery codes in a secure location. You'll need them if you lose access to your authenticator app.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg space-y-2">
                      {recoveryCodes.map((code, idx) => (
                        <div key={idx} className="font-mono text-sm text-white">{code}</div>
                      ))}
                    </div>
                    <Button onClick={copyRecoveryCodes} className="w-full">
                      <Copy className="w-4 h-4 mr-2" />Copy Codes
                    </Button>
                    <Button onClick={closeSetupModal} variant="outline" className="w-full">Done</Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-300">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                    </p>
                    {qrCodeUrl && (
                      <div className="flex justify-center bg-white p-4 rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Enter the 6-digit code from your app:</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest"
                        placeholder="000000"
                      />
                    </div>
                    {twoFactorError && (
                      <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-md">{twoFactorError}</div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleVerify2FASetup} disabled={is2FALoading || verificationCode.length !== 6} className="flex-1">
                        {is2FALoading ? 'Verifying...' : 'Verify & Enable'}
                      </Button>
                      <Button onClick={closeSetupModal} variant="outline">Cancel</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2FA Disable Modal */}
        {show2FADisable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Disable Two-Factor Authentication</CardTitle>
                  <button onClick={() => setShow2FADisable(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">Enter your current 6-digit code to disable 2FA:</p>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                {twoFactorError && (
                  <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-md">{twoFactorError}</div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleDisable2FA} disabled={is2FALoading || verificationCode.length !== 6} variant="destructive" className="flex-1">
                    {is2FALoading ? 'Disabling...' : 'Disable 2FA'}
                  </Button>
                  <Button onClick={() => setShow2FADisable(false)} variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    src={getAvatarUrl(user.avatar)}
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
                <span className="text-xs text-gray-400">Joined —</span>
              </div>

              {uploadError && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md w-full">
                  {uploadError}
                </div>
              )}

              {user.avatar && (
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
                    <span className="font-mono font-medium text-white">{highestCoins} 🪙</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 h-full text-white">
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-white">
                      <p>No matches played yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {matches.map((match) => (
                        <div key={match.id} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${match.isWinner ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            />
                            <div>
                              <span className="font-medium block">
                                {match.isWinner ? 'Victory' : `Rank #${match.rank}`}
                              </span>
                              <span className="text-xs text-gray-300">
                                {match.coins} coins
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-300 block">
                              {new Date(match.endedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-gray-300">
                              {new Date(match.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

