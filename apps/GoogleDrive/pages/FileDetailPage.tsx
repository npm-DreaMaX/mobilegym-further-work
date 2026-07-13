import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { formatFileSize, FILE_TYPE_LABELS } from '../types';
import { IconRenderer, IcArrowLeft, IcMoreVertical, IcStar, IcFolder, IcFileText, IcPencil, IcShare2, IcTrash, IcUsers, IcLink, IcGlobe, IcLock, IcCheck, IcX, IcChevronLeft, IcChevronRight } from '../res/icons';
import type { PermissionRole, LinkAccess } from '../types';

export default function FileDetailPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const files = useGoogleDriveStore(s => s.files);
  const toggleStar = useGoogleDriveStore(s => s.toggleStar);
  const deleteFile = useGoogleDriveStore(s => s.deleteFile);
  const restoreFile = useGoogleDriveStore(s => s.restoreFile);
  const permanentlyDeleteFile = useGoogleDriveStore(s => s.permanentlyDeleteFile);
  const renameFile = useGoogleDriveStore(s => s.renameFile);
  const viewFile = useGoogleDriveStore(s => s.viewFile);
  const recordOpen = useGoogleDriveStore(s => s.recordOpen);
  const moveFile = useGoogleDriveStore(s => s.moveFile);
  const addPermission = useGoogleDriveStore(s => s.addPermission);
  const setLinkAccess = useGoogleDriveStore(s => s.setLinkAccess);
  const updatePermission = useGoogleDriveStore(s => s.updatePermission);
  const removePermission = useGoogleDriveStore(s => s.removePermission);

  const file = React.useMemo(() => files.find(f => f.id === fileId), [files, fileId]);

  // Record view
  React.useEffect(() => {
    if (fileId && file) {
      viewFile(fileId);
      recordOpen(fileId);
    }
  }, [fileId]);

  const isTrashPage = searchParams.get('from') === 'trash';

  const showMenu = searchParams.get('menu') === 'open';
  const showRename = searchParams.get('rename') === 'open';
  const showMove = searchParams.get('move') === 'open';
  const showShare = searchParams.get('share') === 'open';
  const showDeleteConfirm = searchParams.get('deleteConfirm') === 'open';
  const showPermDeleteConfirm = searchParams.get('permDeleteConfirm') === 'open';

  const [renameValue, setRenameValue] = React.useState(file?.name || '');
  const [shareEmail, setShareEmail] = React.useState('');
  const [shareName, setShareName] = React.useState('');
  const [shareRole, setShareRole] = React.useState<PermissionRole>('viewer');

  if (!file) {
    return (
      <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <button onClick={() => navigate(-1)} className="p-1"><IcArrowLeft size={22} /></button>
          <h1 className="text-lg font-medium">文件未找到</h1>
        </div>
      </div>
    );
  }

  const isFolder = file.type === 'folder';
  const isTrashed = file.trashed;
  const linkAccessLabel = file.linkAccess === 'restricted' ? '受限' : file.linkAccess === 'anyone_viewer' ? '知道链接的任何人 — 查看者' : '知道链接的任何人 — 编辑者';

  const handleRename = () => {
    if (renameValue.trim() && fileId) {
      renameFile(fileId, renameValue.trim());
      setSearchParams(p => { p.delete('rename'); return p; });
    }
  };

  const handleDelete = () => {
    deleteFile(fileId!);
    setSearchParams(p => { p.delete('deleteConfirm'); return p; });
    navigate(-1);
  };

  const handleRestore = () => {
    restoreFile(fileId!);
    navigate(-1);
  };

  const handlePermDelete = () => {
    permanentlyDeleteFile(fileId!);
    setSearchParams(p => { p.delete('permDeleteConfirm'); return p; });
    navigate(-1);
  };

  const handleShare = () => {
    if (shareEmail.trim() && fileId) {
      addPermission(fileId, shareEmail.trim(), shareName.trim() || shareEmail.trim(), shareRole);
      setShareEmail('');
      setShareName('');
      setSearchParams(p => { p.delete('share'); return p; });
    }
  };

  const handleStar = () => {
    toggleStar(fileId!);
  };

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-1">
          <IcArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex-1 truncate">{file.name}</h1>
        <button onClick={handleStar} className="p-1" data-action="file.star.toggle" data-action-type="toggle">
          <IcStar size={20} className={file.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
        </button>
        <button onClick={() => setSearchParams(p => { p.set('menu', 'open'); return p; })} className="p-1">
          <IcMoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* File info */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <IconRenderer name={isFolder ? 'IcFolder' : 'IcFileText'} size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">{file.name}</div>
              <div className="text-xs text-gray-400">{FILE_TYPE_LABELS[file.type]}</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <MetaRow label="类型" value={FILE_TYPE_LABELS[file.type]} />
            <MetaRow label="大小" value={formatFileSize(file.size)} />
            <MetaRow label="所有者" value={`${file.ownerName} (${file.owner})`} />
            <MetaRow label="修改时间" value={new Date(file.modifiedTime).toLocaleString('zh-CN')} />
            <MetaRow label="创建时间" value={new Date(file.createdTime).toLocaleString('zh-CN')} />
            <MetaRow label="位置" value={file.parentId ? (files.find(f => f.id === file.parentId)?.name || file.parentId) : '我的云端硬盘'} />
            {isTrashed && <MetaRow label="状态" value="已移至回收站" danger />}
            {file.sharedWithMe && (
              <MetaRow label="分享者" value={`${file.sharedBy}`} />
            )}
          </div>

          {/* Quick actions (non-trashed) */}
          {!isTrashed && (
            <div className="mt-5 space-y-1">
              <ActionButton icon="IcUsers" label="管理访问权限" onClick={() => navigate(`/file/${file.id}/access`)} />
              <ActionButton icon="IcShare2" label="分享" onClick={() => setSearchParams(p => { p.set('share', 'open'); return p; })} />
              <ActionButton icon="IcPencil" label="重命名" onClick={() => { setRenameValue(file.name); setSearchParams(p => { p.set('rename', 'open'); return p; }); }} />
              <ActionButton icon="IcFolder" label="移动到..." onClick={() => setSearchParams(p => { p.set('move', 'open'); return p; })} />
              <ActionButton icon="IcTrash" label="移至回收站" onClick={() => setSearchParams(p => { p.set('deleteConfirm', 'open'); return p; })} danger />
            </div>
          )}

          {/* Trash actions */}
          {isTrashed && (
            <div className="mt-5 space-y-1">
              <ActionButton icon="IcFolder" label="恢复" onClick={handleRestore} />
              <ActionButton icon="IcTrash" label="永久删除" onClick={() => setSearchParams(p => { p.set('permDeleteConfirm', 'open'); return p; })} danger />
            </div>
          )}
        </div>
      </div>

      {/* Action menu */}
      {showMenu && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('menu'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            {!isTrashed ? (
              <>
                <MenuButton icon="IcStar" label={file.starred ? '取消星标' : '添加星标'} onClick={() => { handleStar(); setSearchParams(p => { p.delete('menu'); return p; }); }} />
                <MenuButton icon="IcPencil" label="重命名" onClick={() => { setRenameValue(file.name); setSearchParams(p => { p.delete('menu'); p.set('rename', 'open'); return p; }); }} />
                <MenuButton icon="IcShare2" label="分享" onClick={() => { setSearchParams(p => { p.delete('menu'); p.set('share', 'open'); return p; }); }} />
                <MenuButton icon="IcFolder" label="移动" onClick={() => { setSearchParams(p => { p.delete('menu'); p.set('move', 'open'); return p; }); }} />
                <MenuButton icon="IcTrash" label="移至回收站" onClick={() => { setSearchParams(p => { p.delete('menu'); p.set('deleteConfirm', 'open'); return p; }); }} danger />
              </>
            ) : (
              <>
                <MenuButton icon="IcFolder" label="恢复" onClick={handleRestore} />
                <MenuButton icon="IcTrash" label="永久删除" onClick={() => { setSearchParams(p => { p.delete('menu'); p.set('permDeleteConfirm', 'open'); return p; }); }} danger />
              </>
            )}
            <button className="w-full py-2.5 mt-2 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('menu'); return p; })}>取消</button>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {showRename && (
        <Dialog title="重命名" onClose={() => setSearchParams(p => { p.delete('rename'); return p; })}>
          <input autoFocus className="w-full px-3 py-2.5 border rounded-lg text-sm mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            value={renameValue} onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); }} />
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('rename'); return p; })}>取消</button>
            <button className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium" onClick={handleRename} data-action="rename.name.submit" data-action-type="submit">保存</button>
          </div>
        </Dialog>
      )}

      {/* Move Dialog */}
      {showMove && (
        <MoveDialog fileId={fileId!} currentParentId={file.parentId} onClose={() => setSearchParams(p => { p.delete('move'); return p; })}
          onMove={(targetId) => { moveFile(fileId!, targetId); setSearchParams(p => { p.delete('move'); return p; }); }} />
      )}

      {/* Share Dialog */}
      {showShare && (
        <Dialog title="分享" onClose={() => setSearchParams(p => { p.delete('share'); return p; })}>
          <input className="w-full px-3 py-2.5 border rounded-lg text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            placeholder="输入邮箱地址" value={shareEmail} onChange={e => setShareEmail(e.target.value)} />
          <select className="w-full px-3 py-2.5 border rounded-lg text-sm mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            value={shareRole} onChange={e => setShareRole(e.target.value as PermissionRole)}
            data-action="share.role.select" data-action-type="select">
            <option value="viewer">查看者</option>
            <option value="editor">编辑者</option>
          </select>
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={() => { setShareEmail(''); setSearchParams(p => { p.delete('share'); return p; }); }}>取消</button>
            <button className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium" onClick={handleShare} data-action="share.email.submit" data-action-type="submit">发送</button>
          </div>
        </Dialog>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <Dialog title="移至回收站？" onClose={() => setSearchParams(p => { p.delete('deleteConfirm'); return p; })}>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">"{file.name}" 将被移至回收站。</p>
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('deleteConfirm'); return p; })}>取消</button>
            <button className="flex-1 py-2.5 text-sm text-white bg-red-600 rounded-lg font-medium" onClick={handleDelete} data-action="file.delete.confirm" data-action-type="submit">移至回收站</button>
          </div>
        </Dialog>
      )}

      {/* Permanent Delete Confirm */}
      {showPermDeleteConfirm && (
        <Dialog title="永久删除？" onClose={() => setSearchParams(p => { p.delete('permDeleteConfirm'); return p; })}>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">"{file.name}" 将被永久删除，无法恢复。</p>
          <div className="flex gap-3">
            <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('permDeleteConfirm'); return p; })}>取消</button>
            <button className="flex-1 py-2.5 text-sm text-white bg-red-600 rounded-lg font-medium" onClick={handlePermDelete} data-action="file.deleteForever.confirm" data-action-type="submit">永久删除</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────

function MetaRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-xs text-gray-400 w-20 flex-shrink-0">{label}</span>
      <span className={`text-xs text-right flex-1 ml-2 ${danger ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${danger ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}
      onClick={onClick}
    >
      <IconRenderer name={icon} size={18} className={danger ? 'text-red-400' : 'text-gray-500'} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MenuButton({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg ${danger ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}
      onClick={onClick}>
      <IconRenderer name={icon} size={20} className={danger ? 'text-red-400' : 'text-gray-500'} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function MoveDialog({ fileId, currentParentId, onClose, onMove }: { fileId: string; currentParentId: string | null; onClose: () => void; onMove: (targetId: string | null) => void }) {
  const files = useGoogleDriveStore(s => s.files);
  const folders = React.useMemo(() => files.filter(f => f.type === 'folder' && !f.trashed && f.id !== fileId), [files, fileId]);
  const [selectedTargetId, setSelectedTargetId] = React.useState<string | null>(null);
  const [currentView, setCurrentView] = React.useState<'root' | 'folder'>('root');
  const [viewFolderId, setViewFolderId] = React.useState<string | null>(null);

  const rootFolders = folders.filter(f => f.parentId === null);
  const subFolders = viewFolderId ? folders.filter(f => f.parentId === viewFolderId) : [];

  return (
    <Dialog title="移动到..." onClose={onClose}>
      {currentView === 'root' ? (
        <div className="max-h-60 overflow-y-auto mb-4">
          <button className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm ${selectedTargetId === null ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}
            onClick={() => setSelectedTargetId(null)}>
            <IconRenderer name="IcFolder" size={18} className="text-gray-400" />
            <span>我的云端硬盘（根目录）</span>
            {selectedTargetId === null && <IcCheck size={16} className="ml-auto text-blue-600" />}
          </button>
          {rootFolders.map(f => (
            <button key={f.id} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => { setCurrentView('folder'); setViewFolderId(f.id); }}>
              <IconRenderer name="IcFolder" size={18} className="text-gray-400" />
              <span className="flex-1 text-left">{f.name}</span>
              <IconRenderer name="IcChevronRight" size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto mb-4">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 mb-1"
            onClick={() => { setCurrentView('root'); setViewFolderId(null); }}>
            <IconRenderer name="IcChevronLeft" size={16} /> 返回上级
          </button>
          <button className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm ${selectedTargetId === viewFolderId ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}
            onClick={() => setSelectedTargetId(viewFolderId)}>
            <IconRenderer name="IcFolder" size={18} className="text-gray-400" />
            <span>当前文件夹</span>
            {selectedTargetId === viewFolderId && <IcCheck size={16} className="ml-auto text-blue-600" />}
          </button>
          {subFolders.map(f => (
            <button key={f.id} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => { setViewFolderId(f.id); }}>
              <IconRenderer name="IcFolder" size={18} className="text-gray-400" />
              <span className="flex-1 text-left">{f.name}</span>
              <IconRenderer name="IcChevronRight" size={16} className="text-gray-400" />
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={onClose}>取消</button>
        <button className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium"
          onClick={() => onMove(selectedTargetId ?? null)} data-action="move.target.confirm" data-action-type="submit">
          移动到此位置
        </button>
      </div>
    </Dialog>
  );
}
