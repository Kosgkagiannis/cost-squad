"use strict";(self.webpackChunkcost_squad=self.webpackChunkcost_squad||[]).push([[460],{7460:function(e,n,t){t.r(n);var i=t(9439),s=t(2791),a=t(7689),r=t(5814),c=t(9473),d=t(184);n.default=function(e){var n=e.groupMembers,t=e.newMember,l=e.onMemberInputChange,o=e.handleAddMember,m=e.groupId,u=(0,s.useState)(!1),h=(0,i.Z)(u,2),b=h[0],x=h[1],f=(0,s.useState)(!1),g=(0,i.Z)(f,2),j=g[0],p=g[1],v=(0,s.useState)(""),C=(0,i.Z)(v,2),k=C[0],N=C[1],w=(0,a.s0)(),M=(0,s.useState)(1),S=(0,i.Z)(M,2),Z=S[0],y=S[1];(0,s.useEffect)((function(){var e=window.location.hash,n=e.indexOf("currency=");if(-1!==n){var t=e.slice(n+9);N(decodeURIComponent(t))}}),[]);var A=6*(Z-1),E=6*Z;return(0,d.jsxs)("div",{children:[b?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("input",{type:"text",placeholder:"Enter Member's Name",value:t,onChange:l,maxLength:15,"data-testid":"new-member-input"}),j?(0,d.jsx)("img",{src:r,width:48,height:48,alt:"Loading"}):(0,d.jsx)("button",{onClick:function(){p(!0),x(!1),setTimeout((function(){o(),p(!1)}),1500)},disabled:""===t.trim(),"data-testid":"add-member-button2",children:"Add Member"}),(0,d.jsx)("button",{onClick:function(){x(!1)},children:"Cancel"})]}):(0,d.jsxs)("div",{className:"delete-button",children:[(0,d.jsx)("button",{"data-testid":"add-member-button",onClick:function(){return x(!0)},children:"Add Member"}),j&&(0,d.jsx)("img",{width:48,height:48,alt:"Loading",src:r})]}),(0,d.jsx)("div",{className:"divider"}),(0,d.jsxs)("div",{className:"title-and-animation",children:[(0,d.jsx)("h2",{children:n.length>0?"Members":""}),n.length>0&&(0,d.jsx)("img",{src:c,alt:"Members animation",width:50,height:50})]}),(0,d.jsx)("div",{className:"grid-container",children:n.filter((function(e){return e.name&&""!==e.name.trim()})).slice(A,E).map((function(e){return(0,d.jsx)("div",{className:"mobile-profile member-list-item",children:(0,d.jsxs)("div",{className:"member-box",children:[(0,d.jsx)("img",{src:e.profilePicture,alt:e.name,className:"member-profile-image"}),(0,d.jsx)("p",{className:"member-name",children:e.name}),(0,d.jsx)("button",{onClick:function(){return w("/edit-member/".concat(m,"/").concat(e.id,"?currency=").concat(k))},children:"Edit"})]})},e.id)}))}),n.length>6&&(0,d.jsxs)("div",{className:"pagination",children:[(0,d.jsx)("button",{onClick:function(){y((function(e){return e-1}))},disabled:1===Z,children:"<"}),(0,d.jsxs)("span",{children:["Page ",Z]}),(0,d.jsx)("button",{onClick:function(){y((function(e){return e+1}))},disabled:E>=n.length,children:">"})]})]})}}}]);
//# sourceMappingURL=460.28f9999e.chunk.js.map