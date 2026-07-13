import type { NavigationDeclaration } from './navigation.types';

const listActions = [
 { id:'gmail.list.item.star.toggle', label:'Toggle star', scope:'item', behavior:'toggle', paramsSchema:{threadId:'string'} },
 { id:'gmail.list.item.unread.toggle', label:'Mark unread', scope:'item', behavior:'toggle', paramsSchema:{threadId:'string'} },
] as const;
const threadActions = [
 { id:'gmail.thread.star.toggle', label:'Toggle star', behavior:'toggle' },
 { id:'gmail.thread.important.toggle', label:'Toggle important', behavior:'toggle' },
 { id:'gmail.thread.unread.toggle', label:'Mark unread', behavior:'toggle' },
 { id:'gmail.thread.archive.submit', label:'Archive thread', behavior:'submit' },
 { id:'gmail.thread.delete.submit', label:'Move thread to trash', behavior:'submit' },
 { id:'gmail.thread.restore.submit', label:'Restore thread to inbox', behavior:'submit' },
 { id:'gmail.thread.label.apply', label:'Apply label', behavior:'other', paramsSchema:{labelId:'string'} },
 { id:'gmail.thread.label.remove', label:'Remove label', behavior:'other', paramsSchema:{labelId:'string'} },
] as const;
export const NAVIGATION_DECLARATION = {
 app:'gmail',
 routes:[
  { path:'/', component:'MailboxPage', params:{}, entryPoint:'home', uiStates:[
   {id:'gmail.inbox.base',search:{},description:'Inbox',actions:[{id:'gmail.list.item.star.toggle',label:'Toggle star',scope:'item',behavior:'toggle',paramsSchema:{threadId:'string'}},{id:'gmail.list.item.unread.toggle',label:'Mark unread',scope:'item',behavior:'toggle',paramsSchema:{threadId:'string'}}]},
   {id:'gmail.inbox.menu',search:{menu:'open'},description:'Navigation menu'},
  ], queryParams:{}, scrollContainers:[{name:'main',direction:'vertical',description:'Message list'}], description:'Inbox' },
  { path:'/search', component:'SearchPage', params:{}, entryPoint:'none', uiStates:[{id:'gmail.search.base',search:{},description:'Search',actions:[{id:'gmail.search.query.input',label:'Enter search query',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.search.submit',label:'Run search',behavior:'submit'}]}], queryParams:{q:'string'}, scrollContainers:[{name:'main',direction:'vertical',description:'Search results'}], description:'Search mail' },
  { path:'/mailbox/:box', component:'MailboxPage', params:{box:'string'}, entryPoint:'none', uiStates:[{id:'gmail.mailbox.base',search:{},description:'Mailbox'}], queryParams:{}, scrollContainers:[{name:'main',direction:'vertical',description:'Message list'}], description:'Mailbox folder' },
  { path:'/thread/:threadId', component:'ThreadPage', params:{threadId:'string'}, entryPoint:'none', uiStates:[
   {id:'gmail.thread.base',search:{},description:'Conversation',actions:[{id:'gmail.thread.star.toggle',label:'Toggle star',behavior:'toggle'},{id:'gmail.thread.important.toggle',label:'Toggle important',behavior:'toggle'},{id:'gmail.thread.unread.toggle',label:'Mark unread',behavior:'toggle'},{id:'gmail.thread.archive.submit',label:'Archive thread',behavior:'submit'},{id:'gmail.thread.delete.submit',label:'Move thread to trash',behavior:'submit'},{id:'gmail.thread.restore.submit',label:'Restore thread to inbox',behavior:'submit'},{id:'gmail.thread.label.apply',label:'Apply label',behavior:'other',paramsSchema:{labelId:'string'}},{id:'gmail.thread.label.remove',label:'Remove label',behavior:'other',paramsSchema:{labelId:'string'}}]},
   {id:'gmail.thread.more',search:{menu:'more'},description:'More menu'},
   {id:'gmail.thread.labels',search:{dialog:'labels'},description:'Label menu'},
   {id:'gmail.thread.newLabel',search:{dialog:'newLabel'},description:'New label dialog',actions:[{id:'gmail.thread.labelName.input',label:'Enter label name',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.thread.labelCreate.submit',label:'Create and apply label',behavior:'submit'}]},
   {id:'gmail.thread.spamConfirm',search:{dialog:'spam'},description:'Spam confirmation',actions:[{id:'gmail.thread.spam.submit',label:'Confirm spam',behavior:'submit'}]},
   {id:'gmail.thread.deleteConfirm',search:{dialog:'deleteForever'},description:'Permanent delete confirmation',actions:[{id:'gmail.thread.deleteForever.submit',label:'Permanently delete',behavior:'submit'}]},
  ], queryParams:{}, scrollContainers:[{name:'main',direction:'vertical',description:'Conversation messages'}], description:'Conversation' },
  { path:'/compose', component:'ComposePage', params:{}, entryPoint:'none', uiStates:[{id:'gmail.compose.base',search:{},description:'Compose email',actions:[
   {id:'gmail.compose.to.input',label:'Enter recipients',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.compose.cc.input',label:'Enter Cc recipients',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.compose.bcc.input',label:'Enter Bcc recipients',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.compose.subject.input',label:'Enter subject',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.compose.body.input',label:'Enter body',behavior:'input',paramsSchema:{value:'string'}},{id:'gmail.compose.save.submit',label:'Save draft',behavior:'submit'},{id:'gmail.compose.send.submit',label:'Send email',behavior:'submit'}
  ]},{id:'gmail.compose.reply',search:{mode:'reply'},description:'Reply composer'},{id:'gmail.compose.forward',search:{mode:'forward'},description:'Forward composer'}], queryParams:{}, description:'Compose, reply, or forward' },
 ],
 transitions:[
  {id:'gmail.inbox.openMenu',from:{path:'/',search:{}},to:'/',search:{menu:'open'},searchParams:{},params:{},mode:'push',label:'Open navigation menu',ui:{placement:'topbar',icon:'menu',gesture:'tap'}},
  {id:'gmail.header.openSearch',from:['/','/mailbox/:box'],to:'/search',search:{},searchParams:{},params:{},mode:'push',label:'Open search',ui:{placement:'topbar',icon:'search',gesture:'tap'}},
  {id:'gmail.menu.openMailbox',from:{path:'/',search:{menu:'open'}},to:'/mailbox/:box',search:{},searchParams:{},params:{box:'string'},mode:'replace',label:'Open mailbox',ui:{placement:'content',icon:'folder',gesture:'tap'}},
  {id:'gmail.menu.openInbox',from:{path:'/',search:{menu:'open'}},to:'/',search:{},searchParams:{},params:{},mode:'replace',label:'Open inbox',ui:{placement:'content',icon:'inbox',gesture:'tap'}},
  {id:'gmail.list.openThread',from:['/','/search','/mailbox/:box'],to:'/thread/:threadId',search:{},searchParams:{},params:{threadId:'string'},mode:'push',label:'Open conversation',ui:{placement:'content',icon:'mail',gesture:'tap'}},
  {id:'gmail.compose.open',from:['/','/mailbox/:box'],to:'/compose',search:{},searchParams:{},params:{},mode:'push',label:'Compose email',ui:{placement:'fab',icon:'compose',gesture:'tap'}},
  {id:'gmail.draft.open',from:'/mailbox/:box',to:'/compose',search:{},searchParams:{draftId:'string'},params:{},mode:'push',label:'Open draft',ui:{placement:'content',icon:'draft',gesture:'tap'}},
  {id:'gmail.thread.openMore',from:{path:'/thread/:threadId',search:{}},to:'/thread/:threadId',search:{menu:'more'},searchParams:{},params:{threadId:'string'},mode:'push',label:'Open more menu',ui:{placement:'topbar',icon:'more',gesture:'tap'}},
  {id:'gmail.thread.openLabels',from:[{path:'/thread/:threadId',search:{}},{path:'/thread/:threadId',search:{menu:'more'}}],to:'/thread/:threadId',search:{dialog:'labels'},searchParams:{},params:{threadId:'string'},mode:'push',label:'Open label menu',ui:{placement:'content',icon:'label',gesture:'tap'}},
  {id:'gmail.thread.openNewLabel',from:{path:'/thread/:threadId',search:{dialog:'labels'}},to:'/thread/:threadId',search:{dialog:'newLabel'},searchParams:{},params:{threadId:'string'},mode:'push',label:'Open new label dialog',ui:{placement:'content',icon:'plus',gesture:'tap'}},
  {id:'gmail.thread.openSpamConfirm',from:{path:'/thread/:threadId',search:{menu:'more'}},to:'/thread/:threadId',search:{dialog:'spam'},searchParams:{},params:{threadId:'string'},mode:'push',label:'Confirm spam',ui:{placement:'content',icon:'spam',gesture:'tap'}},
  {id:'gmail.thread.openDeleteConfirm',from:{path:'/thread/:threadId',search:{menu:'more'}},to:'/thread/:threadId',search:{dialog:'deleteForever'},searchParams:{},params:{threadId:'string'},mode:'push',label:'Confirm permanent deletion',ui:{placement:'content',icon:'delete',gesture:'tap'}},
  {id:'gmail.thread.reply',from:{path:'/thread/:threadId',search:{}},to:'/compose',search:{mode:'reply'},searchParams:{threadId:'string'},params:{},mode:'push',label:'Reply',ui:{placement:'content',icon:'reply',gesture:'tap'}},
  {id:'gmail.thread.forward',from:{path:'/thread/:threadId',search:{}},to:'/compose',search:{mode:'forward'},searchParams:{threadId:'string',messageId:'string'},params:{},mode:'push',label:'Forward',ui:{placement:'content',icon:'forward',gesture:'tap'}},
 ], capabilities:{historyBack:true}
} as const satisfies NavigationDeclaration;
export type TransitionId = typeof NAVIGATION_DECLARATION.transitions[number]['id'];
