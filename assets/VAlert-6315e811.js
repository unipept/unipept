import{bX as I,s as $,al as L,a5 as z,bB as R,ad as w,bT as E,aM as F,aN as O,aO as M,av as N,aw as j,aP as K,x as Q,y as U,A as o,ax as X,aS as q,bD as G,af as H,bV as J,aQ as W,aR as Y,aT as Z,bE as p,ag as ee,ao as ae,a as t,aU as te,ar as le,as as d,K as se,m as ne}from"./index-eea28a33.js";const oe=I("v-alert-title"),re=["success","info","warning","error"],ie=$({border:{type:[Boolean,String],validator:e=>typeof e=="boolean"||["top","end","bottom","start"].includes(e)},borderColor:String,closable:Boolean,closeIcon:{type:L,default:"$close"},closeLabel:{type:String,default:"$vuetify.close"},icon:{type:[Boolean,String,Function,Object],default:null},modelValue:{type:Boolean,default:!0},prominent:Boolean,title:String,text:String,type:{type:String,validator:e=>re.includes(e)},...z(),...R(),...w(),...E(),...F(),...O(),...M(),...N(),...j(),...K({variant:"flat"})},"VAlert"),ue=Q()({name:"VAlert",props:ie(),emits:{"click:close":e=>!0,"update:modelValue":e=>!0},setup(e,v){let{emit:m,slots:a}=v;const r=U(e,"modelValue"),s=o(()=>{if(e.icon!==!1)return e.type?e.icon??`$${e.type}`:e.icon}),y=o(()=>({color:e.color??e.type,variant:e.variant})),{themeClasses:b}=X(e),{colorClasses:f,colorStyles:k,variantClasses:P}=q(y),{densityClasses:V}=G(e),{dimensionStyles:C}=H(e),{elevationClasses:g}=J(e),{locationStyles:x}=W(e),{positionClasses:S}=Y(e),{roundedClasses:_}=Z(e),{textColorClasses:T,textColorStyles:A}=p(ee(e,"borderColor")),{t:B}=ae(),i=o(()=>({"aria-label":B(e.closeLabel),onClick(n){r.value=!1,m("click:close",n)}}));return()=>{const n=!!(a.prepend||s.value),h=!!(a.title||e.title),D=!!(a.close||e.closable);return r.value&&t(e.tag,{class:["v-alert",e.border&&{"v-alert--border":!!e.border,[`v-alert--border-${e.border===!0?"start":e.border}`]:!0},{"v-alert--prominent":e.prominent},b.value,f.value,V.value,g.value,S.value,_.value,P.value,e.class],style:[k.value,C.value,x.value,e.style],role:"alert"},{default:()=>{var c,u;return[te(!1,"v-alert"),e.border&&t("div",{key:"border",class:["v-alert__border",T.value],style:A.value},null),n&&t("div",{key:"prepend",class:"v-alert__prepend"},[a.prepend?t(d,{key:"prepend-defaults",disabled:!s.value,defaults:{VIcon:{density:e.density,icon:s.value,size:e.prominent?44:28}}},a.prepend):t(le,{key:"prepend-icon",density:e.density,icon:s.value,size:e.prominent?44:28},null)]),t("div",{class:"v-alert__content"},[h&&t(oe,{key:"title"},{default:()=>{var l;return[((l=a.title)==null?void 0:l.call(a))??e.title]}}),((c=a.text)==null?void 0:c.call(a))??e.text,(u=a.default)==null?void 0:u.call(a)]),a.append&&t("div",{key:"append",class:"v-alert__append"},[a.append()]),D&&t("div",{key:"close",class:"v-alert__close"},[a.close?t(d,{key:"close-defaults",defaults:{VBtn:{icon:e.closeIcon,size:"x-small",variant:"text"}}},{default:()=>{var l;return[(l=a.close)==null?void 0:l.call(a,{props:i.value})]}}):t(se,ne({key:"close-btn",icon:e.closeIcon,size:"x-small",variant:"text"},i.value),null)])]}})}}});export{ue as V};
