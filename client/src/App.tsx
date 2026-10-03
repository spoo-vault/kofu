import React, { useState, useEffect } from 'react';
import { ParsedAgreementInput, Agreement, SentinelStatus } from '@kofu/shared';
import { Navbar } from './components/Navbar';
import { StatusBar } from './components/StatusBar';
import { HomePage } from './pages/HomePage';
import { CreateAgreementPage } from './pages/CreateAgreementPage';
import { AgreementDetailPage } from './pages/AgreementDetailPage';
import { NegotiationPage } from './pages/NegotiationPage';
import { ActivityPage } from './pages/ActivityPage';
import { api } from './lib/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'create' | 'detail' | 'negotiation' | 'activity'>('home');
  const [parsedData, setParsedData] = useState<ParsedAgreementInput | null>(null);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [sentinelStatus, setSentinelStatus] = useState<SentinelStatus | null>(null);

  // Poll Sentinel status periodically
  const fetchStatus = async () => {
    try {
      const status = await api.getSentinelStatus();
      setSentinelStatus(status);
    } catch (e) {
      console.warn('Sentinel status fetch failed');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleParsed = (parsed: ParsedAgreementInput) => {
    setParsedData(parsed);
    setCurrentTab('create');
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
    <div className="min-h-screen bg-[#08080A] text-[#F3F3F6] font-mono selection:bg-[#00FF66]/20 selection:text-[#00FF66] pb-16">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab === 'create' ? 'home' : currentTab}
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
            onOpenNegotiation={(agree) => {
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

      {/* Persistent Bottom Status Bar */}
      <StatusBar status={sentinelStatus} />
    </div>
  );
}

export default App;
