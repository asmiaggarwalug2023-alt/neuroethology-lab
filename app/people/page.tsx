import { CrudBoard } from "../../components/CrudBoard";
const fields=[
  {key:"name",label:"Name",required:true},
  {key:"role",label:"Role",required:true},
  {key:"email",label:"Email",type:"email"},
  {key:"projects",label:"Projects"},
  {key:"status",label:"Status",type:"select",options:["Current member","Collaborator","Alumni"]},
  {key:"notes",label:"Notes",type:"textarea"}
] as const;
export default function People(){return <><h1 className="page-title">People & Alumni</h1><p className="subtitle">Current members, collaborators and where alumni are now.</p><CrudBoard kind="people" fields={fields as any} addLabel="Add person" emptyText="No people have been added yet."/></>}
