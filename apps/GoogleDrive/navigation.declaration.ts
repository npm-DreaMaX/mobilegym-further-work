/**
 * GoogleDrive navigation declaration.
 */
import type { NavigationDeclaration } from './navigation.types';

export type TransitionId =
  | 'tab.home' | 'tab.starred' | 'tab.shared' | 'tab.files'
  | 'home.myDrive.open' | 'home.computers.open' | 'home.sharedWithMe.open'
  | 'home.recent.open' | 'home.starred.open' | 'home.trash.open' | 'home.search.open'
  | 'folder.open' | 'file.detail.open'
  | 'detail.manageAccess.open'
  | 'search.search.open'
  | 'newMenu.folder.open';

export type ActionId =
  | 'search.query.submit' | 'search.query.clear'
  | 'search.filter.type.select' | 'search.filter.owner.submit'
  | 'sort.option.select'
  | 'newFolder.name.submit'
  | 'rename.name.submit' | 'move.target.confirm'
  | 'share.email.submit' | 'share.role.select'
  | 'permission.role.update' | 'permission.remove'
  | 'linkAccess.type.select'
  | 'file.star.toggle' | 'file.delete.confirm'
  | 'file.restore.confirm' | 'file.deleteForever.confirm';

const UI_TAP = { placement: 'content' as const, icon: '', gesture: 'tap' as const };
const UI_TABBAR = (icon: string) => ({ placement: 'tabbar' as const, icon, gesture: 'tap' as const });
const MAIN_SCROLL = [{ name: 'main', direction: 'vertical' as const, description: 'Page main scroll container' }];

