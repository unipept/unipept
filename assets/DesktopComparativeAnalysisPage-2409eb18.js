import{H as i}from"./HeaderBodyCard-3295d4c5.js";import{d as c,o as r,c as h,w as s,l as u,a,g as e,V as o,u as n,b as t}from"./index-eea28a33.js";import{V as l}from"./VAlert-6315e811.js";import"./VCard-9d59c194.js";import"./_plugin-vue_export-helper-c27b6911.js";const p="/assets/desktop_comparison_overview-e9363f95.png",d="/assets/desktop_comparison_intra_assay_overview-0e27a3bc.png",m="/assets/desktop_comparison_intra_assay_result-e3411566.png",f="/assets/desktop_comparison_project_explorer-3a4aa1bb.png",y="/assets/desktop_comparison_heatmap-b6af413c.png",w=e("h1",{class:"font-weight-light"}," Comparative Analysis ",-1),g=e("h3",{class:"font-weight-light mb-2"}," Select features and compare them within a single assay or over multiple assays. ",-1),_={class:"d-flex justify-center"},b=e("p",null," Unipept offers a powerful tool for comparing features over multiple assays or within a single assay. This tool can be used to gain insight into the shifts in population and function when studying multiple conditions or changing environmental parameters. Unipept allows you to construct an interactive heatmap that is highly configurable. On this page, we will guide you through the different steps that are required to construct such a heatmap. ",-1),v=e("p",null," The intra-assay comparison component of Unipept Desktop allows you to compare different features with each other, within a single assay. This is useful when you want to compare the relative abundance of organisms or functions in the assay. Follow the steps below to start constructing your own inter-assay comparative heatmap. ",-1),x=e("h3",null,"Navigate to the heatmap wizard",-1),k=e("p",null,' First, make sure that you are situated on the "Single assay analysis" page. This page can be reached by clicking the second button in the sidebar (indicated by a single test tube). On the middle of the page, you will find all of the taxonomic analysis results of the assay. Click on the "heatmap" button, directly above the visualizations, to navigate to the heatmap wizard. ',-1),z={class:"d-flex justify-center"},T=e("h3",null,"Select a data source for the horizontal axis",-1),C=e("p",null,' A heatmap always consists of two axes. For the single-assay comparison, you are free to chose what you want to compare with each other and you are thus required to select a set of features for each axis individually. The first step is to select a data source for the horizontal axis. This can be either a collection of features from taxonomic or functional origin. First select a data source by clicking on the first dropdown (labeled by "Horizontal data source"), then tick the checkbox in front of the features you want to include in the heatmap. ',-1),I=e("span",{class:"font-weight-bold"},"Remark:",-1),A=e("span",{class:"font-weight-bold"},"all",-1),D=e("p",null,` After you're done selecting the features for the horizontal axis, click on the "next" button. The wizard will now automatically navigate to the next step. `,-1),O=e("h3",{class:"mt-6"}," Select a data source for the vertical axis ",-1),V=e("p",null," The second step in the wizard is identical to the first step and consists of picking features for the vertical heatmap axis. Select a distinct set of features for the vertical axis in order to construct a useful heatmap visualization. ",-1),j=e("h3",{class:"mt-6"}," Pick a normalization type ",-1),F=e("p",null," The last step of the heatmap construction wizard consists of selecting the appropriate normalization type. You can choose between the following options: ",-1),N=e("ul",{class:"mb-2"},[e("li",null,[e("span",{class:"font-weight-bold"},"All:"),t(" compute the largest values over all cells in the heatmap and normalize all cells according to this one value. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Rows:"),t(" compute the largest value for each row in the heatmap and normalize all cells on a row-by-row basis. The relative values between distinct rows can not directly be compared in this case (but values within one row can). ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Columns:"),t(" compute the largest vlaue for each column in the heatmap and normalize all cells on a column-by-column basis. The relative vales between distinct columns can not directly be compared in this case (but values within one column can). ")])],-1),P=e("p",null,` After you're done, click the "next" button once again. The heatmap that you have constructed should appear now. `,-1),B={class:"d-flex justify-center"},R=e("p",null," The inter-assay comparison component of Unipept Desktop allows you to compare different features over multiple assays and investigate how the relative abundance of organisms or functions changes between different conditions of an experiment. Follow the steps below to start construction your own intra-assay comparative heatmap visualization. ",-1),S=e("h3",{class:"mt-6"}," Assay selection ",-1),U=e("p",null," The first step in the process of constructing a heatmap consists of selecting a collection of assays for which you want to compare features. You can select as many assays as you'd like, but note that computation time will go up with the number of assays you select. You can select an assay by clicking the little checkbox in front of the assay item in the project explorer, or you can select multiple assays at once by clicking the checkbox in front of the study name (also in the project explorer, on the left side of the window). ",-1),H={class:"d-flex justify-center"},q=e("h3",{class:"mt-6"}," Data source selection ",-1),E=e("p",null," Once you have selected a collection of assays that you want to include in the comparison, you need to choose a set of features that you want to compare between the different assays. A data source is one of the following: ",-1),Y=e("ul",null,[e("li",null,[e("span",{class:"font-weight-bold"},"NCBI Taxonomy:"),t(" choose from a list of all organisms that are identified in the selected assays. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Gene Ontology:"),t(" choose from a list of all Gene Ontology terms that are identified in the selected assays. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Enzyme Commission:"),t(" choose from a list of all Enzyme Commission numbers that are identified in the selected assays. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"InterPro:"),t(" choose from a list of all InterPro-entries that are identified in the selected assays. ")])],-1),G=e("span",{class:"font-weight-bold"},"Remark:",-1),J=e("h3",{class:"mt-6"}," Normalization ",-1),K=e("p",null," The second step required for the heatmap construction consists of choosing which type of normalization should be applied to the input data. There are three normalization types available: ",-1),L=e("ul",null,[e("li",null,[e("span",{class:"font-weight-bold"},"All:"),t(" compute the largest values over all cells in the heatmap and normalize all cells according to this one value. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Rows:"),t(" compute the largest value for each row in the heatmap and normalize all cells on a row-by-row basis. The relative values between distinct rows can not directly be compared in this case (but values within one row can). ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Columns:"),t(" compute the largest vlaue for each column in the heatmap and normalize all cells on a column-by-column basis. The relative vales between distinct columns can not directly be compared in this case (but values within one column can). ")])],-1),M=e("h3",{class:"mt-6"}," Visualization ",-1),Q=e("p",null," Once all of the previous steps have properly been configured, the end result will be shown here. If everything goes well, you will be greeted by an interactive heatmap. ",-1),W=e("div",null,[e("span",{class:"font-weight-bold"},"Figure 2:"),t(" an example of a heatmap constructed using the inter-assay comparative pipeline of the Unipept Desktop application. ")],-1),ne=c({__name:"DesktopComparativeAnalysisPage",setup(X){return(Z,$)=>(r(),h(u,null,{default:s(()=>[w,g,a(i,{id:"overview",title:"Overview",class:"mb-5","large-title":""},{default:s(()=>[e("div",_,[a(o,{src:n(p),"max-width":"800",contain:"",eager:"",class:"screenshot ma-6"},null,8,["src"])]),b]),_:1}),a(i,{id:"intra_assay_comparison",title:"Intra-assay comparison",class:"mb-5","large-title":""},{default:s(()=>[v,x,k,e("div",z,[a(o,{src:n(d),"max-width":"800",contain:"",eager:"",class:"screenshot ma-6"},null,8,["src"])]),T,C,a(l,{color:"info",variant:"outlined",class:"mb-6"},{default:s(()=>[I,t(' Ticking the "select all" checkbox on the top left of the selection table will only select all features on the current page. A button that allows you to select '),A,t(" features of this data source will appear once you have selected at least one feature. ")]),_:1}),D,O,V,j,F,N,P,e("div",B,[a(o,{src:n(m),"max-width":"800",contain:"",eager:"",class:"screenshot ma-6"},null,8,["src"])])]),_:1}),a(i,{id:"inter_assay_comparison",title:"Inter-assay comparison",class:"mb-5","large-title":""},{default:s(()=>[R,S,U,e("div",H,[a(o,{src:n(f),"max-width":"800",contain:"",eager:"",class:"screenshot"},null,8,["src"])]),q,E,Y,a(l,{color:"info",variant:"outlined",class:"mt-2"},{default:s(()=>[G,t(" Please note that you can only compare features from one datasource at a time. It's not possible to mix features from distinct data sources and visualize them at the same time in the heatmap. ")]),_:1}),J,K,L,M,Q,e("div",null,[a(o,{src:n(y),"max-width":"800",contain:"",eager:"",class:"ma-6"},null,8,["src"]),W])]),_:1})]),_:1}))}});export{ne as default};
