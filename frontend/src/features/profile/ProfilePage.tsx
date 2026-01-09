import { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages.css';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  }, []);

  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgPosition: 0,
    bestScore: 0,
  });

  const recentMatches: { id: number; opponent: string; result: 'Won' | 'Lost'; date: string }[] = [];

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
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

      console.log('Upload response status:', res.status);
      const responseText = await res.text();
      console.log('Upload response:', responseText);

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} - ${responseText}`);
      }

      const updatedUser = JSON.parse(responseText);
      console.log('Updated user:', updatedUser);
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

  // Better default avatar with user initial
  const userInitial = user.username?.charAt(0).toUpperCase() || '?';
  const defaultAvatarSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234f46e5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%237c3aed;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23grad)'/%3E%3Ccircle cx='100' cy='60' r='30' fill='white'/%3E%3Cpath d='M 40 130 Q 40 100 100 100 Q 160 100 160 130 L 160 180 Q 160 200 100 200 Q 40 200 40 180 Z' fill='white'/%3E%3Ctext x='100' y='80' font-size='44' font-weight='bold' fill='%234f46e5' text-anchor='middle' dominant-baseline='middle'%3E${userInitial}%3C/text%3E%3C/svg%3E`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Player Profile</h1>
      </div>

      <div className="profile-content">
        {/* User Info Card */}
        <div className="box profile-card">
          <div className="avatar-section">
            <div className="avatar-placeholder" onClick={handleAvatarClick}>
              <img
                src={user.avatarUrl ? `${apiBase}${user.avatarUrl}` : defaultAvatarSvg}
                alt={user.username}
                onError={(e) => {
                  console.log('[Avatar] Image failed to load:', (e.target as HTMLImageElement).src);
                  (e.target as HTMLImageElement).src = defaultAvatarSvg;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
              />
              <div className="avatar-overlay">
                {isUploadingAvatar ? (
                  <span className="upload-spinner">⏳</span>
                ) : (
                  <span className="upload-icon">📷</span>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
              style={{ display: 'none' }}
            />
            <div className="user-info">
              <h2>{user.username}</h2>
              <p className="email">{user.email}</p>
              <div className="level-badge">Level 1</div>
              <p className="join-date">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
              {user.avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  className="btn-delete-avatar"
                >
                  Remove Picture
                </button>
              )}
            </div>
          </div>
          {uploadError && <p className="upload-error">{uploadError}</p>}
        </div>

        {/* Stats Summary */}
        <div className="box stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Matches</span>
              <span className="stat-value">{stats.totalMatches}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Wins</span>
              <span className="stat-value wins">{stats.wins}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Losses</span>
              <span className="stat-value losses">{stats.losses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{stats.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="box detailed-stats-card">
          <h3>Additional Stats</h3>
          <div className="detailed-stats-list">
            <div className="stat-row">
              <span>Avg Finish Position</span>
              <span className="stat-highlight">{stats.avgPosition}</span>
            </div>
            <div className="stat-row">
              <span>Best Score</span>
              <span className="stat-highlight">{stats.bestScore}</span>
            </div>
            <div className="stat-row">
              <span>Total Games Played</span>
              <span className="stat-highlight">{stats.totalMatches}</span>
            </div>
            <div className="stat-row">
              <span>Current Streak</span>
              <span className="stat-highlight">—</span>
            </div>
          </div>
        </div>

        {/* Match History */}
        <div className="box match-history-card" style={{ gridColumn: '1 / -1' }}>
          <h3>Recent Matches</h3>
          <div className="matches-list">
            {recentMatches.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">No matches yet.</div>
            )}
            {recentMatches.map((match) => (
              <div key={match.id} className="match-item">
                <div className="match-result" data-result={match.result.toLowerCase()}>
                  {match.result === 'Won' ? '✓' : '✗'}
                </div>
                <div className="match-details">
                  <p className="match-opponents">{match.opponent}</p>
                  <p className="match-date">{match.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
