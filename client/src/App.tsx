import React, { useState, useEffect } from 'react';
import { ParsedAgreementInput, Agreement, SentinelStatus } from '@kofu/shared';
import { Navbar } from './components/Navbar';
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

  // Poll Sentinel status periodically
  const fetchStatus = async () => {
    try {
      const status = await api.getSentinelStatus();
      setSentinelStatus(status);
    } catch (e) {
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

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F3F3F6] selection:bg-[#00FF66]/20 selection:text-[#00FF66] pb-16">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab === 'agreements') {
            setCurrentTab('activity');
          } else {
            setCurrentTab(tab);
          }
        }}
        selectedAgreementId={selectedAgreementId}
      />

      {/* Main Content Area */}
      <main className="animate-fade-in">
        {currentTab === 'landing' && (
          <MarketingPage
            onLaunchApp={() => setCurrentTab('home')}
            onTestPrompt={handleTestPrompt}
          />
        )}

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

      {/* Persistent Bottom Status Bar (Shown in app mode) */}
      {currentTab !== 'landing' && (
        <StatusBar status={sentinelStatus} />
      )}
    </div>
  );
}

export default App;
