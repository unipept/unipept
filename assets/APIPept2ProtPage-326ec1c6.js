import{d as w,i as s,j as x,o as R,c as S,w as t,l as I,bx as q,g as l,a as i,b as e,K as L}from"./index-eea28a33.js";import{H as m}from"./HeaderBodyCard-3295d4c5.js";import{I as a}from"./InlineCode-67d03729.js";import{I as n}from"./Initialism-440d96b0.js";import{S as T}from"./StaticAlert-5833da9d.js";import{E as d,T as U}from"./TryItCard-91655383.js";import{R as p}from"./ResourceLink-d34b4283.js";import{V as Y}from"./VDivider-834b9f8e.js";import{a as v}from"./VCard-9d59c194.js";import{V as D}from"./VTable-9d8ead1f.js";import{a as C,V as _}from"./VRow-94e3f3e6.js";import{V as j,a as V}from"./VTextarea-ac294625.js";import"./_plugin-vue_export-helper-c27b6911.js";import"./VAlert-6315e811.js";import"./Boxed-9f9dd66a.js";import"./VField-cc36921e.js";import"./forwardRefs-e2994a01.js";const Q={class:"font-weight-light"},k=l("h3",{class:"font-weight-light"}," Returns the set of UniProt entries containing a given tryptic peptide. ",-1),K=l("h3",{class:"font-weight-medium"}," input ",-1),O=l("h3",{class:"font-weight-medium"}," equate_il ",-1),z=l("i",null,"Equate I and L",-1),B=l("h3",{class:"font-weight-medium"}," extra ",-1),H={class:"my-3"},N={class:"mt-3"},W=l("thead",null,[l("tr",null,[l("th",{class:"text-start"}," Name "),l("th",{class:"text-start"}," Description ")])],-1),G=l("tr",null,[l("td",null,[l("b",null,"Input[]"),l("br"),l("i",{style:{"font-size":"85%"}},"required")]),l("td",{class:"py-3"},[e(" Tryptic peptide to search for. Add multiple parameters to search for multiple peptides. "),l("br"),l("div",{class:"mt-3",style:{"font-size":"85%"}}," Value: string ")])],-1),M=l("td",null,[l("b",null,"equate_il"),l("br"),l("i",{style:{"font-size":"85%"}},"optional")],-1),X={class:"py-3"},J=l("br",null,null,-1),F={class:"mt-3",style:{"font-size":"85%"}},Z=l("td",null,[l("b",null,"extra"),l("br"),l("i",{style:{"font-size":"85%"}},"optional")],-1),$={class:"py-3"},ee=l("br",null,null,-1),te={class:"mt-3",style:{"font-size":"85%"}},ie=l("h2",{id:"examples",class:"font-weight-light mt-10"}," Examples ",-1),le=l("h3",{class:"font-weight-medium"}," Input[] ",-1),ae=l("h3",{class:"font-weight-medium"}," Parameters ",-1),Ve=w({__name:"APIPept2ProtPage",setup(ne){const o=new q,A=s({}),g=s({}),P=s({}),y=s({}),c=s(""),h=s(!1),f=s(!1),b=s({}),E=async()=>{b.value=await o.pept2prot(c.value.split(`
`),h.value,f.value)};return x(async()=>{A.value=await o.pept2prot(["AIPQLEVARPADAYETAEAYR"]),g.value=await o.pept2prot(["AIPQLEVARPADAYETAEAYR","APVLSDSSCK"]),P.value=await o.pept2prot(["APVLSDSSCK"],!0,void 0),y.value=await o.pept2prot(["AIPQLEVARPADAYETAEAYR"],void 0,!0)}),(se,r)=>(R(),S(I,null,{default:t(()=>[l("h1",Q,[i(n,null,{default:t(()=>[e("POST")]),_:1}),e(" /api/v1/pept2prot ")]),k,i(Y,{class:"my-2"}),l("p",null,[e(" This method returns the list of UniProt entries containing a given tryptic peptide. This is the same information as provided on the Protein matches tab when performing a search with the "),i(p,{to:"/tpa",router:""},{default:t(()=>[e("Tryptic Peptide Analysis")]),_:1}),e(" in the web interface. ")]),i(m,{id:"request",title:"Request","large-title":""},{default:t(()=>[i(v,null,{default:t(()=>[l("p",null,[e(" The pept2prot method can be used by doing a "),i(n,null,{default:t(()=>[e("HTTP POST")]),_:1}),e("-request (preferred) or "),i(n,null,{default:t(()=>[e("GET")]),_:1}),e("-request to "),i(a,null,{default:t(()=>[e("https://api.unipept.ugent.be/api/v1/pept2prot")]),_:1}),e(". "),i(p,{to:"#parameters",router:""},{default:t(()=>[e("Parameters")]),_:1}),e(" can be included in the request body ("),i(n,null,{default:t(()=>[e("POST")]),_:1}),e(") or in the query string ("),i(n,null,{default:t(()=>[e("GET")]),_:1}),e("). The only required parameter is "),i(a,null,{default:t(()=>[e("input[]")]),_:1}),e(", which takes one or more tryptic peptides. ")]),K,l("p",null,[i(a,null,{default:t(()=>[e("input[]")]),_:1}),e(" is a required parameter that takes one or more tryptic peptides. Unipept will return the list of UniProt entries that contain any of the "),i(a,null,{default:t(()=>[e("input[]")]),_:1}),e(" peptides in their protein sequence. To pass multiple peptides at once, simply add multiple "),i(a,null,{default:t(()=>[e("input[]")]),_:1}),e(" parameters (see "),i(p,{to:"#example2",router:""},{default:t(()=>[e("example")]),_:1}),e("). ")]),i(T,{title:"Input size"},{default:t(()=>[l("p",null,[e(" Unipept puts no restrictions on the number of peptides passed to the "),i(a,null,{default:t(()=>[e("input[]")]),_:1}),e(" parameter. Keep in mind that searching for lots of peptides at once may cause the request to timeout or, in the case of a "),i(n,null,{default:t(()=>[e("GET")]),_:1}),e("-request, exceed the maximum "),i(n,null,{default:t(()=>[e("URL")]),_:1}),e(" length. When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each. ")])]),_:1}),O,l("p",null,[i(a,null,{default:t(()=>[e("equate_il")]),_:1}),e(" is an optional parameter and can either be "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(" or "),i(a,null,{default:t(()=>[e("false")]),_:1}),e(". When not set explicitly, the parameter defaults to "),i(a,null,{default:t(()=>[e("false")]),_:1}),e(". When the parameter is set to "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(", isoleucine (I) and leucine (L) are equated when matching tryptic peptides to UniProt entries. This setting is similar to checking the "),z,e(" checkbox when performing a search with the "),i(p,{to:"/tpa",router:""},{default:t(()=>[e("Tryptic Peptide Analysis")]),_:1}),e(" in the web interface. ")]),B,l("p",null,[i(a,null,{default:t(()=>[e("extra")]),_:1}),e(" is an optional parameter and can either be "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(" or "),i(a,null,{default:t(()=>[e("false")]),_:1}),e(". When not set explicitly, the parameter defaults to "),i(a,null,{default:t(()=>[e("false")]),_:1}),e(". When the parameter is set to "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(", Unipept will return additional information fields. See the "),i(p,{to:"#response",router:""},{default:t(()=>[e("response")]),_:1}),e(" section for an overview of the information fields returned. ")]),i(T,{title:"Performance penalty"},{default:t(()=>[l("p",null,[e(" Setting "),i(a,null,{default:t(()=>[e("extra")]),_:1}),e(" to "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(" has a performance penalty inferred from additional database queries. Do not use this parameter unless the extra information fields are needed. ")])]),_:1})]),_:1})]),_:1}),i(m,{id:"response",title:"Response",class:"mt-5","large-title":""},{default:t(()=>[i(v,null,{default:t(()=>[e(" Matching UniProt entries are returned as a list of "),i(n,null,{default:t(()=>[e("JSON")]),_:1}),e(" objects. By default, each object contains the following information fields extracted from the UniProt entry: "),l("ul",H,[l("li",null,[i(a,null,{default:t(()=>[e("peptide")]),_:1}),e(": the peptide that matched this record")]),l("li",null,[i(a,null,{default:t(()=>[e("uniprot_id")]),_:1}),e(": the UniProt accession number of the matching record")]),l("li",null,[i(a,null,{default:t(()=>[e("protein_name")]),_:1}),e(": the name of the protein of the matching record")]),l("li",null,[i(a,null,{default:t(()=>[e("taxon_id")]),_:1}),e(": the NCBI taxon id of the organism associated with the matching record")])]),e(" When the "),i(a,null,{default:t(()=>[e("extra")]),_:1}),e(" parameter is set to "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(", objects contain the following additional fields extracted from the UniProt entry: "),l("ul",N,[l("li",null,[i(a,null,{default:t(()=>[e("taxon_name")]),_:1}),e(": the name of the organism associated with the matching UniProt entry")]),l("li",null,[i(a,null,{default:t(()=>[e("ec_references")]),_:1}),e(": a space separated list of associated "),i(n,null,{default:t(()=>[e("EC")]),_:1}),e(" numbers")]),l("li",null,[i(a,null,{default:t(()=>[e("go_references")]),_:1}),e(": a space separated list of associated "),i(n,null,{default:t(()=>[e("GO")]),_:1}),e(" terms")])])]),_:1})]),_:1}),i(m,{id:"parameters",title:"Parameters",class:"mt-5","large-title":""},{default:t(()=>[i(D,null,{default:t(()=>[W,l("tbody",null,[G,l("tr",null,[M,l("td",X,[e(" Equate isoleucine (I) and leucine (L). "),J,l("div",F,[e(" Value: Must be "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(" or "),i(a,null,{default:t(()=>[e("false")]),_:1}),e(" (default) ")])])]),l("tr",null,[Z,l("td",$,[e(" Return additional information fields if "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(". "),ee,l("div",te,[e(" Value: Must be "),i(a,null,{default:t(()=>[e("true")]),_:1}),e(" or "),i(a,null,{default:t(()=>[e("false")]),_:1}),e(" (default) ")])])])])]),_:1})]),_:1}),ie,i(d,{title:"Retrieve all UniProt entries containing a given tryptic peptide",response:A.value},{description:t(()=>[e(" This example retrieves all UniProt entries containing the peptide "),l("i",null,[i(n,null,{default:t(()=>[e("AIPQLEVARPADAYETAEAYR")]),_:1})]),e(". The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2prot -d 'input[]=AIPQLEVARPADAYETAEAYR' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2prot.json?input[]=AIPQLEVARPADAYETAEAYR ")]),_:1},8,["response"]),i(d,{id:"example2",class:"mt-5",title:"Retrieve all UniProt entries containing any of multiple tryptic peptides",response:g.value},{description:t(()=>[e(" This example retrieves all UniProt entries containing either the tryptic peptide "),l("i",null,[i(n,null,{default:t(()=>[e("AIPQLEVARPADAYETAEAYR")]),_:1})]),e(" or the tryptic peptide "),l("i",null,[i(n,null,{default:t(()=>[e("APVLSDSSCK")]),_:1})]),e(". The result is the same as the combination of this search and this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2prot -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'input[]=APVLSDSSCK' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2prot.json?input[]=AIPQLEVARPADAYETAEAYR&input[]=APVLSDSSCK ")]),_:1},8,["response"]),i(d,{class:"mt-5",title:"Retrieve all UniProt entries containing a single tryptic peptide, while equating I and L",response:P.value},{description:t(()=>[e(" This example retrieves all UniProt entries containing the tryptic peptide "),l("i",null,[i(n,null,{default:t(()=>[e("APVLSDSSCK")]),_:1})]),e(". In searching, isoleucine (I) and leucine (L) are considered equal. The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2prot -d 'input[]=APVISDSSCK' -d 'equate_il=true' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2prot.json?input[]=APVISDSSCK&equate_il=true ")]),_:1},8,["response"]),i(d,{class:"mt-5",title:"Retrieve all UniProt entries containing a single tryptic peptide and return extra information",response:y.value},{description:t(()=>[e(" This example retrieves all UniProt entries containing the tryptic peptide "),l("i",null,[i(n,null,{default:t(()=>[e("AIPQLEVARPADAYETAEAYR")]),_:1})]),e(", including additional information fields that are not returned by default. The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2prot -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'extra=true' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2prot.json?input[]=AIPQLEVARPADAYETAEAYR&extra=true ")]),_:1},8,["response"]),i(U,{id:"try",class:"mt-5",response:b.value,command:"pept2prot"},{default:t(()=>[i(C,null,{default:t(()=>[i(_,{cols:"12"},{default:t(()=>[le,i(j,{modelValue:c.value,"onUpdate:modelValue":r[0]||(r[0]=u=>c.value=u),class:"pt-0 mt-0",clearable:"","no-resize":"",filled:"","clear-icon":"mdi-close-circle"},null,8,["modelValue"])]),_:1}),i(_,{cols:"12",class:"dark-label"},{default:t(()=>[ae,i(V,{modelValue:f.value,"onUpdate:modelValue":r[1]||(r[1]=u=>f.value=u),color:"primary",inset:"",label:"extra",density:"compact","hide-details":""},null,8,["modelValue"]),i(V,{modelValue:h.value,"onUpdate:modelValue":r[2]||(r[2]=u=>h.value=u),color:"primary",inset:"",label:"equate_il",density:"compact","hide-details":""},null,8,["modelValue"])]),_:1}),i(_,{cols:"12"},{default:t(()=>[i(L,{class:"col-12 col-sm-2 float-end",color:"primary",onClick:E},{default:t(()=>[e(" Try it! ")]),_:1})]),_:1})]),_:1})]),_:1},8,["response"])]),_:1}))}});export{Ve as default};
