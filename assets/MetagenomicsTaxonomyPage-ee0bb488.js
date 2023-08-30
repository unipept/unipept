import{I as o}from"./InlineCode-67d03729.js";import{H as r}from"./HeaderBodyCard-3295d4c5.js";import{I as s}from"./Initialism-440d96b0.js";import{B as l,S as i}from"./Boxed-9f9dd66a.js";import{_ as d}from"./ParameterTable.vue_vue_type_script_setup_true_lang-eb31a2e0.js";import{d as m,o as _,c as p,w as n,l as c,g as t,b as e,a}from"./index-eea28a33.js";import{V as h}from"./VDivider-834b9f8e.js";import"./_plugin-vue_export-helper-c27b6911.js";import"./VCard-9d59c194.js";import"./VRow-94e3f3e6.js";const f=t("h1",{class:"font-weight-light"}," umgap taxonomy ",-1),g={class:"font-weight-light"},b=t("i",null,"standard input",-1),y=t("i",null,"standard output",-1),x=t("p",null," A taxonomy file must be passed as argument. ",-1),k=t("b",null,"cat input.txt",-1),S=t("b",null,"umgap taxonomy taxons.tsv < input.fa",-1),T=t("b",null,"cat input2.fa",-1),v=t("b",null,"umgap taxonomy -H taxons.tsv < input2.fa",-1),D=t("b",null,"cat input3.fa",-1),I=t("b",null,"umgap taxonomy -a taxons.tsv < input3.fa",-1),M=m({__name:"MetagenomicsTaxonomyPage",setup(V){const u=[{name:"-h / --help",description:"Prints help information"},{name:"-V / --version",description:"Prints version information"},{name:"-a / --all",description:"Show the full lineage of a taxon"},{name:"-H / --no-header",description:"Do not output the TSV header"}];return(C,w)=>(_(),p(c,null,{default:n(()=>[f,t("h3",g,[e(" Includes the taxonomic information in a stream of "),a(s,null,{default:n(()=>[e("NCBI")]),_:1}),e(" taxon IDs ")]),a(h,{class:"my-2"}),t("p",null,[e(" The umgap taxonomy command takes one or more "),a(s,null,{default:n(()=>[e("NCBI")]),_:1}),e(" taxon IDs as input, searches for them in the taxonomy and outputs more information about them in a "),a(s,null,{default:n(()=>[e("TSV")]),_:1}),e(" format. ")]),a(r,{id:"usage",title:"usage","large-title":""},{default:n(()=>[t("p",null,[e(" The input is given on "),b,e(" and may be any sequence of "),a(s,null,{default:n(()=>[e("FASTA")]),_:1}),e(" headers and/or lines containing a single "),a(s,null,{default:n(()=>[e("NCBI")]),_:1}),e(" taxon ID. A "),a(s,null,{default:n(()=>[e("TSV")]),_:1}),e(" header is printed to "),y,e(". The "),a(s,null,{default:n(()=>[e("FASTA")]),_:1}),e(" headers (any line starting with a "),a(o,null,{default:n(()=>[e(">")]),_:1}),e(") are just copied over. Each of the taxon IDs on the other lines is looked up in a taxonomy, and the ID, name and rank of the taxon are written out separated by tabs. ")]),x,a(l,{style:{"max-height":"fit-content"}},{default:n(()=>[t("pre",null,[e(""),a(i,null,{default:n(()=>[e("$")]),_:1}),e(),k,e(`
2026807
888268
186802
1598
1883
`),a(i,null,{default:n(()=>[e("$")]),_:1}),e(),S,e(`
taxon_id	taxon_name	taxon_rank
2026807	Zetaproteobacteria bacterium	species
888268	Dichanthelium oligosanthes	species
186802	Clostridiales	order
1598	Lactobacillus reuteri	species
1883	Streptomyces	genus
`)])]),_:1}),t("p",null,[e(" The "),a(o,null,{default:n(()=>[e("-H")]),_:1}),e(" flag can be used to suppress the "),a(s,null,{default:n(()=>[e("TSV")]),_:1}),e(" header, for instance when dealing with "),a(s,null,{default:n(()=>[e("FASTA")]),_:1}),e(" input. ")]),a(l,null,{default:n(()=>[t("pre",null,[e(""),a(i,null,{default:n(()=>[e("$")]),_:1}),e(),T,e(`
>header1
2026807
888268
186802
1598
1883
`),a(i,null,{default:n(()=>[e("$")]),_:1}),e(),v,e(`
>header1
2026807	Zetaproteobacteria bacterium	species
888268	Dichanthelium oligosanthes	species
186802	Clostridiales	order
1598	Lactobacillus reuteri	species
1883	Streptomyces	genus
`)])]),_:1}),t("p",null,[e(" The "),a(o,null,{default:n(()=>[e("-a")]),_:1}),e(" flag can be used to request a complete ranked lineage. ")]),a(l,null,{default:n(()=>[t("pre",null,[e(""),a(i,null,{default:n(()=>[e("$")]),_:1}),e(),D,e(`
888268
`),a(i,null,{default:n(()=>[e("$")]),_:1}),e(),I,e(`
taxon_id	taxon_name	taxon_rank	superkingdom_id	superkingdom_name	kingdom_id	kingdom_name	subkingdom_id	subkingdom_name	superphylum_id	superphylum_name	phylum_id	phylum_name	subphylum_id	subphylum_name	superclass_id	superclass_name	class_id	class_name	subclass_id	subclass_name	infraclass_id	infraclass_name	superorder_id	superorder_name	order_id	order_name	suborder_id	suborder_name	infraorder_id	infraorder_name	parvorder_id	parvorder_name	superfamily_id	superfamily_name	family_id	family_name	subfamily_id	subfamily_name	tribe_id	tribe_name	subtribe_id	subtribe_name	genus_id	genus_name	subgenus_id	subgenus_name	species_group_id	species_group_name	species_subgroup_id	species_subgroup_name	species_id	species_name	subspecies_id	subspecies_name	varietas_id	varietas_name	forma_id	forma_name
888268	Dichanthelium oligosanthes	species	2759	Eukaryota	33090	Viridiplantae					35493	Streptophyta	131221	Streptophytina			3398	Magnoliopsida	1437197	Petrosaviidae					38820	Poales									4479	Poaceae	147369	Panicoideae	147428	Paniceae	1648011	Dichantheliinae	161620	Dichanthelium							888268	Dichanthelium oligosanthes
`)])]),_:1}),a(d,{class:"mt-5 mb-3",parameters:u})]),_:1})]),_:1}))}});export{M as default};
