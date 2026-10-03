import { CrudBoard } from "../../components/CrudBoard";
const fields=[
  {key:"title",label:"Project title",required:true},
  {key:"summary",label:"Summary",required:true,type:"textarea"},
  {key:"team",label:"Team"},
  {key:"methods",label:"Methods",type:"textarea"},
  {key:"progress",label:"Progress / current stage"},
  {key:"updates",label:"Latest update",type:"textarea"},
  {key:"status",label:"Status",type:"select",options:["Planning","Active","Paused","Completed"]}
] as const;
export default function Projects(){return <><h1 className="page-title">Projects</h1><p className="subtitle">Major project hubs for the lab.</p><CrudBoard kind="projects" fields={fields as any} addLabel="Add project" emptyText="No projects have been added yet."/></>}
