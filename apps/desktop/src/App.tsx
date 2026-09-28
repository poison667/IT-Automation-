import { useState, useEffect } from 'react';
import { ViewTab, ServiceDefinition, Job, Asset, MonitoringCheck, Incident, ReportItem, UserContext } from './types';
import { api } from './lib/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { SlideOverDrawer } from './components/SlideOverDrawer';

// Views
import { DashboardView } from './views/DashboardView';
import { MarketplaceView } from './views/MarketplaceView';
import { ServiceConfigView } from './views/ServiceConfigView';
import { ActiveJobsView } from './views/ActiveJobsView';
import { JobDetailView } from './views/JobDetailView';
import { AssetsView } from './views/AssetsView';
import { MonitoringView } from './views/MonitoringView';
import { DataWorkbenchView } from './views/DataWorkbenchView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { AnalyticsView } from './views/AnalyticsView';
import { AutomationBuilderView } from './views/AutomationBuilderView';
import { AiWorkbenchView } from './views/AiWorkbenchView';
import { ReportsVaultView } from './views/ReportsVaultView';
import { BillingView } from './views/BillingView';
import { SettingsAdminView } from './views/SettingsAdminView';

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [configuringServiceId, setConfiguringServiceId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global State
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [checks, setChecks] = useState<MonitoringCheck[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // Initial Data Fetch
  const refreshUserData = async () => {
    try {
      const res = await api.getMe();
      setUserContext({
        id: res.user.id || 'usr_default_admin',
        email: res.user.email || 'admin@acme.corp',
        full_name: res.user.full_name || 'Alex Vance (Principal Architect)',
        role: res.user.role || 'OWNER',
        org_id: res.organization.id || 'org_default_acme',
        org_name: res.organization.name || 'Acme Corporation (Global Ops)',
        plan: res.organization.plan || 'ENTERPRISE',
        credit_balance: res.organization.credit_balance || 4850
      });
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = async () => {
    try {
      const [srvs, jbs, asts, chks, incs, reps] = await Promise.all([
        api.getServices(),
        api.getJobs(),
        api.getAssets(),
        api.getChecks(),
        api.getIncidents(),
        api.getReports()
      ]);
      setServices(srvs);
      setJobs(jbs);
      setAssets(asts);
      setChecks(chks);
      setIncidents(incs);
      setReports(reps);
    } catch (e) {
      console.error("Initial sync error:", e);
    }
  };

  useEffect(() => {
    refreshUserData();
    refreshAll();
    const interval = setInterval(refreshAll, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchService = (serviceId: string) => {
    setConfiguringServiceId(serviceId);
  };

  const handleSubmitJob = async (serviceId: string, params: Record<string, any>, assetId?: string) => {
    const res = await api.createJob(serviceId, params, assetId);
    setConfiguringServiceId(null);
    await refreshAll();
    await refreshUserData();
    setSelectedJobId(res.job_id);
    setCurrentTab('jobs');
  };

  const configuringService = services.find(s => s.id === configuringServiceId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedJobId(null);
        }}
        activeJobsCount={jobs.filter(j => ['QUEUED', 'RUNNING', 'ANALYZING', 'QUALITY_CHECK'].includes(j.status)).length}
        incidentsCount={incidents.filter(i => i.status !== 'RESOLVED').length}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          userContext={userContext}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <main className="flex-1 overflow-hidden">
          {selectedJobId ? (
            <JobDetailView
              jobId={selectedJobId}
              onBack={() => setSelectedJobId(null)}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  onNavigate={setCurrentTab}
                  onLaunchService={handleLaunchService}
                  onViewJob={(jobId) => setSelectedJobId(jobId)}
                  jobs={jobs}
                  checks={checks}
                  incidents={incidents}
                  creditBalance={userContext?.credit_balance || 4850}
                />
              )}

              {currentTab === 'marketplace' && (
                <MarketplaceView
                  services={services}
                  onLaunchService={handleLaunchService}
                />
              )}

              {currentTab === 'jobs' && (
                <ActiveJobsView
                  jobs={jobs}
                  onRefresh={refreshAll}
                  onViewJob={(jobId) => setSelectedJobId(jobId)}
                />
              )}

              {currentTab === 'assets' && (
                <AssetsView
                  assets={assets}
                  onRefresh={refreshAll}
                />
              )}

              {currentTab === 'monitoring' && (
                <MonitoringView
                  checks={checks}
                  incidents={incidents}
                  onRefresh={refreshAll}
                />
              )}

              {currentTab === 'data' && (
                <DataWorkbenchView />
              )}

              {currentTab === 'documents' && (
                <DocumentVaultView />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView />
              )}

              {currentTab === 'automations' && (
                <AutomationBuilderView />
              )}

              {currentTab === 'ai' && (
                <AiWorkbenchView />
              )}

              {currentTab === 'reports' && (
                <ReportsVaultView
                  reports={reports}
                  onRefresh={refreshAll}
                />
              )}

              {currentTab === 'billing' && (
                <BillingView
                  onRefreshUser={refreshUserData}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsAdminView />
              )}
            </>
          )}
        </main>
      </div>

      {/* Dynamic Service Configurator Drawer */}
      <SlideOverDrawer
        isOpen={!!configuringService}
        onClose={() => setConfiguringServiceId(null)}
        title="Configure & Launch Autonomous Service"
        subtitle={configuringService?.name}
      >
        {configuringService && (
          <ServiceConfigView
            service={configuringService}
            assets={assets}
            userCreditBalance={userContext?.credit_balance || 4850}
            onSubmitJob={handleSubmitJob}
            onCancel={() => setConfiguringServiceId(null)}
          />
        )}
      </SlideOverDrawer>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setSelectedJobId(null);
        }}
        onLaunchService={handleLaunchService}
      />
    </div>
  );
}
