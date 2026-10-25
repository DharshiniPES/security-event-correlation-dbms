'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import OverviewTab from '@/components/OverviewTab';
import EventsTab from '@/components/EventsTab';
import IncidentsTab from '@/components/IncidentsTab';
import SemanticSearchTab from '@/components/SemanticSearchTab';
import ReportsTab from '@/components/ReportsTab';
import SqlExplorerTab from '@/components/SqlExplorerTab';
import SchemaDocsTab from '@/components/SchemaDocsTab';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Layers, 
  Sparkles, 
  BarChart3, 
  Terminal, 
  FileText 
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentRole, setCurrentRole] = useState('Administrator');

  const [status, setStatus] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  // Fetch all database records and views
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, eventsRes, incidentsRes, reportsRes, metaRes] = await Promise.all([
        fetch('/api/status').then(r => r.json()).catch(() => null),
        fetch('/api/events').then(r => r.json()).catch(() => ({ events: [] })),
        fetch('/api/incidents').then(r => r.json()).catch(() => ({ incidents: [] })),
        fetch('/api/reports').then(r => r.json()).catch(() => null),
        fetch('/api/meta').then(r => r.json()).catch(() => null),
      ]);

      if (statusRes) setStatus(statusRes);
      if (eventsRes?.events) setEvents(eventsRes.events);
      if (incidentsRes?.incidents) setIncidents(incidentsRes.incidents);
      if (reports?.reports || reportsRes?.reports) setReports(reportsRes?.reports || null);
      if (metaRes) setMeta(metaRes);
    } catch (err) {
      console.error('Error fetching CyberPulse data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler for Stored Procedure execution
  const handleTriggerSla = async () => {
    setIsEscalating(true);
    try {
      const res = await fetch('/api/escalate-sla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sla_hours: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Executed Stored Procedure sp_auto_escalate_incidents! Total escalated cases: ${data.escalatedCount}`);
        fetchAllData();
      } else {
        alert(data.error || 'Failed to execute stored procedure.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEscalating(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'SOC Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Security Events (SQL + NoSQL)', icon: ShieldAlert },
    { id: 'incidents', label: 'Incidents & Triage (ACID)', icon: Layers },
    { id: 'semantic', label: 'Semantic Vector Search (pgvector)', icon: Sparkles },
    { id: 'reports', label: 'Analytical Reports (Checkpoint #3)', icon: BarChart3 },
    { id: 'sql', label: 'Live SQL Query Explorer', icon: Terminal },
    { id: 'docs', label: 'ER Diagram & Viva Guide', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation Bar with Student Identity & Database Indicators */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        status={status}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
      />

      {/* Main Tab Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 sticky top-20 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2.5 text-xs no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 glow-blue'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Body Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-slate-400">Connecting to PostgreSQL and MongoDB clusters...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab
                status={status}
                hosts={meta?.hosts || []}
                incidents={incidents}
                onNavigateTab={setActiveTab}
                onTriggerSla={handleTriggerSla}
                isEscalating={isEscalating}
              />
            )}

            {activeTab === 'events' && (
              <EventsTab
                events={events}
                meta={meta}
                currentRole={currentRole}
                onRefresh={fetchAllData}
              />
            )}

            {activeTab === 'incidents' && (
              <IncidentsTab
                incidents={incidents}
                events={events}
                meta={meta}
                currentRole={currentRole}
                onRefresh={fetchAllData}
                onTriggerSla={handleTriggerSla}
                isEscalating={isEscalating}
              />
            )}

            {activeTab === 'semantic' && <SemanticSearchTab />}

            {activeTab === 'reports' && (
              <ReportsTab
                reports={reports}
                loading={isRefreshing}
                onRefresh={fetchAllData}
              />
            )}

            {activeTab === 'sql' && <SqlExplorerTab />}

            {activeTab === 'docs' && <SchemaDocsTab />}
          </div>
        )}
      </main>

      {/* Footer with Student Attribution & University Details */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-400">CYBERPULSE SecOps DBMS</span> &bull; DBMS Experiential Learning – Level 3 Project
            <div className="text-[11px] text-slate-500 mt-0.5">
              PES University &bull; Dept of Computer Science & Engineering
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-slate-400">
            <div>Dharshini V (PES1UG24AM428) &bull; Dhruv Rajagopalan (PES1UG24AM086)</div>
            <div className="text-slate-600">PostgreSQL 17 + pgvector + MongoDB 9.0 Polyglot Engine</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
