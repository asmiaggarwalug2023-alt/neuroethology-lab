import Link from "next/link";

const links=[
  ["/","Home"],["/tasks","Tasks"],["/calendar","Calendar"],["/fish-care","Fish Care"],
  ["/setups","Lab Setups"],["/projects","Projects"],["/handbook","Lab Handbook"],
  ["/research","Research Catalogue"],["/stock","Lab Stock"],["/people","People & Alumni"]
];

export function Shell({children}:{children:React.ReactNode}){
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">Neuroethology<br/>Lab</div>
      <nav className="nav">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav>
    </aside>
    <main className="main">{children}</main>
  </div>
}
