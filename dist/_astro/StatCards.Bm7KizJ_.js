import{j as t}from"./jsx-runtime.BftctW7E.js";import{r as c}from"./index.DJO9vBfz.js";/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var h={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),n=(e,i)=>{const l=c.forwardRef(({color:o="currentColor",size:r=24,strokeWidth:a=2,absoluteStrokeWidth:d,className:x="",children:s,...m},p)=>c.createElement("svg",{ref:p,...h,width:r,height:r,stroke:o,strokeWidth:d?Number(a)*24/Number(r):a,className:["lucide",`lucide-${g(e)}`,x].join(" "),...m},[...i.map(([u,y])=>c.createElement(u,y)),...Array.isArray(s)?s:[s]]));return l.displayName=`${e}`,l};/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=n("Award",[["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}],["path",{d:"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11",key:"em7aur"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=n("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=n("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=n("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]]);function C({user:e}){const l=[{title:"总阅读时长",value:`${Math.floor(e.totalReadingTimeMinutes/60)} 小时`,icon:v,color:"text-blue-500",bg:"bg-blue-500/10"},{title:"累计读书天数",value:`${e.readingDays} 天`,icon:b,color:"text-emerald-500",bg:"bg-emerald-500/10"},{title:"已读完书籍",value:`${e.completedBooksCount} 本`,icon:k,color:"text-amber-500",bg:"bg-amber-500/10"},{title:"划线与笔记",value:`${e.notesCount} 条`,icon:j,color:"text-purple-500",bg:"bg-purple-500/10"}];return t.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:l.map((o,r)=>{const a=o.icon;return t.jsx("div",{className:"p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm",children:t.jsxs("div",{className:"flex items-center justify-between",children:[t.jsxs("div",{children:[t.jsx("p",{className:"text-xs font-medium text-zinc-400",children:o.title}),t.jsx("h3",{className:"text-2xl font-bold text-zinc-100 mt-1",children:o.value})]}),t.jsx("div",{className:`p-3 rounded-xl ${o.bg}`,children:t.jsx(a,{className:`w-6 h-6 ${o.color}`})})]})},r)})})}export{C as default};
