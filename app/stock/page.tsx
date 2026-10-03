import { CrudBoard } from "../../components/CrudBoard";
const fields=[
  {key:"name",label:"Item / reagent name",required:true},
  {key:"category",label:"Category"},
  {key:"location",label:"Location",required:true},
  {key:"supplier",label:"Supplier"},
  {key:"status",label:"Status",required:true,type:"select",options:["Available","Low","Out of stock"]},
  {key:"notes",label:"Purchasing notes",type:"textarea"}
] as const;
export default function Stock(){return <><h1 className="page-title">Lab Stock</h1><p className="subtitle">What is in the lab, where it is, and where it comes from.</p><CrudBoard kind="stock" fields={fields as any} addLabel="Add stock item" emptyText="No stock items have been added yet."/></>}
