import { NextResponse } from "next/server";

export const revalidate=43200;

type EuropeResult={
  id?:string;
  pmid?:string;
  pmcid?:string;
  doi?:string;
  title?:string;
  authorString?:string;
  journalTitle?:string;
  pubYear?:string;
  firstPublicationDate?:string;
};

export async function GET(){
  try{
    const query='(zebrafish OR "Danio rerio") AND (neuroscience OR brain OR neural OR neuron OR behaviour OR behavior)';
    const url="https://www.ebi.ac.uk/europepmc/webservices/rest/search?query="+encodeURIComponent(query)+"&format=json&pageSize=6&sort_date=y";
    const response=await fetch(url,{next:{revalidate:43200}});
    if(!response.ok) throw new Error("Research source unavailable.");
    const json=await response.json();
    const papers=((json?.resultList?.result||[]) as EuropeResult[]).map(p=>{
      const external=p.doi
        ? "https://doi.org/"+p.doi
        : p.pmid
          ? "https://pubmed.ncbi.nlm.nih.gov/"+p.pmid+"/"
          : p.pmcid
            ? "https://europepmc.org/article/PMC/"+p.pmcid
            : "https://europepmc.org/search?query="+encodeURIComponent(p.title||"zebrafish");
      return {
        id:p.id||p.pmid||p.pmcid||p.doi||p.title,
        title:p.title||"Untitled zebrafish research",
        authors:p.authorString||"",
        journal:p.journalTitle||"",
        date:p.firstPublicationDate||p.pubYear||"",
        url:external
      };
    });
    return NextResponse.json({papers,updatedAt:new Date().toISOString()});
  }catch{
    return NextResponse.json({papers:[],updatedAt:new Date().toISOString(),error:"Fresh research is temporarily unavailable."});
  }
}
