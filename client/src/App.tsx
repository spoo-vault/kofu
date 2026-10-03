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

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'home' | 'create' | 'detail' | 'negotiation' | 'activity'>('landing');
  const [parsedData, setParsedData] = useState<ParsedAgreementInput | null>(null);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [sentinelStatus, setSentinelStatus] = useState<SentinelStatus | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

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
    setCurrentTab('create');
  };

  const handleTestPrompt = async (prompt: string) => {
    try {
      const parsed = await api.parseAgreement(prompt);
      setParsedData(parsed);
      setCurrentTab('create');
    } catch {
      setCurrentTab('home');
    }
  };

  const handleAgreementCreated = (agreement: Agreement) => {
    setSelectedAgreementId(agreement.id);
    setCurrentTab('detail');
    fetchStatus();
  };

  const handleSelectAgreement = (id: string) => {
    setSelectedAgreementId(id);
    setCurrentTab('detail');
  };

  const handleNavigate = (tab: 'landing' | 'home' | 'agreements' | 'negotiation' | 'activity') => {
    if (tab === 'agreements') {
      setCurrentTab('activity');
    } else {
      setCurrentTab(tab);
    }
  };

  // Case 1: Landing Page Mode (Public Marketing Website)
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#08080A] text-[#F3F3F6] selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
        <Navbar
          currentTab="landing"
          onNavigate={handleNavigate}
        />
        <MarketingPage
          onLaunchApp={() => setCurrentTab('home')}
          onTestPrompt={handleTestPrompt}
        />
      </div>
    );
  }

  // Case 2: Product App Mode (ChatGPT-Style Side Navigation)
  return (
    <div className="flex h-screen bg-[#08080A] text-[#F3F3F6] overflow-hidden selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
      {/* Collapsible Left Side Nav */}
      <AppSidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onSelectAgreement={handleSelectAgreement}
        onNewAgreement={() => setCurrentTab('home')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#08080A]">
        {/* Workspace Top Header */}
        <AppHeader
          currentTab={currentTab}
          selectedAgreementId={selectedAgreementId}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sentinelStatus={sentinelStatus}
        />

        {/* Scrollable Workspace Pages */}
        <main className="flex-1 overflow-y-auto pb-14">
          {currentTab === 'home' && (
            <HomePage
              onParsed={handleParsed}
              onOpenNegotiationDemo={() => setCurrentTab('negotiation')}
            />
          )}

          {currentTab === 'create' && parsedData && (
            <CreateAgreementPage
              initialParsed={parsedData}
              onBack={() => setCurrentTab('home')}
              onAgreementCreated={handleAgreementCreated}
            />
          )}

          {currentTab === 'detail' && selectedAgreementId && (
            <AgreementDetailPage
              agreementId={selectedAgreementId}
              onBack={() => setCurrentTab('activity')}
              onOpenNegotiation={() => {
                setCurrentTab('negotiation');
              }}
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
