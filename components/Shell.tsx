import Link from "next/link";
import { AuthStatus } from "./AuthStatus";
import { InstallApp } from "./InstallApp";

const links = [
  ["/","Home"],["/tasks","Tasks"],["/calendar","Calendar"],["/fish-care","Fish Care"],
  ["/setups","Lab Setups"],["/projects","Projects"],["/handbook","Lab Handbook"],
  ["/research","Research Catalogue"],["/stock","Lab Stock"],["/people","People & Alumni"]
];

export function Shell({children}:{children:React.ReactNode}) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">〰</span>
          <span><b>Neuroethology Lab</b><small>make yourself at sea</small></span>
        </Link>
        <div className="header-actions"><InstallApp /><AuthStatus /></div>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        {links.map(([href,label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <main className="main">{children}</main>
      <footer className="footer-note">Neuroethology Lab · shared lab home</footer>
    </div>
  );
}
