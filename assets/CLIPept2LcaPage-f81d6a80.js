import{I as u}from"./InlineCode-67d03729.js";import{H as d}from"./HeaderBodyCard-3295d4c5.js";import{B as a,S as o}from"./Boxed-9f9dd66a.js";import{R as s}from"./ResourceLink-d34b4283.js";import{S as p}from"./StaticAlert-5833da9d.js";import{I as i}from"./Initialism-440d96b0.js";import{d as r,o as _,c,w as l,l as h,a as n,g as e,b as t,t as f}from"./index-eea28a33.js";import{V as m}from"./VDivider-834b9f8e.js";import"./_plugin-vue_export-helper-c27b6911.js";import"./VCard-9d59c194.js";import"./VAlert-6315e811.js";const x=e("h1",{class:"font-weight-light"}," unipept pept2lca ",-1),b=e("h3",{class:"font-weight-light"}," Returns the taxonomic lowest common ancestor for a given tryptic peptide. ",-1),A=e("i",null,"standard input",-1),I=e("h3",null,"Command line arguments",-1),g=e("p",null," If input is supplied using command line arguments, the accession numbers must be separated by spaces. ",-1),T=e("h4",null,"Example",-1),E=e("br",null,null,-1),L=e("br",null,null,-1),y=e("br",null,null,-1),G=e("h3",null,"File input",-1),k=e("h4",null,"Example",-1),R=e("br",null,null,-1),w=e("br",null,null,-1),V=e("br",null,null,-1),D=e("br",null,null,-1),K=e("br",null,null,-1),M=e("br",null,null,-1),Y=e("h3",null,"Standard input",-1),$=e("i",null,"standard input",-1),B=e("i",null,"standard input",-1),C=e("h4",null,"Example",-1),U=e("br",null,null,-1),S=e("br",null,null,-1),q=e("br",null,null,-1),v=e("br",null,null,-1),P=e("br",null,null,-1),F=e("br",null,null,-1),N=e("i",null,"standard output",-1),j=e("h3",null,"File output",-1),W=e("h4",null,"Example",-1),H=e("br",null,null,-1),O=e("br",null,null,-1),Q=e("br",null,null,-1),z=e("br",null,null,-1),J=e("h3",null,"Standard output",-1),X=e("i",null,"standard output",-1),Z=e("h4",null,"Example",-1),tt=e("br",null,null,-1),et=e("br",null,null,-1),lt=e("br",null,null,-1),nt=e("br",null,null,-1),ot=e("br",null,null,-1),ut=e("br",null,null,-1),at=e("br",null,null,-1),it=e("br",null,null,-1),st=e("h4",null,"Example",-1),dt=e("br",null,null,-1),pt=e("br",null,null,-1),rt=e("br",null,null,-1),_t=e("br",null,null,-1),ct=e("br",null,null,-1),ht=e("br",null,null,-1),ft=e("br",null,null,-1),mt=e("br",null,null,-1),xt=e("br",null,null,-1),bt=e("br",null,null,-1),At=e("h2",null,[t("--equate / -e "),e("span",{class:"text-caption grey--text text--darken-2"},"Equate isoleucine and leucine")],-1),It=e("i",null,"Equate I and L?",-1),gt=e("h4",null,"Example",-1),Tt=e("br",null,null,-1),Et=e("br",null,null,-1),Lt=e("br",null,null,-1),yt=e("b",null,"--equate",-1),Gt=e("br",null,null,-1),kt=e("br",null,null,-1),Rt=e("h2",null,[t("--input / -i "),e("span",{class:"text-caption grey--text text--darken-2"},"Specify an input file")],-1),wt=e("i",null,"standard input",-1),Vt=e("h4",null,"Example",-1),Dt=e("br",null,null,-1),Kt=e("br",null,null,-1),Mt=e("br",null,null,-1),Yt=e("br",null,null,-1),$t=e("b",null,"--input",-1),Bt=e("br",null,null,-1),Ct=e("br",null,null,-1),Ut=e("br",null,null,-1),St=e("h2",null,[t("--output / -o "),e("span",{class:"text-caption grey--text text--darken-2"},"Specify an output file")],-1),qt=e("i",null,"standard output",-1),vt=e("h4",null,"Example",-1),Pt=e("b",null,"--output",-1),Ft=e("br",null,null,-1),Nt=e("br",null,null,-1),jt=e("br",null,null,-1),Wt=e("h2",null,[t("--select / -s "),e("span",{class:"text-caption grey--text text--darken-2"},"Specify the output fields")],-1),Ht=e("b",null,"*",-1),Ot=e("h4",null,"Example",-1),Qt=e("b",null,"--select",-1),zt=e("br",null,null,-1),Jt=e("br",null,null,-1),Xt=e("br",null,null,-1),Zt=e("b",null,"--select",-1),te=e("b",null,"--select",-1),ee=e("br",null,null,-1),le=e("br",null,null,-1),ne=e("h2",null,[t("--format / -f "),e("span",{class:"text-caption grey--text text--darken-2"},"Specify the output format")],-1),oe=e("h4",null,"Example",-1),ue=e("b",null,"--format",-1),ae=e("br",null,null,-1),ie=e("br",null,null,-1),se=e("b",null,"--format",-1),de=e("br",null,null,-1),pe=e("h2",null,[t("--all / -a "),e("span",{class:"text-caption grey--text text--darken-2"},"Request additional information")],-1),re=e("h4",null,"Example",-1),_e=e("b",null,"--all",-1),ce=e("br",null,null,-1),he=e("br",null,null,-1),fe=e("h2",null,[t("--help / -h "),e("span",{class:"text-caption grey--text text--darken-2"},"Display help")],-1),me=e("p",null," This flag displays the help. ",-1),xe="<results><result><peptide>AALTER</peptide><taxon_id>1</taxon_id><taxon_name>root</taxon_name><taxon_rank>no rank</taxon_rank></result><result><peptide>MDGTEYIIVK</peptide><taxon_id>1263</taxon_id><taxon_name>Ruminococcus</taxon_name><taxon_rank>genus</taxon_rank></result></results>",Ke=r({__name:"CLIPept2LcaPage",setup(be){return(Ae,Ie)=>(_(),c(h,null,{default:l(()=>[x,b,n(m,{class:"my-2"}),e("p",null,[t(" The "),n(u,null,{default:l(()=>[t("unipept pept2lca")]),_:1}),t(" command takes one or more tryptic peptides as input and returns the taxonomic lowest common ancestor ("),n(i,null,{default:l(()=>[t("LCA")]),_:1}),t(") for each of them as output. The "),n(i,null,{default:l(()=>[t("LCA")]),_:1}),t(" is calculated from all taxa associated with the UniProt entries that contain the given peptide. All this information is fetched by doing "),n(s,{to:"/apidocs/pept2lca",router:""},{default:l(()=>[n(i,null,{default:l(()=>[t("API")]),_:1}),t("-requests")]),_:1}),t(" to the Unipept server. ")]),n(d,{id:"input",title:"Input","large-title":""},{default:l(()=>[e("p",null,[t(" The "),n(u,null,{default:l(()=>[t("unipept pept2lca")]),_:1}),t(" command expects tryptic peptides as input. The source of this input can be command line arguments, a file, or "),A,t(". If input is supplied using multiple sources at the same time, the order of priority as described above is used. ")]),I,g,T,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca AALTER MDGTEYIIVK "),E,t("peptide,taxon_id,taxon_name,taxon_rank "),L,t("AALTER,1,root,no rank "),y,t("MDGTEYIIVK,1263,Ruminococcus,genus ")]),_:1}),G,e("p",null,[t(" Use the "),n(s,{to:"#options",router:""},{default:l(()=>[t("--input parameter")]),_:1}),t(" to specify a file to use as input. If input is supplied using a file, a single peptide per line is expected. ")]),k,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat input.txt "),R,t("AALTER "),w,t("MDGTEYIIVK "),V,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca --input input.txt "),D,t("peptide,taxon_id,taxon_name,taxon_rank "),K,t("AALTER,1,root,no rank "),M,t("MDGTEYIIVK,1263,Ruminococcus,genus ")]),_:1}),Y,e("p",null,[t(" If the command is run without arguments and no file is specified, "),n(u,null,{default:l(()=>[t("unipept pept2lca")]),_:1}),t(" will read its input from "),$,t(". When "),B,t(" is used, a single peptide per line is expected. ")]),C,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat input.txt "),U,t("AALTER "),S,t("MDGTEYIIVK "),q,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat input | unipept pept2lca "),v,t("peptide,taxon_id,taxon_name,taxon_rank "),P,t("AALTER,1,root,no rank "),F,t("MDGTEYIIVK,1263,Ruminococcus,genus ")]),_:1})]),_:1}),n(d,{id:"output",title:"Output",class:"mt-5","large-title":""},{default:l(()=>[e("p",null,[t(" The "),n(u,null,{default:l(()=>[t("unipept pept2lca")]),_:1}),t(" command outputs the taxonomic lowest common ancestor ("),n(i,null,{default:l(()=>[t("LCA")]),_:1}),t(") for each of the (tryptic) input peptides that were found in the Unipept database. By default, the "),n(i,null,{default:l(()=>[t("NCBI")]),_:1}),t(" taxon id, taxon name and taxonomic rank of the "),n(i,null,{default:l(()=>[t("LCA")]),_:1}),t(" are returned. By using the "),n(s,{to:"#options",router:""},{default:l(()=>[t("--all parameter")]),_:1}),t(", this can be supplemented with the full taxonomic lineage of the "),n(i,null,{default:l(()=>[t("LCA")]),_:1}),t(". Consult the "),n(s,{to:"/apidocs/pept2lca",router:""},{default:l(()=>[n(i,null,{default:l(()=>[t("API")]),_:1}),t(" documentation")]),_:1}),t(" for a detailed list of output fields. A selection of output fields can be specified with the "),n(s,{to:"#options",router:""},{default:l(()=>[t("--select parameter")]),_:1}),t(". By default, output is generated in csv format. By using the "),n(s,{to:"#options",router:""},{default:l(()=>[t("--format parameter")]),_:1}),t(", the format can be changed into json or xml. The output can be written to a file or to "),N,t(". ")]),j,e("p",null,[t(" Use the "),n(s,{to:"#options",router:""},{default:l(()=>[t("--output parameter")]),_:1}),t(" to specify an output file. If the file aready exists, the output will be appended to the end of the file. ")]),W,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca --output output.txt AALTER MDGTEYIIVK "),H,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat output.txt "),O,t("peptide,taxon_id,taxon_name,taxon_rank "),Q,t("AALTER,1,root,no rank "),z,t("MDGTEYIIVK,1263,Ruminococcus,genus ")]),_:1}),J,e("p",null,[t(" If no output file is specified, "),n(u,null,{default:l(()=>[t("unipept pept2lca")]),_:1}),t(" will write its output to "),X,t(". ")]),Z,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca AALTER MDGTEYIIVK "),tt,t("peptide,taxon_id,taxon_name,taxon_rank "),et,t("AALTER,1,root,no rank "),lt,t("MDGTEYIIVK,1263,Ruminococcus,genus "),nt,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca AALTER MDGTEYIIVK > output.txt "),ot,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat output.txt "),ut,t("peptide,taxon_id,taxon_name,taxon_rank "),at,t("AALTER,1,root,no rank "),it,t("MDGTEYIIVK,1263,Ruminococcus,genus ")]),_:1})]),_:1}),n(d,{id:"fasta",title:"Fasta support",class:"mt-5","large-title":""},{default:l(()=>[e("p",null,[t(" The "),n(u,null,{default:l(()=>[t("unipept pept2lca")]),_:1}),t(" command supports input (from any source) in a fasta-like format (for example generated by the "),n(s,{to:"/clidocs/prot2pept",router:""},{default:l(()=>[t("prot2pept command")]),_:1}),t("). This format consists of a fasta header (a line starting with a >), followed by one or more lines containing one peptide each. When this format is detected, the output will automatically include an extra information field containing the corresponding fasta header. ")]),st,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat input.txt "),dt,t("> header 1 "),pt,t("AALTER "),rt,t("MDGTEYIIVK "),_t,t("> header 2 "),ct,t("AALTER "),ht,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca --input input.txt "),ft,t("fasta_header,peptide,taxon_id,taxon_name,taxon_rank "),mt,t("> header 1,AALTER,1,root,no rank "),xt,t("> header 1,MDGTEYIIVK,1263,Ruminococcus,genus "),bt,t("> header 2,AALTER,1,root,no rank ")]),_:1})]),_:1}),n(d,{id:"options",title:"Command-line options",class:"mt-5","large-title":""},{default:l(()=>[At,e("p",null,[t(" If the "),n(u,null,{default:l(()=>[t("--equate")]),_:1}),t(" flag is set, isoleucine (I) and leucine (L) are equated when matching tryptic peptides to UniProt entries. This is similar to checking the "),It,t(" checkbox when performing a search in the Unipept web interface. ")]),gt,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca LGAALGAGLAVIGAGIGIGK "),Tt,t("peptide,taxon_id,taxon_name,taxon_rank "),Et,t("LGAALGAGLAVIGAGIGIGK,817,Bacteroides fragilis,species "),Lt,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),yt,t(" LGAALGAGLAVIGAGIGIGK "),Gt,t("peptide,taxon_id,taxon_name,taxon_rank "),kt,t("LGAALGAGLAVIGAGIGIGK,171549,Bacteroidales,order ")]),_:1}),Rt,e("p",null,[t(" All Unipept "),n(i,null,{default:l(()=>[t("CLI")]),_:1}),t(" commands can process input from 3 sources: command line arguments, a file, or "),wt,t(". The optional "),n(u,null,{default:l(()=>[t("--input")]),_:1}),t(" option allows you to specify an input file. The file should contain a single peptide per line. ")]),Vt,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat input.txt "),Dt,t("AALTER "),Kt,t("OMGWTFBBQ "),Mt,t("MDGTEYIIVK "),Yt,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),$t,t(" input.txt "),Bt,t("peptide,taxon_id,taxon_name,taxon_rank "),Ct,t("AALTER,1,root,no rank "),Ut,t("MDGTEYIIVK,1263,Ruminococcus,genus ")]),_:1}),St,e("p",null,[t(" By default, the unipept commands write their output to "),qt,t(". Using the optional "),n(u,null,{default:l(()=>[t("--output")]),_:1}),t(" option allows you to specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created. ")]),vt,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),Pt,t(" output.txt AALTER "),Ft,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" cat output.txt "),Nt,t("peptide,taxon_id,taxon_name,taxon_rank "),jt,t("AALTER,1,root,no rank ")]),_:1}),Wt,e("p",null,[t(" By default, the Unipept "),n(i,null,{default:l(()=>[t("CLI")]),_:1}),t(" commands output all information fields received from the Unipept server. The "),n(u,null,{default:l(()=>[t("--select")]),_:1}),t(" option allows you to control which fields are returned. A list of fields can be specified by a comma-separated list, or by using multiple "),n(u,null,{default:l(()=>[t("--select")]),_:1}),t(" options. A "),Ht,t(" can be used as a wildcard for field names. For example, "),n(u,null,{default:l(()=>[t("--select peptide,taxon*")]),_:1}),t(" will return the peptide field and all fields starting with taxon. ")]),Ot,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),Qt,t(" peptide,taxon_id AALTER "),zt,t("peptide,taxon_id "),Jt,t("AALTER,1 "),Xt,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),Zt,t(" peptide "),te,t(" *name AALTER "),ee,t("peptide,taxon_name "),le,t("AALTER,root ")]),_:1}),ne,e("p",null,[t(" By default, the Unipept "),n(i,null,{default:l(()=>[t("CLI")]),_:1}),t(" commands return their output in csv format. The "),n(u,null,{default:l(()=>[t("--format")]),_:1}),t(" option allows you to select another format. Supported formats are csv, json, and xml. ")]),oe,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),ue,t(" json AALTER MDGTEYIIVK "),ae,t('[{"peptide":"AALTER","taxon_id":1,"taxon_name":"root","taxon_rank":"no rank"},{"peptide":"MDGTEYIIVK","taxon_id":1263,"taxon_name":"Ruminococcus","taxon_rank":"genus"}] '),ie,n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),se,t(" xml AALTER MDGTEYIIVK "),de,t(f(xe))]),_:1}),pe,e("p",null,[t(" By default, the Unipept "),n(i,null,{default:l(()=>[t("CLI")]),_:1}),t(" commands only request basic information from the Unipept server. By using the "),n(u,null,{default:l(()=>[t("--all")]),_:1}),t(" flag, you can request additional information fields such as the lineage of the returned taxa. You can use the "),n(u,null,{default:l(()=>[t("--select")]),_:1}),t(" option to select which fields are included in the output. ")]),n(p,{title:"Performance penalty"},{default:l(()=>[e("p",null,[t(" Setting "),n(u,null,{default:l(()=>[t("--all")]),_:1}),t(" has a performance penalty inferred from additional database queries. Do not use this parameter unless the extra information fields are needed. ")])]),_:1}),re,n(a,null,{default:l(()=>[n(o,null,{default:l(()=>[t("$")]),_:1}),t(" unipept pept2lca "),_e,t(" --select peptide,taxon_id,order* MDGTEYIIVK "),ce,t("peptide,taxon_id,order_id,order_name "),he,t("MDGTEYIIVK,1263,186802,Clostridiales ")]),_:1}),fe,me]),_:1})]),_:1}))}});export{Ke as default};
