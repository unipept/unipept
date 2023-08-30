import{d as E,i as s,j as R,o as x,c as I,w as t,l as L,bx as D,g as a,a as l,b as e,K as O}from"./index-eea28a33.js";import{H as _}from"./HeaderBodyCard-3295d4c5.js";import{I as i}from"./InlineCode-67d03729.js";import{I as n}from"./Initialism-440d96b0.js";import{S as V}from"./StaticAlert-5833da9d.js";import{E as p,T as q}from"./TryItCard-91655383.js";import{R as d}from"./ResourceLink-d34b4283.js";import{V as Y}from"./VDivider-834b9f8e.js";import{V as C}from"./VTable-9d8ead1f.js";import{a as G,V as A}from"./VRow-94e3f3e6.js";import{V as j,a as g}from"./VTextarea-ac294625.js";import"./VCard-9d59c194.js";import"./_plugin-vue_export-helper-c27b6911.js";import"./VAlert-6315e811.js";import"./Boxed-9f9dd66a.js";import"./VField-cc36921e.js";import"./forwardRefs-e2994a01.js";const K={class:"font-weight-light"},Q={class:"font-weight-light"},k=a("h3",{class:"font-weight-medium"}," input ",-1),U=a("h3",{class:"font-weight-medium"}," equate_il ",-1),z=a("i",null,"Equate I and L",-1),H=a("h3",{class:"font-weight-medium"}," extra ",-1),B=a("h3",{class:"font-weight-medium"}," domains ",-1),N={class:"mb-2"},W={class:"my-3"},X=a("thead",null,[a("tr",null,[a("th",{class:"text-start"}," Name "),a("th",{class:"text-start"}," Description ")])],-1),M=a("tr",null,[a("td",null,[a("b",null,"Input[]"),a("br"),a("i",{style:{"font-size":"85%"}},"required")]),a("td",{class:"py-3"},[e(" Tryptic peptide to search for. Add multiple parameters to search for multiple peptides. "),a("br"),a("div",{class:"mt-3",style:{"font-size":"85%"}}," Value: string ")])],-1),J=a("td",null,[a("b",null,"equate_il"),a("br"),a("i",{style:{"font-size":"85%"}},"optional")],-1),F={class:"py-3"},Z=a("br",null,null,-1),$={class:"mt-3",style:{"font-size":"85%"}},ee=a("td",null,[a("b",null,"extra"),a("br"),a("i",{style:{"font-size":"85%"}},"optional")],-1),te={class:"py-3"},le=a("br",null,null,-1),ae={class:"mt-3",style:{"font-size":"85%"}},ie=a("td",null,[a("b",null,"domains"),a("br"),a("i",{style:{"font-size":"85%"}},"optional")],-1),ne={class:"py-3"},se=a("br",null,null,-1),oe={class:"mt-3",style:{"font-size":"85%"}},ue=a("h2",{id:"examples",class:"font-weight-light mt-10"}," Examples ",-1),re=a("h3",{class:"font-weight-medium"}," Input[] ",-1),pe=a("h3",{class:"font-weight-medium"}," Parameters ",-1),Ie=E({__name:"APIPept2GoPage",setup(de){const r=new D,y=s({}),b=s({}),w=s({}),v=s({}),P=s({}),c=s(""),h=s(!1),m=s(!1),f=s(!1),T=s({}),S=async()=>{T.value=await r.pept2go(c.value.split(`
`),h.value,m.value,f.value)};return R(async()=>{y.value=await r.pept2go(["AIPQLEVARPADAYETAEAYR"]),b.value=await r.pept2go(["AIPQLEVARPADAYETAEAYR","APVLSDSSCK"]),w.value=await r.pept2go(["APVLSDSSCK"],!0,void 0,void 0),v.value=await r.pept2go(["AIPQLEVARPADAYETAEAYR"],void 0,!0,void 0),P.value=await r.pept2go(["APVLSDSSCK"],void 0,void 0,!0)}),(ce,o)=>(x(),I(L,null,{default:t(()=>[a("h1",K,[l(n,null,{default:t(()=>[e("POST")]),_:1}),e(" /api/v1/pept2go ")]),a("h3",Q,[e("Returns the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with a given tryptic peptide.")]),l(Y,{class:"my-2"}),a("p",null,[e(" This method returns the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with a given tryptic peptide. This is the same information as provided when performing a search with the "),l(d,{to:"/tpa",router:""},{default:t(()=>[e("Tryptic Peptide Analysis")]),_:1}),e(" in the web interface. ")]),l(_,{id:"request",title:"Request","large-title":""},{default:t(()=>[a("p",null,[e(" The pept2go method can be used by doing a "),l(n,null,{default:t(()=>[e("HTTP POST")]),_:1}),e("-request (preferred) or "),l(n,null,{default:t(()=>[e("GET")]),_:1}),e("-request to "),l(i,null,{default:t(()=>[e("https://api.unipept.ugent.be/api/v1/pept2go")]),_:1}),e(". "),l(d,{to:"#parameters",router:""},{default:t(()=>[e("Parameters")]),_:1}),e(" can be included in the request body ("),l(n,null,{default:t(()=>[e("POST")]),_:1}),e(") or in the query string ("),l(n,null,{default:t(()=>[e("GET")]),_:1}),e("). The only required parameter is "),l(i,null,{default:t(()=>[e("input[]")]),_:1}),e(", which takes one or more tryptic peptides. ")]),k,a("p",null,[l(i,null,{default:t(()=>[e("input[]")]),_:1}),e(" is a required parameter that takes one or more tryptic peptides. Unipept will return the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with each of the "),l(i,null,{default:t(()=>[e("input[]")]),_:1}),e(" peptides based on their occurrence in UniProt entries. To pass multiple peptides at once, simply add multiple "),l(i,null,{default:t(()=>[e("input[]")]),_:1}),e(" parameters (see "),l(d,{to:"#example2",router:""},{default:t(()=>[e("example")]),_:1}),e("). ")]),l(V,{title:"Input size"},{default:t(()=>[a("p",null,[e(" Unipept puts no restrictions on the number of peptides passed to the "),l(i,null,{default:t(()=>[e("input[]")]),_:1}),e(" parameter. Keep in mind that searching for lots of peptides at once may cause the request to timeout or, in the case of a "),l(n,null,{default:t(()=>[e("GET")]),_:1}),e("-request, exceed the maximum "),l(n,null,{default:t(()=>[e("URL")]),_:1}),e(" length. When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each. ")])]),_:1}),U,a("p",null,[l(i,null,{default:t(()=>[e("equate_il")]),_:1}),e(" is an optional parameter and can either be "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(" or "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(". When not set explicitly, the parameter defaults to "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(". When the parameter is set to "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(", isoleucine (I) and leucine (L) are equated when matching tryptic peptides to UniProt entries. This setting is similar to checking the "),z,e(" checkbox when performing a search with the "),l(d,{to:"/tpa",router:""},{default:t(()=>[e("Tryptic Peptide Analysis")]),_:1}),e(" in the web interface. ")]),H,a("p",null,[l(i,null,{default:t(()=>[e("extra")]),_:1}),e(" is an optional parameter and can either be "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(" or "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(". When not set explicitly, the parameter defaults to "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(". When the parameter is set to "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(", Unipept will also return the name associated with a "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-term. See the "),l(d,{to:"#response",router:""},{default:t(()=>[e("response")]),_:1}),e(" section for an overview of the information fields returned. ")]),B,a("p",null,[l(i,null,{default:t(()=>[e("domains")]),_:1}),e(" is an optional parameter that can be used to order the "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms in groups according to their namespace (cellular component, molecular function, biological process). ")]),l(V,{title:"Performance penalty"},{default:t(()=>[a("p",null,[e(" Setting "),l(i,null,{default:t(()=>[e("extra")]),_:1}),e(" or "),l(i,null,{default:t(()=>[e("domains")]),_:1}),e(" to "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(" has a performance penalty inferred from additional database queries. Do not use this parameter unless the extra information fields are needed. ")])]),_:1})]),_:1}),l(_,{id:"response",title:"Response",class:"mt-5","large-title":""},{default:t(()=>[a("p",N,[e(" A list of "),l(n,null,{default:t(()=>[e("JSON")]),_:1}),e(" objects is returned. By default, each object contains the following information fields: "),a("ul",W,[a("li",null,[l(i,null,{default:t(()=>[e("peptide")]),_:1}),e(": the peptide that was searched for. ")]),a("li",null,[l(i,null,{default:t(()=>[e("total_protein_count")]),_:1}),e(": total amount of proteins matched with the given peptide. ")]),a("li",null,[l(i,null,{default:t(()=>[e("go")]),_:1}),e(": A list of "),l(n,null,{default:t(()=>[e("JSON")]),_:1}),e(" objects that each represent a "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-term associated with the current tryptic peptide. "),a("ul",null,[a("li",null,[l(i,null,{default:t(()=>[e("go_term")]),_:1}),e(": "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-term associated with the current tryptic peptide. ")]),a("li",null,[l(i,null,{default:t(()=>[e("protein_count")]),_:1}),e(": amount of proteins matched with the given tryptic peptide that are labeled with the current "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-term. ")]),a("li",null,[l(i,null,{default:t(()=>[e("name")]),_:1}),e(": optional, name of the "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-term. Included when the "),l(i,null,{default:t(()=>[e("extra")]),_:1}),e(" parameter is set to "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(". ")])])])]),e(" When the "),l(i,null,{default:t(()=>[e("domains")]),_:1}),e(" parameter is set to "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(", objects are placed in a group corresponding to their namespace and the objects are nested in an additional object. See the examples for more information on how to use this. ")])]),_:1}),l(_,{id:"parameters",title:"Parameters",class:"mt-5","large-title":""},{default:t(()=>[l(C,null,{default:t(()=>[X,a("tbody",null,[M,a("tr",null,[J,a("td",F,[e(" Equate isoleucine (I) and leucine (L). "),Z,a("div",$,[e(" Value: Must be "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(" or "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(" (default) ")])])]),a("tr",null,[ee,a("td",te,[e(" Return additional information fields if "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(". "),le,a("div",ae,[e(" Value: Must be "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(" or "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(" (default) ")])])]),a("tr",null,[ie,a("td",ne,[e(" Separates "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-namespaces and places objects in group associated with current namespace when "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(". "),se,a("div",oe,[e(" Value: Must be "),l(i,null,{default:t(()=>[e("true")]),_:1}),e(" or "),l(i,null,{default:t(()=>[e("false")]),_:1}),e(" (default) ")])])])])]),_:1})]),_:1}),ue,l(p,{title:"Retrieve the functional go-terms associated with a given tryptic peptide",response:y.value},{description:t(()=>[e(" This example retrieves all functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with the tryptic peptide "),a("i",null,[l(n,null,{default:t(()=>[e("AIPQLEVARPADAYETAEAYR")]),_:1})]),e(". The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=AIPQLEVARPADAYETAEAYR' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=AIPQLEVARPADAYETAEAYR ")]),_:1},8,["response"]),l(p,{id:"example2",class:"mt-5",title:"Retrieve the functional go-terms associated with each of multiple tryptic peptides",response:b.value},{description:t(()=>[e(" This example retrieves the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms for both the tryptic peptides "),a("i",null,[l(n,null,{default:t(()=>[e("AIPQLEVARPADAYETAEAYR")]),_:1})]),e(" and "),a("i",null,[l(n,null,{default:t(()=>[e("APVLSDSSCK")]),_:1})]),e(". The result is the same as the combination of this search and this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'input[]=APVLSDSSCK' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=AIPQLEVARPADAYETAEAYR&input[]=APVLSDSSCK ")]),_:1},8,["response"]),l(p,{class:"mt-5",title:"Retrieve the functional go-terms associated with a single tryptic peptide, while equating I and L",response:w.value},{description:t(()=>[e(" This example retrieves the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with the tryptic peptide "),a("i",null,[l(n,null,{default:t(()=>[e("APVLSDSSCK")]),_:1})]),e(". In searching, isoleucine (I) and leucinge (L) are considered equal. The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=APVISDSSCK' -d 'equate_il=true' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=APVISDSSCK&equate_il=true ")]),_:1},8,["response"]),l(p,{class:"mt-5",title:"Retrieve the functional go-terms associated with a single tryptic peptide, with extra information enabled",response:v.value},{description:t(()=>[e(" This example retrieves the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with the tryptic peptide "),a("i",null,[l(n,null,{default:t(()=>[e("AIPQLEVARPADAYETAEAYR")]),_:1})]),e(" including the name of each "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-term. The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'extra=true' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=AIPQLEVARPADAYETAEAYR&extra=true ")]),_:1},8,["response"]),l(p,{class:"mt-5",title:"Retrieve the functional go-terms associated with a single tryptic peptide, making a distinction between different domains",response:P.value},{description:t(()=>[e(" This example retrieves the functional "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-terms associated with the tryptic peptide "),a("i",null,[l(n,null,{default:t(()=>[e("APVLSDSSCK")]),_:1})]),e(" distributed over the distinct "),l(n,null,{default:t(()=>[e("GO")]),_:1}),e("-domains. The result is the same as this search with the Tryptic Peptide Analysis in the web interface. ")]),post:t(()=>[e(" curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v1/pept2go -d 'input[]=APVLSDSSCK' -d 'domains=true' ")]),get:t(()=>[e(" https://api.unipept.ugent.be/api/v1/pept2go.json?input[]=APVLSDSSCK&domains=true ")]),_:1},8,["response"]),l(q,{id:"try",class:"mt-5",response:T.value,command:"pept2go"},{default:t(()=>[l(G,null,{default:t(()=>[l(A,{cols:"12"},{default:t(()=>[re,l(j,{modelValue:c.value,"onUpdate:modelValue":o[0]||(o[0]=u=>c.value=u),class:"pt-0 mt-0",clearable:"","no-resize":"",filled:"","clear-icon":"mdi-close-circle"},null,8,["modelValue"])]),_:1}),l(A,{cols:"12",class:"dark-label"},{default:t(()=>[pe,l(g,{modelValue:m.value,"onUpdate:modelValue":o[1]||(o[1]=u=>m.value=u),color:"primary",inset:"",label:"extra",density:"compact","hide-details":""},null,8,["modelValue"]),l(g,{modelValue:h.value,"onUpdate:modelValue":o[2]||(o[2]=u=>h.value=u),color:"primary",inset:"",label:"equate_il",density:"compact","hide-details":""},null,8,["modelValue"]),l(g,{modelValue:f.value,"onUpdate:modelValue":o[3]||(o[3]=u=>f.value=u),color:"primary",inset:"",label:"domains",density:"compact","hide-details":""},null,8,["modelValue"])]),_:1}),l(A,{cols:"12"},{default:t(()=>[l(O,{class:"col-12 col-sm-2 float-end",color:"primary",onClick:S},{default:t(()=>[e(" Try it! ")]),_:1})]),_:1})]),_:1})]),_:1},8,["response"])]),_:1}))}});export{Ie as default};
