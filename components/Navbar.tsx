'use client';

import React from 'react';
import { ShieldAlert, Database, Cpu, HardDrive, UserCheck, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  status: any;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Navbar({
  currentRole,
  onRoleChange,
  status,
  onRefresh,
  isRefreshing,
}: NavbarProps) {
  const isPgOnline = status?.rdbms?.connected;
  const isVectorOnline = status?.rdbms?.vectorExtension;
  const isMongoOnline = status?.nosql?.connected;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Project Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">CYBER<span className="text-cyan-400">PULSE</span></span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  Level 3 DBMS
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2">
                <span>PES University</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">Dharshini V (PES1UG24AM428) & Dhruv Rajagopalan (PES1UG24AM086)</span>
              </p>
            </div>
          </div>

          {/* Right Action Bar: System Health & Role Switching */}
          <div className="flex items-center space-x-4">
            
            {/* Database Engine Indicators */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              {/* PostgreSQL */}
              <div className="flex items-center space-x-1.5" title="PostgreSQL 17 Relational Core">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-slate-300 font-mono">Postgres 17</span>
                <span className={`inline-block w-2 h-2 rounded-full ${isPgOnline ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-red-500'}`} />
              </div>

              <span className="text-slate-700">|</span>

              {/* pgvector */}
              <div className="flex items-center space-x-1.5" title="pgvector 384-dim Dense Vector Engine">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-300 font-mono">pgvector</span>
                <span className={`inline-block w-2 h-2 rounded-full ${isVectorOnline ? 'bg-cyan-400 ring-2 ring-cyan-500/20' : 'bg-red-500'}`} />
              </div>

              <span className="text-slate-700">|</span>

              {/* MongoDB */}
              <div className="flex items-center space-x-1.5" title="MongoDB 9.0 Unstructured Telemetry Lake">
                <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-300 font-mono">MongoDB NoSQL</span>
                <span className={`inline-block w-2 h-2 rounded-full ${isMongoOnline ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-red-500'}`} />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Refresh Telemetry & Metrics"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Role-Based Access Control Switcher */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <UserCheck className="h-4 w-4 text-cyan-400 ml-2" />
              <span className="text-xs text-slate-400 font-medium">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-slate-950 text-white text-xs font-semibold rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Administrator">Administrator (Full Access)</option>
                <option value="Security_Analyst">Security Analyst (Triage & Query)</option>
                <option value="Auditor">Auditor (Read-Only Inspection)</option>
              </select>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
