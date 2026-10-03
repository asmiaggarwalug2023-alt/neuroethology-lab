import Link from "next/link";
export default function Home(){
  return <>
    <div className="topbar"><div><h1 className="page-title">Make yourself at sea</h1><p className="subtitle">A shortcut to what you need.</p></div><Link className="btn secondary" href="/login">Log in</Link></div>
    <div className="grid">
      <div className="card"><span className="pill">Today</span><h3>Lab rhythm</h3><p>See upcoming meetings, shared tasks, and key lab information in one place.</p><div className="actions"><Link className="btn" href="/tasks">Sign up for feeding</Link><Link className="btn secondary" href="/calendar">Open calendar</Link></div></div>
      <div className="card"><h3>Find what you need</h3><div className="actions"><Link className="btn secondary" href="/handbook">Find a protocol</Link><Link className="btn secondary" href="/setups">Find a lab setup</Link><Link className="btn secondary" href="/people">Find someone</Link></div></div>
      <div className="card"><h3>Fish fact of the day</h3><p>Zebrafish are highly social and often change their behaviour depending on whether conspecifics are visible nearby.</p><p className="small">Keep fun facts separate from approved procedures.</p></div>
    </div>
  </>
}
