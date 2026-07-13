import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGmailStore, parseAddresses } from '../state';
import { useGmailGestures } from '../hooks/useGmailGestures';
import { useGmailStrings } from '../hooks/useGmailStrings';
import { IcBack, IcSend } from '../res/icons';

export function ComposePage() {
  const [p] = useSearchParams();
  const mode = p.get('mode');
  const threadId = p.get('threadId');
  const messageId = p.get('messageId');
  const draftId = p.get('draftId');
  const messages = useGmailStore(s => s.messages);
  const threads = useGmailStore(s => s.threads);
  const drafts = useGmailStore(s => s.drafts);
  const save = useGmailStore(s => s.saveDraft);
  const send = useGmailStore(s => s.sendMessage);
  const original = messageId ? messages[messageId] : threadId ? messages[threads[threadId]?.messageIds.at(-1) ?? ''] : undefined;
  const draft = draftId ? drafts[draftId] : undefined;
  const [to, setTo] = useState(draft?.to.join(', ') ?? (mode === 'reply' && original ? original.from.replace(/.*<|>.*/g, '') : ''));
  const [cc, setCc] = useState(draft?.cc.join(', ') ?? '');
  const [bcc, setBcc] = useState(draft?.bcc.join(', ') ?? '');
  const [subject, setSubject] = useState(draft?.subject ?? (original ? `${mode === 'forward' ? 'Fwd' : 'Re'}: ${original.subject}` : ''));
  const [body, setBody] = useState(draft?.body ?? (mode === 'forward' && original ? `\n\n---------- Forwarded message ----------\nFrom: ${original.from}\nTo: ${original.to.join(', ')}\nSubject: ${original.subject}\n\n${original.body}` : ''));
  const { bindTap, bindBack, back } = useGmailGestures();
  const str = useGmailStrings();
  const input = { to: parseAddresses(to), cc: parseAddresses(cc), bcc: parseAddresses(bcc), subject, body, replyToThreadId: mode === 'reply' ? threadId : null, forwardOfMessageId: mode === 'forward' ? original?.id : null };
  return <div className="flex h-full flex-col bg-white pt-10">
    <header className="flex h-14 items-center gap-3 px-3"><button {...bindBack<HTMLButtonElement>()}><IcBack /></button><b className="flex-1">{mode === 'reply' ? str.reply : mode === 'forward' ? str.forward : str.compose}</b><button aria-label={str.send} {...bindTap<HTMLButtonElement>({ kind: 'action', id: 'gmail.compose.send.submit' }, { onTrigger: () => { send(input); back(); } })}><IcSend /></button></header>
    <Field label={str.to}><input data-keep-keyboard="true" className="flex-1 outline-none" value={to} onChange={e => setTo(e.target.value)} {...bindTap<HTMLInputElement>({ kind: 'action', id: 'gmail.compose.to.input' }, { params: { value: to }, onTrigger: () => {} })} /></Field>
    <Field label={str.cc}><input data-keep-keyboard="true" className="flex-1 outline-none" value={cc} onChange={e => setCc(e.target.value)} {...bindTap<HTMLInputElement>({ kind: 'action', id: 'gmail.compose.cc.input' }, { params: { value: cc }, onTrigger: () => {} })} /></Field>
    <Field label={str.bcc}><input data-keep-keyboard="true" className="flex-1 outline-none" value={bcc} onChange={e => setBcc(e.target.value)} {...bindTap<HTMLInputElement>({ kind: 'action', id: 'gmail.compose.bcc.input' }, { params: { value: bcc }, onTrigger: () => {} })} /></Field>
    <Field label={str.subject}><input data-keep-keyboard="true" className="flex-1 outline-none" value={subject} onChange={e => setSubject(e.target.value)} {...bindTap<HTMLInputElement>({ kind: 'action', id: 'gmail.compose.subject.input' }, { params: { value: subject }, onTrigger: () => {} })} /></Field>
    <textarea data-keep-keyboard="true" className="min-h-0 flex-1 resize-none p-4 outline-none" placeholder={str.message} value={body} onChange={e => setBody(e.target.value)} {...bindTap<HTMLTextAreaElement>({ kind: 'action', id: 'gmail.compose.body.input' }, { params: { value: body }, onTrigger: () => {} })} />
    <button className="m-4 rounded-full bg-[#c2e7ff] py-3" {...bindTap<HTMLButtonElement>({ kind: 'action', id: 'gmail.compose.save.submit' }, { onTrigger: () => { save(input); back(); } })}>{str.saveDraft}</button>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex border-b px-4 py-3"><span className="w-16 text-app-text-muted">{label}</span>{children}</div>; }
