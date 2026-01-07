import '../../styles/pages.css';

export const LoginPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Login</h1>
      </div>

      <div className="login-content">
        <div className="box">Login Form (Email/Password)</div>
        <div className="box">Or OAuth Options (Google/42)</div>
        <div className="box">Sign Up Link</div>
      </div>
    </div>
  );
};
