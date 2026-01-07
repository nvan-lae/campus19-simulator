import '../../styles/pages.css';

export const HomePage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Campus19 Simulator</h1>
        <p>Multiplayer Board Game</p>
      </div>

      <div className="home-content">
        <div className="box">Navigation Menu</div>
        <div className="box">Featured Game Info / Rules</div>
        <div className="box">Quick Stats (if logged in)</div>
        <div className="box">Recent Matches</div>
      </div>
    </div>
  );
};
