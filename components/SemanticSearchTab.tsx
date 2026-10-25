'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Cpu, 
  Zap, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

export default function SemanticSearchTab() {
  const [query, setQuery] = useState('ssh distributed brute force credentials on gateway');
  const [results, setResults] = useState<any[]>([]);
  const [searchMeta, setSearchMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const presetQueries = [
    'SSH distributed brute force on gateway',
    'Ransomware canary file encryption and shadow copy deletion',
    'Stealth DNS exfiltration of sensitive database records',
    'Kubernetes pod escape and container root compromise',
    'SQL injection credit card schema dump',
    'Tor exit node ingress with MFA push fatigue',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/incidents/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 4 }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        setSearchMeta(data);
      } else {
        alert(data.error || 'Vector search failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner: Vector Database Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                PostgreSQL + pgvector Extension
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                384-Dimensional Dense Embeddings
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Semantic Incident & Playbook Similarity Search
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Retrieves past incident investigations and recommended playbooks by computing cosine distance (<code className="text-cyan-400 font-mono">&lt;=&gt;</code>) 
              over dense vector embeddings indexed with an HNSW graph in PostgreSQL.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1 font-mono shrink-0">
            <div><span className="text-slate-500">Column Type:</span> <span className="text-cyan-400">vector(384)</span></div>
            <div><span className="text-slate-500">Index Type:</span> <span className="text-emerald-400">HNSW (Cosine Ops)</span></div>
            <div><span className="text-slate-500">Operator:</span> <span className="text-amber-400">&lt;=&gt; (Cosine Distance)</span></div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="h-5 w-5 text-cyan-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter free-text security incident description or attack symptoms..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Embedding & Searching...' : 'Execute Vector Search'}</span>
          </button>
        </form>

        {/* Quick Preset Queries */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-500 font-medium mr-1">Sample Queries:</span>
          {presetQueries.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(preset);
                handleSearch(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-cyan-400 transition text-[11px]"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Search Latency & Metric Banner */}
      {searchMeta && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Found <span className="text-white font-bold">{searchMeta.resultsCount}</span> semantically correlated incidents</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Dimensions: <span className="text-cyan-400">{searchMeta.vectorDimensions}</span></span>
            <span>Query Execution: <span className="text-amber-400 font-bold">{searchMeta.searchLatencyMs} ms</span></span>
          </div>
        </div>
      )}

      {/* Vector Results Cards */}
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((item, index) => {
            const similarityPercent = (parseFloat(item.similarity_score) * 100).toFixed(1);
            const isHighMatch = parseFloat(item.similarity_score) >= 0.70;

            return (
              <div
                key={item.incident_id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-xs text-cyan-400">
                      #{index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 mr-2">{item.incident_code}</span>
                      <span className="text-sm font-bold text-white">{item.title}</span>
                    </div>
                  </div>

                  {/* Similarity Badge */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right font-mono">
                      <div className="text-xs text-slate-400">Distance: <span className="text-slate-300">{item.cosine_distance}</span></div>
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                      isHighMatch ? 'bg-cyan-950 text-cyan-300 border-cyan-800 glow-blue' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {similarityPercent}% Match
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
                  {item.description}
                </p>

                {/* Historical Resolution Playbook */}
                {item.resolution_notes ? (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/60 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Recommended Historical Playbook:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans">
                      {item.resolution_notes}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500 font-sans">
                    Incident currently under active triage; no closed resolution playbook recorded yet.
                  </div>
                )}
              </div>
            );
          })
        ) : (
          !loading && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-xs">
              Click "Execute Vector Search" or select a sample query above to test the pgvector cosine distance engine.
            </div>
          )
        )}
      </div>

      {/* Technical Architecture: Vector Retrieval Reference */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold">
          <Info className="h-4 w-4" />
          <span>Technical Architecture: pgvector Embeddings & Vector Similarity Retrieval</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] pt-1">
          <div>
            <span className="text-white font-semibold block mb-0.5">1. What data is converted into embeddings?</span>
            Incident titles, narrative descriptions, and analyst investigation notes are embedded into continuous feature representations.
          </div>
          <div>
            <span className="text-white font-semibold block mb-0.5">2. Which embedding approach/model is used?</span>
            384-dimensional dense semantic vectors with subword N-gram hashing and Euclidean L2-normalization for zero-overhead offline inference.
          </div>
          <div>
            <span className="text-white font-semibold block mb-0.5">3. How are vectors stored in the database?</span>
            Stored in PostgreSQL 17 using the native <code className="text-cyan-400">vector(384)</code> data type provided by the <code className="text-cyan-400">pgvector</code> extension.
          </div>
          <div>
            <span className="text-white font-semibold block mb-0.5">4. Similarity metric & Retrieval Strategy?</span>
            Indexed via Hierarchical Navigable Small World (HNSW) graph using Cosine Distance (<code className="text-cyan-400">&lt;=&gt;</code>), enabling sub-millisecond approximate nearest neighbor retrieval.
          </div>
        </div>
      </div>

    </div>
  );
}
