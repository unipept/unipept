import{H as a}from"./HeaderBodyCard-f3b47b61.js";import{d as n,o as i,c as l,w as o,l as r,a as s,g as e,V as c,u as d,b as t}from"./index-fa2d734a.js";import"./VCard-4d112d66.js";import"./_plugin-vue_export-helper-c27b6911.js";const h="/unipept/assets/desktop_project_management_overview-b577d508.png",p=e("h1",{class:"font-weight-light"}," Project Management ",-1),u=e("h3",{class:"font-weight-light mb-2"}," An important central concept in the Unipept Desktop application is the project. A project is a collection of studies and assays and can be used to organise a set of experiments that belong together. ",-1),f=e("p",null," Central to the working of Unipept Desktop is the concept of a project. A project is simply a collection of studies and assays and is physically represented on your hard disk as a folder containing a set of files and folders. All inputs and analysis results that belong to the project will be stored in this folder which means that analyses performed earlier can easily be reloaded and reused. Since all required information is stored in the project folder, these projects can also be shared with other researchers around the globe by simply sending them a copy of the project's folder. ",-1),m=e("h3",null,"Project structure",-1),y=e("p",null," A project will always consists of a collection of studies that, in turn, contain a collection of assays. Each of these terms is defined in a specific way: ",-1),g=e("ul",null,[e("li",null,[e("span",{class:"font-weight-bold"},"Project:"),t(" A project is a collection of studies, and every study is a collection of assays. This terminology adheres to the definitions found in the "),e("a",{class:"link",href:"https://isa-specs.readthedocs.io/en/latest/isatab.html"},"ISA-tab standard"),t(". ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Study:"),t(" A study is a collection of assays that are somehow related. They, for example, all originate from the same object under study. Every study needs to be uniquely named, no two studies with the same name in one project can exist! The application will inform you of a conflict, should one arise. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"Assay:"),t(" An assay corresponds directly to a list of peptides and the configuration of search settings for this assay. Note that a project can thus contain multiple assays with the same peptide content, but with a different search configuration. Every assay should be uniquely named within a study. Assays with the same name can only occur within one project, if they belong to different studies. ")])],-1),w=e("h3",{class:"mt-3"}," Physical representation ",-1),_=e("p",null," As described above, a single project will correspond to one root folder on your hard drive and will always contain at least the following files and folders: ",-1),b=e("ul",null,[e("li",null,[e("span",{class:"font-weight-bold"},"metadata.sqlite:"),t(" This file is a SQLite-database that keeps track of the analysis results and metadata that belongs to this project. ")]),e("li",null,[e("span",{class:"font-weight-bold"},"subfolder per study:"),t(" One folder per study is present. A study's name is derived from the folder's name. The study's name in the application will change if you change the name of this folder. "),e("ul",null,[e("li",null,[e("span",{class:"font-weight-bold"},"file per assay:"),t(' The study folder also contains one file per assay that belongs to this study. These files end in the ".pep" extension and contain one peptide per line. ')])])])],-1),j={class:"d-flex justify-center ma-6"},v=e("p",null,' The project management page is the central hub for managing projects. It allows you to create new projects, open existing projects, and delete projects. The project management page is the first page that you will see when you start the application and will also be shown whenever you click on the "home" button in the sidebar. ',-1),k=e("h3",null,"The demo project",-1),T=e("p",null,' If this is the first time that you are using the application, it is recommended that you start by opening the demo project and browse between the different features and pages of the app. The demo project contains some studies and pre-loaded assays that showcase most capabilities of Unipept. In order to open the demo project, click on the blue "Open demo project" button on the home page. ',-1),A=e("h3",null,"Creating a project",-1),x=e("p",null,' To create a new project, click on the "Create new project" button on the home page. This will open a dialog that allows you to select an empty folder on your hard drive where you want the project to live. If the folder you selected already contains contents, the application will display an error. ',-1),I=e("h3",null,"Opening a project",-1),C=e("p",null,` A list of the most recently created and opened projects is always shown on the home page. The simplest way of opening a project is to simply click on one of the items in this list. If, however, you decide to continue with a project that you have not opened for a while (or that has been downloaded from an external source), you should manually look for it on your hard drive. To do so, click on the blue text "Open a project that's not shown in this list" and select the wanted folder in the dialog that pops up. `,-1),N=n({__name:"DesktopProjectManagementPage",setup(P){return(O,V)=>(i(),l(r,null,{default:o(()=>[p,u,s(a,{id:"overview",title:"Overview",class:"mb-5","large-title":""},{default:o(()=>[f,m,y,g,w,_,b]),_:1}),s(a,{id:"managing_projects",title:"Managing projects",class:"mb-5","large-title":""},{default:o(()=>[e("div",j,[s(c,{src:d(h),"max-width":"800",contain:"",eager:"",class:"screenshot"},null,8,["src"])]),v,k,T,A,x,I,C]),_:1})]),_:1}))}});export{N as default};
