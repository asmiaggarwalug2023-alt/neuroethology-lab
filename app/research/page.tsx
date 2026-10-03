import { CrudBoard } from "../../components/CrudBoard";
const fields=[
  {key:"title",label:"Title",required:true},
  {key:"authors",label:"Authors",required:true},
  {key:"year",label:"Year"},
  {key:"journal",label:"Journal"},
  {key:"doi",label:"DOI / citation"},
  {key:"tags",label:"Tags"},
  {key:"notes",label:"Notes",type:"textarea"}
] as const;
export default function Research(){return <><h1 className="page-title">Research Catalogue</h1><p className="subtitle">A structured index of papers and theses—without uploading PDFs.</p><CrudBoard kind="research" fields={fields as any} addLabel="Add resource" emptyText="No research resources have been added yet."/></>}
