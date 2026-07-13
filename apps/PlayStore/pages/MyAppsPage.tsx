import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlayStoreNavigate } from '../navigation';
import { usePlayStoreStore } from '../state';
import { IconRenderer } from '../res/icons';
import { AppListItem } from '../components/AppListItem';
import { baseApps } from '../data';
import * as TimeService from '../../../os/TimeService';

const MyAppsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { go } = usePlayStoreNavigate();

  const activeTab = searchParams.get('tab') || 'installed';

  const installedApps = usePlayStoreStore(s => s.installedApps);
  const downloadJobs = usePlayStoreStore(s => s.downloadJobs);
  const cancelDownloadJob = usePlayStoreStore(s => s.cancelDownloadJob);
  const updateApp = usePlayStoreStore(s => s.updateApp);

  const allApps = baseApps();

  const installedList = useMemo(() => {
    return allApps.filter(a => a.id in installedApps);
  }, [allApps, installedApps]);

  const updatesList = useMemo(() => {
    return installedList.filter(a => installedApps[a.id] !== a.storeVersion);
  }, [installedList, installedApps]);

  const downloadList = useMemo(() => {
    return downloadJobs.filter(j => j.status === 'queued' || j.status === 'downloading');
  }, [downloadJobs]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleAppOpen = (appId: string) => {
    go('myApps.app.open', { appId });
  };

  const handleUpdate = (appId: string) => {
    const app = allApps.find(a => a.id === appId);
    if (!app) return;
    const now = TimeService.now();
    updateApp(appId, installedApps[appId], app.storeVersion, now);
  };

  const handleCancelDownload = (jobId: string) => {
    cancelDownloadJob(jobId);
  };

  const tabs = [
    { id: 'installed', label: '已安装' },
    { id: 'updates', label: `更新${updatesList.length > 0 ? ` (${updatesList.length})` : ''}` },
    { id: 'downloads', label: `下载队列${downloadList.length > 0 ? ` (${downloadList.length})` : ''}` },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white pt-10 pb-3 px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">我的应用</span>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            onClick={() => go('myApps.settings.open')}
            data-trigger="myApps.settings.open"
          >
            <IconRenderer name="IcSettings" size={20} />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 mt-3 border-b border-gray-100 -mb-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-app-primary border-app-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              onClick={() => setTab(tab.id)}
              data-trigger={`myApps.tab.${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Installed Tab */}
        {activeTab === 'installed' && (
          <div className="px-4 pt-4">
            {installedList.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {installedList.map(app => (
                  <AppListItem
                    key={app.id}
                    app={app}
                    onClick={handleAppOpen}
                    showRating
                    actionLabel={
                      installedApps[app.id] !== app.storeVersion ? '更新' : '已安装'
                    }
                    onAction={(id) => {
                      if (installedApps[id] !== app.storeVersion) handleUpdate(id);
                      else handleAppOpen(id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <IconRenderer name="IcApps" size={48} />
                <p className="mt-2 text-sm">暂无已安装应用</p>
              </div>
            )}
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="px-4 pt-4">
            {updatesList.length > 0 ? (
              <>
                <button
                  className="w-full mb-3 py-2.5 bg-app-primary text-white text-sm font-medium rounded-full hover:opacity-90"
                  onClick={() => {
                    updatesList.forEach(app => {
                      const now = TimeService.now();
                      updateApp(app.id, installedApps[app.id], app.storeVersion, now);
                    });
                  }}
                >
                  全部更新
                </button>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {updatesList.map(app => (
                    <AppListItem
                      key={app.id}
                      app={app}
                      onClick={handleAppOpen}
                      showRating
                      actionLabel="更新"
                      onAction={handleUpdate}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <IconRenderer name="IcCheck" size={48} />
                <p className="mt-2 text-sm">所有应用已是最新版本</p>
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="px-4 pt-4">
            {downloadList.length > 0 ? (
              <div className="space-y-2">
                {downloadList.map(job => {
                  const app = allApps.find(a => a.id === job.appId);
                  if (!app) return null;
                  return (
                    <div key={job.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <IconRenderer name={app.icon} size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{app.name}</div>
                        <div className="text-xs text-gray-400">{app.size} · {job.status}</div>
                      </div>
                      <button
                        className="flex-shrink-0 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-medium rounded-full hover:bg-red-100"
                        onClick={() => handleCancelDownload(job.id)}
                        data-action="appDetail.cancelDownload.invoke"
                      >
                        取消
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <IconRenderer name="IcDownload" size={48} />
                <p className="mt-2 text-sm">暂无下载任务</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppsPage;
