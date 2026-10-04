import Link from "next/link";

export default function Home(){
  return (
    <main className="logo-welcome">
      <div className="logo-welcome-card">
        <img className="logo-welcome-icon" src="/app-icon.svg" alt="Neuroethology Lab zebrafish logo" />
        <p className="logo-welcome-kicker">WELCOME TO</p>
        <h1>Neuroethology Lab</h1>
        <p className="logo-welcome-tagline">make yourself at sea</p>
        <div className="logo-welcome-actions">
          <Link className="btn logo-enter" href="/tasks">Enter the lab</Link>
          <Link className="btn secondary logo-login" href="/login">Log in</Link>
        </div>
      </div>
    </main>
  );
}
