import { CrudBoard } from "../../components/CrudBoard";

const fields=[
  {key:"name",label:"Setup name",required:true},
  {key:"purpose",label:"Purpose",required:true,type:"textarea"},
  {key:"current_user",label:"Currently being used by"},
  {key:"equipment",label:"Equipment"},
  {key:"location",label:"Storage location"},
  {key:"steps",label:"Assembly / use steps",type:"textarea"},
  {key:"troubleshooting",label:"Troubleshooting",type:"textarea"}
] as const;

export default function Setups(){
  return <>
    <h1 className="page-title">Lab Setups</h1>
    <p className="subtitle">How each experimental setup is assembled, used and maintained.</p>
    <CrudBoard
      kind="setups"
      fields={fields as any}
      addLabel="Add lab setup"
      emptyText="No lab setups have been added yet."
    />
  </>;
}
