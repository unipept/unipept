import{s as G,am as Z,a5 as L,b$ as J,av as T,aw as z,aP as E,x as F,ax as R,az as Q,bj as W,ag as r,B as ee,a as l,al as y,bH as B,bS as ae,bB as le,bT as te,aD as ne,aO as se,bY as ie,c0 as ce,bC as de,ao as oe,bU as ue,aS as re,bD as ve,bV as fe,aT as me,c1 as pe,y as ke,aF as be,bZ as he,A as C,aB as x,aC as ye,aU as Ce,bK as Ve,ar as v,as as f,aH as ge,F as D,m as Ie}from"./index-eea28a33.js";import{d as _}from"./VCard-9d59c194.js";const w=Symbol.for("vuetify:v-chip-group"),Pe=G({column:Boolean,filter:Boolean,valueComparator:{type:Function,default:Z},...L(),...J({selectedClass:"v-chip--selected"}),...T(),...z(),...E({variant:"tonal"})},"VChipGroup");F()({name:"VChipGroup",props:Pe(),emits:{"update:modelValue":e=>!0},setup(e,m){let{slots:c}=m;const{themeClasses:o}=R(e),{isSelected:t,select:p,next:k,prev:b,selected:h}=Q(e,w);return W({VChip:{color:r(e,"color"),disabled:r(e,"disabled"),filter:r(e,"filter"),variant:r(e,"variant")}}),ee(()=>l(e.tag,{class:["v-chip-group",{"v-chip-group--column":e.column},o.value,e.class],style:e.style},{default:()=>{var u;return[(u=c.default)==null?void 0:u.call(c,{isSelected:t,select:p,next:k,prev:b,selected:h.value})]}})),{}}});const Se=G({activeClass:String,appendAvatar:String,appendIcon:y,closable:Boolean,closeIcon:{type:y,default:"$delete"},closeLabel:{type:String,default:"$vuetify.close"},draggable:Boolean,filter:Boolean,filterIcon:{type:String,default:"$complete"},label:Boolean,link:{type:Boolean,default:void 0},pill:Boolean,prependAvatar:String,prependIcon:y,ripple:{type:[Boolean,Object],default:!0},text:String,modelValue:{type:Boolean,default:!0},onClick:B(),onClickOnce:B(),...ae(),...L(),...le(),...te(),...ne(),...se(),...ie(),...ce(),...T({tag:"span"}),...z(),...E({variant:"tonal"})},"VChip"),xe=F()({name:"VChip",directives:{Ripple:de},props:Se(),emits:{"click:close":e=>!0,"update:modelValue":e=>!0,"group:selected":e=>!0,click:e=>!0},setup(e,m){let{attrs:c,emit:o,slots:t}=m;const{t:p}=oe(),{borderClasses:k}=ue(e),{colorClasses:b,colorStyles:h,variantClasses:u}=re(e),{densityClasses:$}=ve(e),{elevationClasses:O}=fe(e),{roundedClasses:K}=me(e),{sizeClasses:M}=pe(e),{themeClasses:j}=R(e),V=ke(e,"modelValue"),a=be(e,w,!1),s=he(e,c),H=C(()=>e.link!==!1&&s.isLink.value),i=C(()=>!e.disabled&&e.link!==!1&&(!!a||e.link||s.isClickable.value)),U=C(()=>({"aria-label":p(e.closeLabel),onClick(n){n.stopPropagation(),V.value=!1,o("click:close",n)}}));function g(n){var d;o("click",n),i.value&&((d=s.navigate)==null||d.call(s,n),a==null||a.toggle())}function q(n){(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),g(n))}return()=>{const n=s.isLink.value?"a":e.tag,d=!!(e.appendIcon||e.appendAvatar),N=!!(d||t.append),X=!!(t.close||e.closable),I=!!(t.filter||e.filter)&&a,P=!!(e.prependIcon||e.prependAvatar),Y=!!(P||t.prepend),S=!a||a.isSelected.value;return V.value&&x(l(n,{class:["v-chip",{"v-chip--disabled":e.disabled,"v-chip--label":e.label,"v-chip--link":i.value,"v-chip--filter":I,"v-chip--pill":e.pill},j.value,k.value,S?b.value:void 0,$.value,O.value,K.value,M.value,u.value,a==null?void 0:a.selectedClass.value,e.class],style:[S?h.value:void 0,e.style],disabled:e.disabled||void 0,draggable:e.draggable,href:s.href.value,tabindex:i.value?0:void 0,onClick:g,onKeydown:i.value&&!H.value&&q},{default:()=>{var A;return[Ce(i.value,"v-chip"),I&&l(Ve,{key:"filter"},{default:()=>[x(l("div",{class:"v-chip__filter"},[t.filter?l(f,{key:"filter-defaults",disabled:!e.filterIcon,defaults:{VIcon:{icon:e.filterIcon}}},t.filter):l(v,{key:"filter-icon",icon:e.filterIcon},null)]),[[ge,a.isSelected.value]])]}),Y&&l("div",{key:"prepend",class:"v-chip__prepend"},[t.prepend?l(f,{key:"prepend-defaults",disabled:!P,defaults:{VAvatar:{image:e.prependAvatar,start:!0},VIcon:{icon:e.prependIcon,start:!0}}},t.prepend):l(D,null,[e.prependIcon&&l(v,{key:"prepend-icon",icon:e.prependIcon,start:!0},null),e.prependAvatar&&l(_,{key:"prepend-avatar",image:e.prependAvatar,start:!0},null)])]),l("div",{class:"v-chip__content"},[((A=t.default)==null?void 0:A.call(t,{isSelected:a==null?void 0:a.isSelected.value,selectedClass:a==null?void 0:a.selectedClass.value,select:a==null?void 0:a.select,toggle:a==null?void 0:a.toggle,value:a==null?void 0:a.value.value,disabled:e.disabled}))??e.text]),N&&l("div",{key:"append",class:"v-chip__append"},[t.append?l(f,{key:"append-defaults",disabled:!d,defaults:{VAvatar:{end:!0,image:e.appendAvatar},VIcon:{end:!0,icon:e.appendIcon}}},t.append):l(D,null,[e.appendIcon&&l(v,{key:"append-icon",end:!0,icon:e.appendIcon},null),e.appendAvatar&&l(_,{key:"append-avatar",end:!0,image:e.appendAvatar},null)])]),X&&l("div",Ie({key:"close",class:"v-chip__close"},U.value),[t.close?l(f,{key:"close-defaults",defaults:{VIcon:{icon:e.closeIcon,size:"x-small"}}},t.close):l(v,{key:"close-icon",icon:e.closeIcon,size:"x-small"},null)])]}}),[[ye("ripple"),i.value&&e.ripple,null]])}}});export{xe as V};
