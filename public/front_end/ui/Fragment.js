export class Fragment{constructor(e){this._element=e,this._elementsById=new Map}element(){return this._element}$(e){return this._elementsById.get(e)}static build(e,...t){return Fragment._render(Fragment._template(e),t)}static cached(e,...t){let r=_templateCache.get(e);return r||(r=Fragment._template(e),_templateCache.set(e,r)),Fragment._render(r,t)}static _template(e){let t="",r=!0;for(let n=0;n<e.length-1;n++){t+=e[n];const a=e[n].lastIndexOf(">"),l=e[n].indexOf("<",a+1);-1!==a&&-1===l?r=!0:-1!==l&&(r=!1),t+=r?_textMarker:_attributeMarker(n)}t+=e[e.length-1];const n=window.document.createElement("template");n.innerHTML=t;const a=n.ownerDocument.createTreeWalker(n.content,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,null,!1);let l=0;const s=[],o=[],i=[];for(;a.nextNode();){const e=a.currentNode;if(e.nodeType===Node.ELEMENT_NODE&&e.hasAttributes()){e.hasAttribute("$")&&(i.push(e),o.push({elementId:e.getAttribute("$")}),e.removeAttribute("$"));const t=[];for(let r=0;r<e.attributes.length;r++){const n=e.attributes[r].name;if(!_attributeMarkerRegex.test(n)&&!_attributeMarkerRegex.test(e.attributes[r].value))continue;t.push(n),i.push(e);const a={attr:{index:l}};a.attr.names=n.split(_attributeMarkerRegex),l+=a.attr.names.length-1,a.attr.values=e.attributes[r].value.split(_attributeMarkerRegex),l+=a.attr.values.length-1,o.push(a)}for(let r=0;r<t.length;r++)e.removeAttribute(t[r])}if(e.nodeType===Node.TEXT_NODE&&-1!==e.data.indexOf(_textMarker)){const t=e.data.split(_textMarkerRegex);e.data=t[t.length-1];for(let r=0;r<t.length-1;r++){t[r]&&e.parentNode.insertBefore(createTextNode(t[r]),e);const n=createElement("span");i.push(n),o.push({replaceNodeIndex:l++}),e.parentNode.insertBefore(n,e)}}e.nodeType!==Node.TEXT_NODE||e.previousSibling&&e.previousSibling.nodeType!==Node.ELEMENT_NODE||e.nextSibling&&e.nextSibling.nodeType!==Node.ELEMENT_NODE||!/^\s*$/.test(e.data)||s.push(e)}for(let e=0;e<i.length;e++)i[e].classList.add(_class(e));for(const e of s)e.remove();return{template:n,binds:o}}static _render(e,t){const r=e.template.ownerDocument.importNode(e.template.content,!0),n=r.firstChild===r.lastChild?r.firstChild:r,a=new Fragment(n),l=[];for(let t=0;t<e.binds.length;t++){const e=_class(t),n=r.querySelector("."+e);n.classList.remove(e),l.push(n)}for(let r=0;r<e.binds.length;r++){const n=e.binds[r],s=l[r];if("elementId"in n)a._elementsById.set(n.elementId,s);else if("replaceNodeIndex"in n){const e=t[n.replaceNodeIndex];s.parentNode.replaceChild(this._nodeForValue(e),s)}else{if(!("attr"in n))throw new Error("Unexpected bind");if(2===n.attr.names.length&&1===n.attr.values.length&&"function"==typeof t[n.attr.index])t[n.attr.index].call(null,s);else{let e=n.attr.names[0];for(let r=1;r<n.attr.names.length;r++)e+=t[n.attr.index+r-1],e+=n.attr.names[r];if(e){let r=n.attr.values[0];for(let e=1;e<n.attr.values.length;e++)r+=t[n.attr.index+n.attr.names.length-1+e-1],r+=n.attr.values[e];s.setAttribute(e,r)}}}}return a}static _nodeForValue(e){if(e instanceof Node)return e;if(e instanceof Fragment)return e._element;if(Array.isArray(e)){const t=createDocumentFragment();for(const r of e)t.appendChild(this._nodeForValue(r));return t}return createTextNode(""+e)}}export const _textMarker="{{template-text}}";const _textMarkerRegex=/{{template-text}}/;export const _attributeMarker=e=>"template-attribute"+e;const _attributeMarkerRegex=/template-attribute\d+/,_class=e=>"template-class-"+e,_templateCache=new Map;export const html=(e,...t)=>Fragment.cached(e,...t).element();export let _Bind;export let _Template;