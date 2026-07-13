import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleDriveStore } from '../state';
import { IconRenderer, IcArrowLeft, IcUsers, IcLink, IcGlobe, IcLock, IcPlus, IcChevronRight, IcTrash, IcCheck, IcX } from '../res/icons';
import type { PermissionRole, LinkAccess } from '../types';

export default function ManageAccessPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const files = useGoogleDriveStore(s => s.files);
  const updatePermission = useGoogleDriveStore(s => s.updatePermission);
  const removePermission = useGoogleDriveStore(s => s.removePermission);
  const setLinkAccess = useGoogleDriveStore(s => s.setLinkAccess);
  const addPermission = useGoogleDriveStore(s => s.addPermission);

  const file = React.useMemo(() => files.find(f => f.id === fileId), [files, fileId]);

  const showShare = searchParams.get('share') === 'open';
  const showLinkAccess = searchParams.get('linkAccess') === 'open';

  const [shareEmail, setShareEmail] = React.useState('');
  const [shareName, setShareName] = React.useState('');
  const [shareRole, setShareRole] = React.useState<PermissionRole>('viewer');

  if (!file) {
    return (
      <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
        <div className="flex items-center gap-2 px-3 py-2"><button onClick={() => navigate(-1)} className="p-1"><IcArrowLeft size={22} /></button><span className="text-lg">文件未找到</span></div>
      </div>
    );
  }

  const handleShare = () => {
    if (shareEmail.trim() && fileId) {
      addPermission(fileId, shareEmail.trim(), shareName.trim() || shareEmail.trim(), shareRole);
      setShareEmail(''); setShareName('');
      setSearchParams(p => { p.delete('share'); return p; });
    }
  };

  const linkAccessLabel = (la: LinkAccess) => {
    if (la === 'restricted') return '受限';
    if (la === 'anyone_viewer') return '知道链接的任何人 — 查看者';
    return '知道链接的任何人 — 编辑者';
  };

  return (
    <div className="flex flex-col h-full pt-10 bg-white dark:bg-[#1E1E1E]" data-status-bar-foreground="dark">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-1"><IcArrowLeft size={22} className="text-gray-700 dark:text-gray-300" /></button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">管理访问权限</h1>
      </div>

      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        <div className="px-4 py-4">
          {/* File info */}
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">{file.name}</div>

          {/* People with access */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">有权访问的用户</h3>
              <button className="p-1" onClick={() => setSearchParams(p => { p.set('share', 'open'); return p; })}>
                <IcPlus size={20} className="text-blue-600" />
              </button>
            </div>
            {file.permissions.map(perm => (
              <div key={perm.id} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <IcUsers size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{perm.name}</div>
                  <div className="text-xs text-gray-400">{perm.email}</div>
                </div>
                {perm.role !== 'owner' ? (
                  <div className="flex items-center gap-1">
                    <select
                      className="text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={perm.role}
                      onChange={e => updatePermission(fileId!, perm.id, e.target.value as PermissionRole)}
                      data-action="permission.role.update" data-action-type="select"
                    >
                      <option value="viewer">查看者</option>
                      <option value="editor">编辑者</option>
                    </select>
                    <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => removePermission(fileId!, perm.id)} data-action="permission.remove" data-action-type="submit">
                      <IcTrash size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">{perm.role === 'owner' ? '所有者' : perm.role}</span>
                )}
              </div>
            ))}
          </div>

          {/* Link access */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">链接访问权限</h3>
            <button
              className="flex items-center gap-3 w-full px-3 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setSearchParams(p => { p.set('linkAccess', 'open'); return p; })}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {file.linkAccess === 'restricted' ? <IcLock size={18} className="text-gray-500" /> : <IcGlobe size={18} className="text-green-500" />}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-gray-900 dark:text-gray-100">{linkAccessLabel(file.linkAccess)}</div>
              </div>
              <IcChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {showShare && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('share'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">添加用户</h3>
            <input className="w-full px-3 py-2.5 border rounded-lg text-sm mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="输入邮箱地址" value={shareEmail} onChange={e => setShareEmail(e.target.value)} />
            <select className="w-full px-3 py-2.5 border rounded-lg text-sm mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              value={shareRole} onChange={e => setShareRole(e.target.value as PermissionRole)}>
              <option value="viewer">查看者</option>
              <option value="editor">编辑者</option>
            </select>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 text-sm text-gray-600 border rounded-lg" onClick={() => { setShareEmail(''); setSearchParams(p => { p.delete('share'); return p; }); }}>取消</button>
              <button className="flex-1 py-2.5 text-sm text-white bg-blue-600 rounded-lg font-medium" onClick={handleShare}>添加</button>
            </div>
          </div>
        </div>
      )}

      {/* Link Access Dialog */}
      {showLinkAccess && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSearchParams(p => { p.delete('linkAccess'); return p; })}>
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">链接访问权限</h3>
            {(['restricted', 'anyone_viewer', 'anyone_editor'] as LinkAccess[]).map(la => (
              <button key={la}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm ${file.linkAccess === la ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-900 dark:text-gray-100'}`}
                onClick={() => { setLinkAccess(fileId!, la); setSearchParams(p => { p.delete('linkAccess'); return p; }); }}
                data-action="linkAccess.type.select" data-action-type="select">
                <span>{linkAccessLabel(la)}</span>
                {file.linkAccess === la && <IcCheck size={16} className="ml-auto text-blue-600" />}
              </button>
            ))}
            <button className="w-full py-2.5 mt-3 text-sm text-gray-600 border rounded-lg" onClick={() => setSearchParams(p => { p.delete('linkAccess'); return p; })}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
