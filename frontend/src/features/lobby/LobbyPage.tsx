import '../../styles/pages.css';

export const LobbyPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Game Lobby</h1>
      </div>

      <div className="lobby-content">
        <div className="box" style={{ gridColumn: '1 / 2' }}>
          Available Matches List
        </div>
        <div className="box" style={{ gridColumn: '2 / 3', gridRow: '1 / 3' }}>
          Create New Match Form
        </div>
        <div className="box" style={{ gridColumn: '1 / 2' }}>
          Your Ongoing Matches
        </div>
      </div>
    </div>
  );
};
