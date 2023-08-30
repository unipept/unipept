import{L as V,M as W,O as A,T as B,N as h,P as x,Q as U,i as L,R as d,S as Y,U as Z,W as $,Z as j,X as F,Y as K,_ as Q,$ as X,a0 as H,a1 as J,d as _,D as ee,o as q,e as oe,a as I,u as c,a2 as te,a3 as ne,a4 as se,c as ae}from"./index-eea28a33.js";import{u as re,a as ce}from"./ConfigurationStore-a619500c.js";const le=V("single-analysis",()=>{const o=re(),l=new W(o.unipeptApiUrl,o.peptideDataBatchSize,o.cleavageBatchSize,o.parallelRequests);A.setup(o.unipeptApiUrl,o.ncbiBatchSize);const p=new A;B.setup(o.unipeptApiUrl,o.goBatchSize);const r=new B;h.setup(o.unipeptApiUrl,o.ecBatchSize);const g=new h;x.setup(o.unipeptApiUrl,o.interproBatchSize);const a=new x;U.setup(o.unipeptApiUrl);const P=new U,e=L({peptide:"",equateIl:!1,analysisInProgress:!1,error:{status:!1,message:"",object:null},ecTree:{count:0,selfCount:0}}),w=t=>e.value.peptide=t,O=t=>e.value.equateIl=t,n=t=>e.value.analysisInProgress=t;return{assay:e,analyse:async(t,i)=>{w(t),O(i),n(!0);const T=new Map;T.set(t,1);const z=new d(T),[M,ue]=await l.process(z,!1,i),s=new Y(P);await s.compute(t,i);const y=new Map;for(const u of s.getProteins())y.set(u.organism,1);y.set(s.getLca(),1);for(const u of s.getCommonLineage())y.set(u,1);const k=await new J(p).getOntology(new d(y)),C=new Map;for(const u of s.getProteins())C.set(u.organism,(C.get(u.organism)||0)+1);const D=new d(C),R=new Z(D,k),f=new $(t,i,r);await f.compute(s);const E=await new j(r).getOntology(f.getCountTable()),m=new F(t,i,g);await m.compute(s);const S=await new K(g).getOntology(m.getCountTable()),G=Q(m.getCountTable(),S),b=new X(t,i,a);await b.compute(s);const N=await new H(a).getOntology(b.getCountTable());e.value.peptideData=M.get(t),e.value.ncbiOntology=k,e.value.proteinProcessor=s,e.value.goProteinCountTableProcessor=f,e.value.goOntology=E,e.value.ecProteinCountTableProcessor=m,e.value.ecOntology=S,e.value.interproProteinCountTableProcessor=b,e.value.interproOntology=N,e.value.taxaTree=R,e.value.ecTree=G,n(!1)}}}),ie=_({__name:"SinglePeptideAnalysisWrapper",props:{peptide:{},equateIl:{type:Boolean}},setup(o){const{peptide:l,equateIl:p}=o,r=le(),{toggle:g}=ce(),a=L("matched-proteins");r.analyse(l,p),ee();const P=()=>{a.value="go-terms"},e=()=>{a.value="ec-numbers"},w=()=>{a.value="interpro"};return(O,n)=>(q(),oe("div",null,[I(c(te),{class:"my-5",assay:c(r).assay,"toggle-fullcreen":c(g),"go-link":"","ec-link":"","interpro-link":"",onGoLinkClicked:n[0]||(n[0]=()=>P()),onEcLinkClicked:n[1]||(n[1]=()=>e()),onInterproLinkClicked:n[2]||(n[2]=()=>w())},null,8,["assay","toggle-fullcreen"]),I(c(ne),{id:"Analysis",assay:c(r).assay,tab:a.value,onTabUpdate:n[3]||(n[3]=v=>a.value=v)},null,8,["assay","tab"])]))}}),Ce=_({__name:"TrypticPeptideAnalysisResultPage",setup(o){const l=se();return(p,r)=>(q(),ae(ie,{class:"mb-5",peptide:c(l).params.sequence,"equate-il":c(l).query.equate},null,8,["peptide","equate-il"]))}});export{Ce as default};
