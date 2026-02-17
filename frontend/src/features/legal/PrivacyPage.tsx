export const PrivacyPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: February 16, 2026</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Campus19 Simulator is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our multiplayer board game platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Account Information</h3>
          <p>When you register for an account, we collect:</p>
          <ul>
            <li><strong>Username:</strong> Your chosen display name</li>
            <li><strong>Email Address:</strong> For account authentication and communication</li>
            <li><strong>Password:</strong> Stored securely using industry-standard encryption</li>
            <li><strong>42 Intra ID:</strong> If you sign up using 42 OAuth authentication</li>
            <li><strong>Avatar:</strong> Profile picture (optional)</li>
          </ul>

          <h3>2.2 Authentication & Security Data</h3>
          <ul>
            <li><strong>Two-Factor Authentication (2FA):</strong> TOTP secrets and recovery codes if you enable 2FA</li>
            <li><strong>JWT Tokens:</strong> Used for maintaining your authenticated session</li>
            <li><strong>WebSocket Connections:</strong> Real-time connection data for gameplay</li>
          </ul>

          <h3>2.3 Gameplay Data</h3>
          <ul>
            <li><strong>Match History:</strong> Games played, wins, losses, and rankings</li>
            <li><strong>In-Game Performance:</strong> Coins earned, positions, and game statistics</li>
            <li><strong>Chat Messages:</strong> Messages sent during gameplay sessions</li>
            <li><strong>Predictions & Bets:</strong> In-game betting activity during challenges</li>
          </ul>

          <h3>2.4 Technical Data</h3>
          <ul>
            <li><strong>IP Address:</strong> For security and fraud prevention</li>
            <li><strong>Browser & Device Information:</strong> To optimize your experience</li>
            <li><strong>Connection Logs:</strong> WebSocket and HTTP request logs</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Authenticate your identity and maintain session security</li>
            <li>Enable gameplay features including matchmaking and real-time game mechanics</li>
            <li>Display leaderboards and player statistics</li>
            <li>Communicate important updates about the service</li>
            <li>Detect and prevent fraud, abuse, and security incidents</li>
            <li>Improve and optimize our platform</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Data Storage & Security</h2>
          <p>
            Your data is stored in a PostgreSQL database hosted on our secure servers. We implement industry-standard security measures including:
          </p>
          <ul>
            <li>Encrypted password storage using bcrypt</li>
            <li>JWT-based authentication with secure token verification</li>
            <li>HTTPS encryption for all data transmission</li>
            <li>Two-factor authentication (TOTP) support</li>
            <li>Regular security audits and updates</li>
          </ul>
          <p>
            However, no method of transmission over the internet is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Data Sharing & Disclosure</h2>
          <p>We do not sell your personal information. We may share your data only in the following circumstances:</p>
          <ul>
            <li><strong>Publicly Visible Information:</strong> Your username, avatar, and game statistics are visible to other players</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Third-Party Authentication</h2>
          <p>
            If you sign up using 42 OAuth, we receive limited information from 42 (username, email, and Intra ID). This authentication is governed by 42's privacy policy. We do not have access to your 42 password.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Cookies & Local Storage</h2>
          <p>
            We use browser local storage to maintain your authentication state and user preferences. No third-party tracking cookies are used on our platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> View your personal information</li>
            <li><strong>Update:</strong> Modify your profile, username, avatar, and email</li>
            <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
            <li><strong>Export:</strong> Request a copy of your data</li>
            <li><strong>Opt-Out:</strong> Disable two-factor authentication at any time</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Data Retention</h2>
          <p>
            We retain your account information for as long as your account is active. Match history and statistics are retained indefinitely for leaderboard purposes unless you request deletion.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Information</h2>
          <p>
            For questions about this Privacy Policy, please contact us at:<br />
            <strong>Email:</strong> Coming soon<br />
          </p>
        </section>
      </div>
    </div>
  );
};