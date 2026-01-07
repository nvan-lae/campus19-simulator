import '../../styles/pages.css';
import './ProfilePage.css';

export const ProfilePage = () => {
  // Mock user data
  const user = {
    username: 'PlayerName',
    email: 'player@example.com',
    level: 12,
    joinDate: '2024-01-15',
  };

  const stats = {
    totalMatches: 45,
    wins: 28,
    losses: 17,
    winRate: 62.2,
    avgPosition: 2.1,
    bestScore: 420,
  };

  const recentMatches = [
    {
      id: 1,
      opponent: 'Player2, Player3, Player4',
      result: 'Won',
      date: '2 hours ago',
    },
    {
      id: 2,
      opponent: 'Player5, Player6, Player7',
      result: 'Lost',
      date: '5 hours ago',
    },
    {
      id: 3,
      opponent: 'Player8, Player9, Player10',
      result: 'Won',
      date: '1 day ago',
    },
    {
      id: 4,
      opponent: 'Player11, Player12, Player13',
      result: 'Lost',
      date: '2 days ago',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Player Profile</h1>
      </div>

      <div className="profile-content">
        {/* User Info Card */}
        <div className="box profile-card">
          <div className="avatar-section">
            <div className="avatar-placeholder">👤</div>
            <div className="user-info">
              <h2>{user.username}</h2>
              <p className="email">{user.email}</p>
              <div className="level-badge">Level {user.level}</div>
              <p className="join-date">Joined: {user.joinDate}</p>
            </div>
          </div>
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
              <span className="stat-highlight">2 Wins</span>
            </div>
          </div>
        </div>

        {/* Match History */}
        <div className="box match-history-card" style={{ gridColumn: '1 / -1' }}>
          <h3>Recent Matches</h3>
          <div className="matches-list">
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
