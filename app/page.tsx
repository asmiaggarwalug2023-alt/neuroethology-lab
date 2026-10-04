import { WelcomeFish } from "../components/WelcomeFish";

export default function Home(){
  return (
    <main className="logo-welcome">
      <div className="logo-welcome-card">
        <h1 className="long-time-title">Long time no sea</h1>
        <WelcomeFish />
      </div>
    </main>
  );
}
