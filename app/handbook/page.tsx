import { ProtocolBoard } from "../../components/ProtocolBoard";

export default function Handbook(){
  return <>
    <h1 className="page-title">Lab Handbook</h1>
    <p className="subtitle">Add, update and share established procedures and approved experimental protocols.</p>
    <ProtocolBoard/>
  </>;
}
