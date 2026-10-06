import React, { useState, useEffect } from 'react';
import { ParsedAgreementInput, Agreement, SentinelStatus } from '@kofu/shared';
import { Navbar } from './components/Navbar';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { StatusBar } from './components/StatusBar';
import { MarketingPage } from './pages/MarketingPage';
import { HomePage } from './pages/HomePage';
import { CreateAgreementPage } from './pages/CreateAgreementPage';
import { AgreementDetailPage } from './pages/AgreementDetailPage';
import { NegotiationPage } from './pages/NegotiationPage';
import { ActivityPage } from './pages/ActivityPage';
import { api } from './lib/api';

type TabType = 'landing' | 'home' | 'create' | 'detail' | 'negotiation' | 'activity';

const DEFAULT_PARSED: ParsedAgreementInput = {
  counterparty: 'David',
  counterpartyType: 'human',
  amount: 50,
  currency: 'USDC',
  condition: 'Website delivered and verified',
  deadline: 'Tomorrow',
  escrowRequired: true,
  rawText: 'Pay David 50 USDC when website is delivered tomorrow',
  confidence: 0.96,
  autonomyLevel: 'ASSISTED',
};

const getInitialAgreementIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('agreement') || params.get('id');
  if (fromQuery) return fromQuery;

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'agreement' && pathParts[1]) return pathParts[1];
  if (pathParts[0] === 'app' && pathParts[1] === 'agreements' && pathParts[2]) return pathParts[2];
  return null;
};

const getInitialTabFromUrl = (): TabType => {
  if (typeof window === 'undefined') return 'landing';
  const agrId = getInitialAgreementIdFromUrl();
  if (agrId) return 'detail';
  const path = window.location.pathname.toLowerCase();
  if (path === '/app/agreements' || path === '/app/activity') return 'activity';
  if (path === '/app/negotiation') return 'negotiation';
  if (path.startsWith('/app')) return 'home';
  return 'landing';
};

export function App() {
  const initialAgrId = getInitialAgreementIdFromUrl();
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(initialAgrId);
  const [currentTab, setCurrentTab] = useState<TabType>(getInitialTabFromUrl);
  const [parsedData, setParsedData] = useState<ParsedAgreementInput | null>(null);
  const [sentinelStatus, setSentinelStatus] = useState<SentinelStatus | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Sync browser URL whenever currentTab changes
  const updateTabAndUrl = (tab: TabType, agrId?: string) => {
    setCurrentTab(tab);
    let targetPath = '/';
    const activeId = agrId || selectedAgreementId;
    if (tab === 'home' || tab === 'create') targetPath = '/app';
    else if (tab === 'detail' && activeId) targetPath = `/app?agreement=${activeId}`;
    else if (tab === 'activity' || tab === 'detail') targetPath = '/app/agreements';
    else if (tab === 'negotiation') targetPath = '/app/negotiation';
    else targetPath = '/';

    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const tab = getInitialTabFromUrl();
      setCurrentTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Poll Sentinel status periodically
  const fetchStatus = async () => {
    try {
      const status = await api.getSentinelStatus();
      setSentinelStatus(status);
    } catch {
      // Handled silently
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleParsed = (parsed: ParsedAgreementInput) => {
    setParsedData(parsed);
    updateTabAndUrl('create');
  };

  const handleTestPrompt = async (prompt: string) => {
    try {
      const parsed = await api.parseAgreement(prompt);
      setParsedData(parsed);
      updateTabAndUrl('create');
    } catch {
      updateTabAndUrl('home');
    }
  };

  const handleAgreementCreated = (agreement: Agreement) => {
    setSelectedAgreementId(agreement.id);
    updateTabAndUrl('detail', agreement.id);
    fetchStatus();
  };

  const handleSelectAgreement = (id: string) => {
    setSelectedAgreementId(id);
    updateTabAndUrl('detail', id);
  };

  const handleNavigate = (tab: 'landing' | 'home' | 'create' | 'agreements' | 'negotiation' | 'activity') => {
    if (tab === 'agreements') {
      updateTabAndUrl('activity');
    } else {
      updateTabAndUrl(tab);
    }
    setMobileSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Case 1: Landing Page Mode (Public Marketing Website at "/")
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#08080A] text-[#F3F3F6] selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
        <Navbar
          currentTab="landing"
          onNavigate={handleNavigate}
        />
        <MarketingPage
          onLaunchApp={() => handleNavigate('home')}
          onTestPrompt={handleTestPrompt}
        />
      </div>
    );
  }

  // Case 2: Product App Mode (at "/app" with ChatGPT-Style Navigation)
  return (
    <div className="flex h-screen bg-[#08080A] text-[#F3F3F6] overflow-hidden selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
      {/* Responsive Left Side Nav (Desktop collapsible / Mobile slide-over drawer) */}
      <AppSidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onSelectAgreement={handleSelectAgreement}
        onNewAgreement={() => handleNavigate('create')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#08080A]">
        {/* Workspace Top Header */}
        <AppHeader
          currentTab={currentTab}
          selectedAgreementId={selectedAgreementId}
          onToggleSidebar={handleToggleSidebar}
          sentinelStatus={sentinelStatus}
        />

        {/* Scrollable Workspace Pages */}
        <main className="flex-1 overflow-y-auto pb-14">
          {currentTab === 'home' && (
            <HomePage
              onParsed={handleParsed}
              onOpenNegotiationDemo={() => handleNavigate('negotiation')}
            />
          )}

          {currentTab === 'create' && (
            <CreateAgreementPage
              initialParsed={parsedData || DEFAULT_PARSED}
              onBack={() => handleNavigate('home')}
              onAgreementCreated={handleAgreementCreated}
            />
          )}

          {currentTab === 'detail' && selectedAgreementId && (
            <AgreementDetailPage
              agreementId={selectedAgreementId}
              onBack={() => handleNavigate('agreements')}
              onOpenNegotiation={() => handleNavigate('negotiation')}
            />
          )}

          {currentTab === 'negotiation' && (
            <NegotiationPage
              onAgreementCreated={handleAgreementCreated}
            />
          )}

          {currentTab === 'activity' && (
            <ActivityPage
              onSelectAgreement={handleSelectAgreement}
            />
          )}
        </main>

        {/* Persistent Workspace Status Bar */}
        <StatusBar status={sentinelStatus} />
      </div>
    </div>
  );
}

export default App;