export const NAVIGATION_DECLARATION: NavigationDeclaration = {
  app: 'googledrive',
  routes: [
    {
      path: '/', component: 'HomePage', params: {}, entryPoint: 'home',
      uiStates: [
        { id: 'home.base', search: {}, description: 'Home', actions: [
          { id: 'newFolder.name.submit', label: 'Create folder', behavior: 'submit' },
          { id: 'sort.option.select', label: 'Sort', behavior: 'other' },
        ] },
        { id: 'home.sort.open', search: { sort: 'open' }, description: 'Sort menu', actions: [] },
        { id: 'home.filter.open', search: { filter: 'open' }, description: 'Filter menu', actions: [] },
        { id: 'home.newMenu.open', search: { newMenu: 'open' }, description: 'New menu', actions: [] },
      ],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Home',
    },
    {
      path: '/files', component: 'MyDrivePage', params: {}, entryPoint: 'none',
      uiStates: [
        { id: 'myDrive.base', search: {}, description: 'My Drive', actions: [
          { id: 'sort.option.select', label: 'Sort', behavior: 'other' },
        ] },
        { id: 'myDrive.sort.open', search: { sort: 'open' }, description: 'Sort menu', actions: [] },
      ],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'My Drive',
    },
    {
      path: '/folder/:folderId', component: 'FolderPage', params: { folderId: 'string' }, entryPoint: 'none',
      uiStates: [
        { id: 'folder.base', search: {}, description: 'Folder', actions: [
          { id: 'newFolder.name.submit', label: 'Create folder', behavior: 'submit' },
          { id: 'sort.option.select', label: 'Sort', behavior: 'other' },
        ] },
        { id: 'folder.sort.open', search: { sort: 'open' }, description: 'Sort menu', actions: [] },
        { id: 'folder.newMenu.open', search: { newMenu: 'open' }, description: 'New menu', actions: [] },
      ],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Folder',
    },
    {
      path: '/file/:fileId', component: 'FileDetailPage', params: { fileId: 'string' }, entryPoint: 'none',
      uiStates: [
        { id: 'fileDetail.base', search: {}, description: 'File detail', actions: [
          { id: 'file.star.toggle', label: 'Toggle star', behavior: 'toggle' },
          { id: 'rename.name.submit', label: 'Rename', behavior: 'submit' },
          { id: 'move.target.confirm', label: 'Confirm move', behavior: 'submit' },
          { id: 'share.email.submit', label: 'Share', behavior: 'submit' },
          { id: 'share.role.select', label: 'Select role', behavior: 'other' },
          { id: 'file.delete.confirm', label: 'Delete', behavior: 'submit' },
          { id: 'file.deleteForever.confirm', label: 'Perm delete', behavior: 'submit' },
          { id: 'file.restore.confirm', label: 'Restore', behavior: 'submit' },
        ] },
        { id: 'fileDetail.menu.open', search: { menu: 'open' }, description: 'Menu', actions: [] },
        { id: 'fileDetail.rename.open', search: { rename: 'open' }, description: 'Rename', actions: [] },
        { id: 'fileDetail.move.open', search: { move: 'open' }, description: 'Move', actions: [] },
        { id: 'fileDetail.share.open', search: { share: 'open' }, description: 'Share', actions: [] },
        { id: 'fileDetail.deleteConfirm.open', search: { deleteConfirm: 'open' }, description: 'Delete', actions: [] },
        { id: 'fileDetail.permDeleteConfirm.open', search: { permDeleteConfirm: 'open' }, description: 'Perm delete', actions: [] },
      ],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'File detail',
    },
    {
      path: '/file/:fileId/preview', component: 'FilePreviewPage', params: { fileId: 'string' }, entryPoint: 'none',
      uiStates: [{ id: 'filePreview.base', search: {}, description: 'Preview', actions: [] }],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Preview',
    },
    {
      path: '/file/:fileId/access', component: 'ManageAccessPage', params: { fileId: 'string' }, entryPoint: 'none',
      uiStates: [
        { id: 'manageAccess.base', search: {}, description: 'Manage access', actions: [
          { id: 'permission.role.update', label: 'Update role', behavior: 'other' },
          { id: 'permission.remove', label: 'Remove', behavior: 'submit' },
          { id: 'linkAccess.type.select', label: 'Select link access', behavior: 'other' },
          { id: 'share.email.submit', label: 'Share', behavior: 'submit' },
          { id: 'share.role.select', label: 'Select role', behavior: 'other' },
        ] },
        { id: 'manageAccess.linkAccess.open', search: { linkAccess: 'open' }, description: 'Link access', actions: [] },
        { id: 'manageAccess.share.open', search: { share: 'open' }, description: 'Add people', actions: [] },
      ],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Manage access',
    },
    {
      path: '/starred', component: 'StarredPage', params: {}, entryPoint: 'none',
      uiStates: [{ id: 'starred.base', search: {}, description: 'Starred', actions: [] }],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Starred',
    },
    {
      path: '/shared', component: 'SharedPage', params: {}, entryPoint: 'none',
      uiStates: [{ id: 'shared.base', search: {}, description: 'Shared', actions: [] }],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Shared',
    },
    {
      path: '/recent', component: 'RecentPage', params: {}, entryPoint: 'none',
      uiStates: [{ id: 'recent.base', search: {}, description: 'Recent', actions: [] }],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Recent',
    },
    {
      path: '/computers', component: 'ComputersPage', params: {}, entryPoint: 'none',
      uiStates: [{ id: 'computers.base', search: {}, description: 'Computers', actions: [] }],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Computers',
    },
    {
      path: '/trash', component: 'TrashPage', params: {}, entryPoint: 'none',
      uiStates: [{ id: 'trash.base', search: {}, description: 'Trash', actions: [] }],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Trash',
    },
    {
      path: '/search', component: 'SearchResultsPage', params: {}, entryPoint: 'none',
      uiStates: [
        { id: 'searchResults.base', search: {}, description: 'Search', actions: [
          { id: 'search.query.submit', label: 'Search', behavior: 'submit' },
          { id: 'search.query.clear', label: 'Clear', behavior: 'submit' },
          { id: 'search.filter.type.select', label: 'Filter type', behavior: 'other' },
          { id: 'search.filter.owner.submit', label: 'Filter owner', behavior: 'submit' },
          { id: 'sort.option.select', label: 'Sort', behavior: 'other' },
        ] },
        { id: 'searchResults.filter.open', search: { filter: 'open' }, description: 'Filter', actions: [] },
        { id: 'searchResults.sort.open', search: { sort: 'open' }, description: 'Sort', actions: [] },
      ],
      queryParams: {}, scrollContainers: MAIN_SCROLL, description: 'Search',
    },
  ],
  transitions: [
    { id: 'tab.home', from: ['/starred', '/shared', '/files'], to: '/', mode: 'replace', search: {}, searchParams: {}, params: {}, label: '首页', ui: UI_TABBAR('home') },
    { id: 'tab.starred', from: ['/', '/shared', '/files'], to: '/starred', mode: 'replace', search: {}, searchParams: {}, params: {}, label: '星标', ui: UI_TABBAR('starred') },
    { id: 'tab.shared', from: ['/', '/starred', '/files'], to: '/shared', mode: 'replace', search: {}, searchParams: {}, params: {}, label: '已共享', ui: UI_TABBAR('shared') },
    { id: 'tab.files', from: ['/', '/starred', '/shared'], to: '/files', mode: 'replace', search: {}, searchParams: {}, params: {}, label: '文件', ui: UI_TABBAR('files') },
    { id: 'home.myDrive.open', from: '/', to: '/files', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'My Drive', ui: UI_TAP },
    { id: 'home.computers.open', from: '/', to: '/computers', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Computers', ui: UI_TAP },
    { id: 'home.sharedWithMe.open', from: '/', to: '/shared', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Shared', ui: UI_TAP },
    { id: 'home.recent.open', from: '/', to: '/recent', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Recent', ui: UI_TAP },
    { id: 'home.starred.open', from: '/', to: '/starred', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Starred', ui: UI_TAP },
    { id: 'home.trash.open', from: '/', to: '/trash', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Trash', ui: UI_TAP },
    { id: 'home.search.open', from: '/', to: '/search', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Search', ui: UI_TAP },
    { id: 'folder.open', from: ['/files', '/folder/:folderId'], to: '/folder/:folderId', mode: 'push', search: {}, searchParams: {}, params: { folderId: 'string' }, label: 'Open folder', ui: UI_TAP },
    { id: 'file.detail.open', from: ['/files', '/folder/:folderId', '/starred', '/shared', '/recent', '/search', '/trash'], to: '/file/:fileId', mode: 'push', search: {}, searchParams: {}, params: { fileId: 'string' }, label: 'Open file', ui: UI_TAP },
    { id: 'detail.manageAccess.open', from: '/file/:fileId', to: '/file/:fileId/access', mode: 'push', search: {}, searchParams: {}, params: { fileId: 'string' }, label: 'Manage access', ui: UI_TAP },
    { id: 'search.search.open', from: '/', to: '/search', mode: 'push', search: {}, searchParams: {}, params: {}, label: 'Search', ui: UI_TAP },
    { id: 'newMenu.folder.open', from: '/', to: '/', mode: 'replace', search: { newFolder: 'open' }, searchParams: {}, params: {}, label: 'New folder', ui: UI_TAP },
  ],
  capabilities: { historyBack: true },
};
