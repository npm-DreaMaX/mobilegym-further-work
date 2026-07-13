export type GmailFolder = 'inbox' | 'archive' | 'trash' | 'spam';
export interface GmailAttachment { id: string; name: string; mimeType: string; size: number }
export interface GmailMessage { id: string; threadId: string; from: string; to: string[]; cc: string[]; bcc: string[]; subject: string; body: string; attachments: GmailAttachment[]; sentAt: number }
export interface GmailThread { id: string; messageIds: string[]; folder: GmailFolder; isRead: boolean; isStarred: boolean; isImportant: boolean; labelIds: string[]; updatedAt: number }
export interface GmailDraft { id: string; to: string[]; cc: string[]; bcc: string[]; subject: string; body: string; attachments: GmailAttachment[]; replyToThreadId: string | null; forwardOfMessageId: string | null; updatedAt: number }
export interface GmailLabel { id: string; name: string; color: string }
export interface GmailState {
  user: { id: string; name: string; email: string };
  threads: Record<string, GmailThread>; messages: Record<string, GmailMessage>; drafts: Record<string, GmailDraft>; sent: Record<string, GmailMessage>; labels: Record<string, GmailLabel>;
  search: { query: string; resultThreadIds: string[] };
  _temp: { lastSearchQuery: string | null; lastOpenedThreadId: string | null; lastOpenedMessageId: string | null; searchHistory: string[]; openedThreadIds: string[] };
}
export interface ComposeInput { to: string[]; cc: string[]; bcc: string[]; subject: string; body: string; replyToThreadId?: string | null; forwardOfMessageId?: string | null }
export interface GmailActions {
 searchThreads(query: string): void; openThread(threadId: string): void; toggleStar(threadId: string): void; toggleImportant(threadId: string): void; markUnread(threadId: string): void; archiveThread(threadId: string): void; trashThread(threadId: string): void; restoreThread(threadId: string): void; spamThread(threadId: string): void; applyLabel(threadId: string, labelId: string): void; removeLabel(threadId: string, labelId: string): void; createLabel(name: string, threadId?: string): string; saveDraft(input: ComposeInput): string; sendMessage(input: ComposeInput): string; permanentlyDelete(threadId: string): void;
}
