import{H as o}from"./HeaderBodyCard-3295d4c5.js";import{d as a,o as i,c as n,w as t,l as r,a as l,g as e,b as s}from"./index-eea28a33.js";import"./VCard-9d59c194.js";import"./_plugin-vue_export-helper-c27b6911.js";const h=e("h1",{class:"font-weight-light"}," Frequently Asked Questions (FAQ) ",-1),d=e("h3",{class:"font-weight-light mb-2"}," Check this page for a list of questions or issues that arise frequently (and how to find a proper solution). ",-1),c=e("h3",{class:"font-weight-bold"}," Q: Why does the analysis using a large targeted protein reference database fail on Windows? ",-1),u=e("p",null,[s(" A: This is a known issue on Windows that's caused by a default limit on the amount of storage space that can be used by Docker on Windows systems. Docker on Windows uses a virtual hard drive (this is just a file that's situated somewhere on your machine) that has a fixed, maximum size (by default this is 256GiB). This size can be increased by creating a new virtual hard drive and moving all contents from the previous one to the one. Doing so is, however, quite technical and is not recommended for non-technical users. Instead, we recommend to use a Linux system (such as Ubuntu) or a Mac in this case. If you do want to move the virtual hard drive on Windows, you can follow the steps in "),e("a",{class:"link",href:"https://learn.microsoft.com/en-us/windows/wsl/vhd-size"},"this guide"),s(". ")],-1),p=e("h3",{class:"font-weight-bold"}," Q: Is Docker always required when using the Unipept Desktop application? ",-1),f=e("p",null," A: No, a valid Docker installation is only required when you want to use a targeted protein reference during your metaproteomic analyses. ",-1),w=e("h3",{class:"font-weight-bold"}," Q: What happens when my internet connection drops during an analysis? ",-1),m=e("p",null," A: If some part of the analysis fails due to a dropped internet connection, the application will keep track of the peptides that were not processed and will try again after a few minutes. If the connection is still not working by then, the analysis will fail completely and you will be notified. As long as the internet connection only drops for a short period of time, the analysis will recover from this and finish without issues. ",-1),y=e("h3",{class:"font-weight-bold"}," Q: Does the application need to restart from scratch when an analysis fails after a few minutes? ",-1),_=e("p",null," A: No. The application will keep previously processed analysis results for some time. If you restart the analysis after a failure, the application will try to recover the results that were already processed and will restart from the point where it last stopped. ",-1),Q=a({__name:"DesktopFAQPage",setup(g){return(k,b)=>(i(),n(r,null,{default:t(()=>[h,d,l(o,{id:"faq",title:"Frequently Asked Questions","large-title":""},{default:t(()=>[c,u,p,f,w,m,y,_]),_:1})]),_:1}))}});export{Q as default};
