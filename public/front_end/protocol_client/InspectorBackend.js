import{NodeURL}from"./NodeURL.js";export const ProtocolError=Symbol("Protocol.Error");export const DevToolsStubErrorCode=-32015;const _GenericError=-32e3,_ConnectionClosedErrorCode=-32001;export class InspectorBackend{constructor(){this._agentPrototypes=new Map,this._dispatcherPrototypes=new Map,this._initialized=!1}static reportProtocolError(t,e){console.error(t+": "+JSON.stringify(e))}isInitialized(){return this._initialized}_addAgentGetterMethodToProtocolTargetPrototype(t){let e=0;for(;e<t.length&&t[e].toLowerCase()!==t[e];)++e;const s=t.substr(0,e).toLowerCase()+t.slice(e)+"Agent";TargetBase.prototype[s]=function(){return this._agents[t]},TargetBase.prototype["register"+t+"Dispatcher"]=function(e){this.registerDispatcher(t,e)}}_agentPrototype(t){return this._agentPrototypes.has(t)||(this._agentPrototypes.set(t,new _AgentPrototype(t)),this._addAgentGetterMethodToProtocolTargetPrototype(t)),this._agentPrototypes.get(t)}_dispatcherPrototype(t){return this._dispatcherPrototypes.has(t)||this._dispatcherPrototypes.set(t,new _DispatcherPrototype),this._dispatcherPrototypes.get(t)}registerCommand(t,e,s,o){const r=t.split(".");this._agentPrototype(r[0]).registerCommand(r[1],e,s,o),this._initialized=!0}registerEnum(t,e){const s=t.split("."),o=s[0];Protocol[o]||(Protocol[o]={}),Protocol[o][s[1]]=e,this._initialized=!0}registerEvent(t,e){const s=t.split(".")[0];this._dispatcherPrototype(s).registerEvent(t,e),this._initialized=!0}wrapClientCallback(t,e,s,o){return function(r,n){if(r)return console.error(e+r),void t(o);t(s?new s(n):n)}}}let _factory,SendRawMessageCallback;export class Connection{constructor(){this._onMessage}setOnMessage(t){}setOnDisconnect(t){}sendRawMessage(t){}disconnect(){throw new Error("not implemented")}static setFactory(t){_factory=t}static getFactory(){return _factory}}export const test={dumpProtocol:null,deprecatedRunAfterPendingDispatches:null,sendRawMessage:null,suppressRequestErrors:!1,onMessageSent:null,onMessageReceived:null};export class SessionRouter{constructor(t){this._connection=t,this._lastMessageId=1,this._pendingResponsesCount=0,this._domainToLogger=new Map,this._sessions=new Map,this._pendingScripts=[],test.deprecatedRunAfterPendingDispatches=this._deprecatedRunAfterPendingDispatches.bind(this),test.sendRawMessage=this._sendRawMessageForTesting.bind(this),this._connection.setOnMessage(this._onMessage.bind(this)),this._connection.setOnDisconnect(t=>{const e=this._sessions.get("");e&&e.target.dispose(t)})}registerSession(t,e,s){if(s)for(const t of this._sessions.values())if(t.proxyConnection){console.error("Multiple simultaneous proxy connections are currently unsupported");break}this._sessions.set(e,{target:t,callbacks:new Map,proxyConnection:s})}unregisterSession(t){const e=this._sessions.get(t);if(e){for(const t of e.callbacks.values())SessionRouter.dispatchConnectionError(t);this._sessions.delete(t)}}_getTargetBySessionId(t){const e=this._sessions.get(t||"");return e?e.target:null}_nextMessageId(){return this._lastMessageId++}connection(){return this._connection}sendMessage(t,e,s,o,r){const n={},i=this._nextMessageId();if(n.id=i,n.method=s,o&&(n.params=o),t&&(n.sessionId=t),test.dumpProtocol&&test.dumpProtocol("frontend: "+JSON.stringify(n)),test.onMessageSent){const r=JSON.parse(JSON.stringify(o||{}));test.onMessageSent({domain:e,method:s,params:r,id:i},this._getTargetBySessionId(t))}++this._pendingResponsesCount;const a=this._sessions.get(t);a&&(a.callbacks.set(i,r),this._connection.sendRawMessage(JSON.stringify(n)))}_sendRawMessageForTesting(t,e,s){const o=t.split(".")[0];this.sendMessage("",o,t,e,s||(()=>{}))}_onMessage(t){if(test.dumpProtocol&&test.dumpProtocol("backend: "+("string"==typeof t?t:JSON.stringify(t))),test.onMessageReceived){const e=JSON.parse("string"==typeof t?t:JSON.stringify(t));test.onMessageReceived(e,this._getTargetBySessionId(e.sessionId))}const e="string"==typeof t?JSON.parse(t):t;let s=!1;for(const t of this._sessions.values())t.proxyConnection&&(t.proxyConnection._onMessage?(t.proxyConnection._onMessage(e),s=!0):InspectorBackend.reportProtocolError("Protocol Error: the session has a proxyConnection with no _onMessage",e));const o=e.sessionId||"",r=this._sessions.get(o);if(r){if(!r.proxyConnection)if(r.target._needsNodeJSPatching&&NodeURL.patch(e),"id"in e){const t=r.callbacks.get(e.id);if(r.callbacks.delete(e.id),!t)return void(s||InspectorBackend.reportProtocolError("Protocol Error: the message with wrong id",e));t(e.error,e.result),--this._pendingResponsesCount,this._pendingScripts.length&&!this._pendingResponsesCount&&this._deprecatedRunAfterPendingDispatches()}else{if(!("method"in e))return void InspectorBackend.reportProtocolError("Protocol Error: the message without method",e);const t=e.method.split("."),s=t[0];if(!(s in r.target._dispatchers))return void InspectorBackend.reportProtocolError(`Protocol Error: the message ${e.method} is for non-existing domain '${s}'`,e);r.target._dispatchers[s].dispatch(t[1],e)}}else s||InspectorBackend.reportProtocolError("Protocol Error: the message with wrong session id",e)}_deprecatedRunAfterPendingDispatches(t){t&&this._pendingScripts.push(t),setTimeout(()=>{this._pendingResponsesCount?this._deprecatedRunAfterPendingDispatches():this._executeAfterPendingDispatches()},0)}_executeAfterPendingDispatches(){if(!this._pendingResponsesCount){const t=this._pendingScripts;this._pendingScripts=[];for(let e=0;e<t.length;++e)t[e]()}}static dispatchConnectionError(t){const e={message:"Connection is closed, can't dispatch pending call",code:-32001,data:null};setTimeout(()=>t(e,null),0)}}export class TargetBase{constructor(t,e,s,o){if(this._needsNodeJSPatching=t,this._sessionId=s,!e&&o||!e&&s||o&&s)throw new Error("Either connection or sessionId (but not both) must be supplied for a child target");let r;r=s&&e&&e._router?e._router:new SessionRouter(o||_factory()),this._router=r,r.registerSession(this,this._sessionId),this._agents={};for(const[t,e]of inspectorBackend._agentPrototypes)this._agents[t]=Object.create(e),this._agents[t]._target=this;this._dispatchers={};for(const[t,e]of inspectorBackend._dispatcherPrototypes)this._dispatchers[t]=Object.create(e),this._dispatchers[t]._dispatchers=[]}registerDispatcher(t,e){this._dispatchers[t]&&this._dispatchers[t].addDomainDispatcher(e)}dispose(t){this._router&&(this._router.unregisterSession(this._sessionId),this._router=null)}isDisposed(){return!this._router}markAsNodeJSForTest(){this._needsNodeJSPatching=!0}router(){return this._router}}class _AgentPrototype{constructor(t){this._replyArgs={},this._hasErrorData={},this._domain=t,this._target}registerCommand(t,e,s,o){const r=this._domain+"."+t;this[t]=function(t){const s=Array.prototype.slice.call(arguments);return _AgentPrototype.prototype._sendMessageToBackendPromise.call(this,r,e,s)},this["invoke_"+t]=function(t){return this._invoke(r,t)},this._replyArgs[r]=s,o&&(this._hasErrorData[r]=!0)}_prepareParameters(t,e,s,o){const r={};let n=!1;for(const i of e){const a=i.name,c=i.type,h=i.optional;if(!s.length&&!h)return o(`Protocol Error: Invalid number of arguments for method '${t}' call. It must have the following arguments ${JSON.stringify(e)}'.`),null;const d=s.shift();if(!h||void 0!==d){if(typeof d!==c)return o(`Protocol Error: Invalid type of argument '${a}' for method '${t}' call. It must be '${c}' but it is '${typeof d}'.`),null;r[a]=d,n=!0}}return s.length?(o(`Protocol Error: Extra ${s.length} arguments in a call to method '${t}'.`),null):n?r:null}_sendMessageToBackendPromise(t,e,s){let o;const r=this._prepareParameters(t,e,s,(function(t){console.error(t),o=t}));return o?Promise.resolve(null):new Promise((e,s)=>{const o=(o,r)=>{if(o)return void(test.suppressRequestErrors||-32015===o.code||-32e3===o.code||-32001===o.code?e(null):(console.error("Request "+t+" failed. "+JSON.stringify(o)),s(o)));const n=this._replyArgs[t];e(r&&n.length?r[n[0]]:void 0)};this._target._router?this._target._router.sendMessage(this._target._sessionId,this._domain,t,r,o):SessionRouter.dispatchConnectionError(o)})}_invoke(t,e){return new Promise(s=>{const o=(e,o)=>{e&&!test.suppressRequestErrors&&-32015!==e.code&&-32e3!==e.code&&-32001!==e.code&&console.error("Request "+t+" failed. "+JSON.stringify(e)),o||(o={}),e&&(o[ProtocolError]=e.message),s(o)};this._target._router?this._target._router.sendMessage(this._target._sessionId,this._domain,t,e,o):SessionRouter.dispatchConnectionError(o)})}}class _DispatcherPrototype{constructor(){this._eventArgs={},this._dispatchers}registerEvent(t,e){this._eventArgs[t]=e}addDomainDispatcher(t){this._dispatchers.push(t)}dispatch(t,e){if(!this._dispatchers.length)return;if(!this._eventArgs[e.method])return void InspectorBackend.reportProtocolError(`Protocol Error: Attempted to dispatch an unspecified method '${e.method}'`,e);const s=[];if(e.params){const t=this._eventArgs[e.method];for(let o=0;o<t.length;++o)s.push(e.params[t[o]])}for(let e=0;e<this._dispatchers.length;++e){const o=this._dispatchers[e];t in o&&o[t].apply(o,s)}}}export let _Callback;export const inspectorBackend=new InspectorBackend;