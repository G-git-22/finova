import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { SupplierCockpit } from './pages/SupplierCockpit';
import { FinancierConsole } from './pages/FinancierConsole';
import { PortfolioTwin } from './components/PortfolioTwin';
import { SyndicationBar } from './components/SyndicationBar';
import { ChaosSandbox } from './components/ChaosSandbox';
import { VoiceCopilot } from './components/VoiceCopilot';
import { UserRole, VoiceTopic } from '@finova/shared';

export const App: React.FC = () => {
  const [user, setUser] = useState<{
    email: string;
    role: UserRole;
    entity_name: string;
    identifier: string;
    liquidity?: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>('cockpit');
  const [voiceTriggerTopic, setVoiceTriggerTopic] = useState<VoiceTopic | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('FINOVA_USER_DATA');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleLoginSuccess = (userData: {
    email: string;
    role: UserRole;
    entity_name: string;
    identifier: string;
    liquidity?: number;
  }) => {
    setUser(userData);
    setActiveTab('cockpit');
  };

  const handleLogout = () => {
    localStorage.removeItem('FINOVA_AUTH_TOKEN');
    localStorage.removeItem('FINOVA_USER_DATA');
    setUser(null);
  };

  const handleSwitchRole = () => {
    if (!user) return;
    const newRole: UserRole = user.role === 'SUPPLIER' ? 'LENDER' : 'SUPPLIER';
    const updatedUser = {
      ...user,
      role: newRole,
      entity_name: newRole === 'SUPPLIER' ? 'Alpha Precision Components Ltd' : 'Apex Institutional Bank',
      identifier: newRole === 'SUPPLIER' ? '27AABCA1234F1Z9' : 'INST-8821',
      liquidity: newRole === 'LENDER' ? 4000000 : undefined
    };
    setUser(updatedUser);
    localStorage.setItem('FINOVA_USER_DATA', JSON.stringify(updatedUser));
  };

  const handleTriggerVoice = (topic: VoiceTopic) => {
    setVoiceTriggerTopic(topic);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Navbar
        userRole={user.role}
        entityName={user.entity_name}
        identifier={user.identifier}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onOpenVoice={() => setVoiceTriggerTopic('TOPSIS_DEAL')}
      />

      <main className="flex-1">
        {activeTab === 'cockpit' && (
          user.role === 'SUPPLIER' ? (
            <SupplierCockpit onTriggerVoice={handleTriggerVoice} />
          ) : (
            <FinancierConsole
              providerName={user.entity_name}
              identifier={user.identifier}
              liquidity={user.liquidity || 4000000}
            />
          )
        )}

        {activeTab === 'portfolio' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <PortfolioTwin onTriggerVoice={handleTriggerVoice} />
          </div>
        )}

        {activeTab === 'syndication' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <SyndicationBar invoiceAmount={5000000} onTriggerVoice={handleTriggerVoice} />
          </div>
        )}

        {activeTab === 'chaos' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <ChaosSandbox onTriggerVoice={handleTriggerVoice} />
          </div>
        )}
      </main>

      {/* ElevenLabs Voice Intelligence Copilot Widget */}
      <VoiceCopilot
        triggerTopic={voiceTriggerTopic}
        onClearTrigger={() => setVoiceTriggerTopic(null)}
        currentContext={{ activeTab }}
      />

      <footer className="glass-panel border-t border-surface-border py-4 px-6 text-center text-xs font-mono text-slate-500">
        FINOVA // Autonomous Supply Chain Capital Consensus Engine • ElevenLabs AI Voice • SHA-256 VeriShield • TOPSIS
      </footer>
    </div>
  );
};
