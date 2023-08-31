import{I as s}from"./InlineCode-b941903d.js";import{H as r}from"./HeaderBodyCard-f3b47b61.js";import{I as o}from"./Initialism-25eec5f3.js";import{B as d,S as i}from"./Boxed-1ca540a2.js";import{_ as m}from"./ParameterTable.vue_vue_type_script_setup_true_lang-ea4e3ff2.js";import{d as u,o as p,c as h,w as n,l as c,g as a,b as t,a as e}from"./index-fa2d734a.js";import{V as f}from"./VDivider-7dfa9365.js";import"./_plugin-vue_export-helper-c27b6911.js";import"./VCard-4d112d66.js";import"./VRow-781382bd.js";const _=a("h1",{class:"font-weight-light"}," umgap splitkmers ",-1),S={class:"font-weight-light"},g=a("i",null,"standard input",-1),T=a("i",null,"standard output",-1),V=a("b",null,"cat input.tsv",-1),D=a("b",null,"umgap splitkmers < input.tsv",-1),Q=u({__name:"MetagenomicsSplitKmersPage",setup(Y){const l=[{name:"-h / --help",description:"Prints help information"},{name:"-V / --version",description:"Prints version information"},{name:"-k / --length k",description:"The k-mer length [default: 9]"},{name:"-p / --prefix p",description:"Print only the (k-1)-mer suffixes of the k-mers starting with this character"}];return(I,k)=>(p(),h(c,null,{default:n(()=>[_,a("h3",S,[t(" Splits a "),e(o,null,{default:n(()=>[t("TSV")]),_:1}),t(" stream of peptides and taxon IDs into k-mers and taxon IDs ")]),e(f,{class:"my-2"}),a("p",null,[t(" The "),e(s,null,{default:n(()=>[t("umgap splitkmers")]),_:1}),t(" command takes tab-separated taxon IDs and protein sequences and outputs the k-mers mapped to the taxon IDs. ")]),e(r,{id:"usage",title:"usage","large-title":""},{default:n(()=>[a("p",null,[t(" The input is given on "),g,t(" and should be a "),e(o,null,{default:n(()=>[t("TSV")]),_:1}),t(" formatted stream of taxon IDs and a protein sequence from this taxon. The output will be written to "),T,t(" and consists of a "),e(o,null,{default:n(()=>[t("TSV")]),_:1}),t(" formatted stream of k-mers mapped to the taxa in which they occur. The k-mer length is configurable with the "),e(s,null,{default:n(()=>[t("-k")]),_:1}),t(" option, and is 9 by default. ")]),a("p",null,[t(" This output stream is ready to be grouped by K-mer by sorting and then aggregated into a searchable index, with the "),e(s,null,{default:n(()=>[t("sort")]),_:1}),t(", "),e(s,null,{default:n(()=>[t("umgap joinkmers")]),_:1}),t(" and "),e(s,null,{default:n(()=>[t("umgap buildindex")]),_:1}),t(" commands. ")]),e(d,{style:{"max-height":"fit-content"}},{default:n(()=>[a("pre",null,[t(""),e(i,null,{default:n(()=>[t("$")]),_:1}),t(),V,t(`
654924	MNAKYDTDQGVGRMLFLGTIGLAVVVGGLMAYGYYYDGKTPSSGTSFHTASPSFSSRYRY
176652	MIKLFCVLAAFISINSACQSSHQQREEFTVATYHSSSICTTYCYSNCVVASQHKGLNVESYTCDKPDPYGRETVCKCTLIKCHDI
`),e(i,null,{default:n(()=>[t("$")]),_:1}),t(),D,t(`
MNAKYDTDQ	654924
NAKYDTDQG	654924
AKYDTDQGV	654924
KYDTDQGVG	654924
YDTDQGVGR	654924
...
SPSFSSRYR	654924
PSFSSRYRY	654924
MIKLFCVLA	176652
IKLFCVLAA	176652
KLFCVLAAF	176652
...
`)])]),_:1}),e(m,{class:"mt-5 mb-3",parameters:l})]),_:1})]),_:1}))}});export{Q as default};
