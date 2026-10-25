// Comprehensive Polyglot Seeder (PostgreSQL + MongoDB + pgvector)
// Authors: Dharshini V (PES1UG24AM428) & Dhruv Rajagopalan (PES1UG24AM086)

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

// Deterministic 384-dim embedding generator
const DIMENSIONS = 384;
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function generateEmbedding(text) {
  const vector = new Array(DIMENSIONS).fill(0);
  if (!text || text.trim().length === 0) return vector;

  const cleanText = text.toLowerCase().replace(/[^a-z0-9\-_\s]/g, ' ');
  const tokens = cleanText.split(/\s+/).filter(t => t.length > 1);

  tokens.forEach((token, idx) => {
    const wordHash = hashString(token);
    const bucket = wordHash % DIMENSIONS;
    const sign = (wordHash & 1) === 0 ? 1 : -1;
    vector[bucket] += sign * (1.0 + 1.0 / (idx + 1));

    if (token.length >= 3) {
      for (let i = 0; i <= token.length - 3; i++) {
        const tri = token.substring(i, i + 3);
        const triHash = hashString(tri);
        const triBucket = triHash % DIMENSIONS;
        const triSign = (triHash & 1) === 0 ? 1 : -1;
        vector[triBucket] += triSign * 0.45;
      }
    }
  });

  let sumSquares = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    sumSquares += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSquares);
  if (magnitude > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] = Number((vector[i] / magnitude).toFixed(6));
    }
  }
  return `[${vector.join(',')}]`;
}

async function runSeed() {
  console.log('--- Starting CyberPulse Database Ingestion ---');
  
  const pgPool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'security_event_db',
  });

  const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/security_event_nosql');
  await mongoClient.connect();
  const mongoDb = mongoClient.db(process.env.MONGODB_DB || 'security_event_nosql');
  console.log('Connected to PostgreSQL and MongoDB successfully.');

  const pgClient = await pgPool.connect();

  try {
    await pgClient.query('BEGIN');

    // 1. Seed Departments
    console.log('Seeding Departments...');
    const depts = [
      ['Security Operations Center (SOC)', 650000.00, 'soc-lead@pes.edu'],
      ['Engineering & Cloud Infrastructure', 480000.00, 'cloud-ops@pes.edu'],
      ['Finance & Core Treasury', 350000.00, 'finance-it@pes.edu'],
      ['Enterprise Identity & Directory Services', 290000.00, 'iam-admin@pes.edu'],
    ];
    for (const d of depts) {
      await pgClient.query(
        `INSERT INTO departments (dept_name, budget_allocated, contact_email) 
         VALUES ($1, $2, $3) ON CONFLICT (dept_name) DO NOTHING`,
        d
      );
    }

    // 2. Seed Users
    console.log('Seeding Users & SOC Analysts...');
    const users = [
      ['dharshini_v', 'Dharshini V (PES1UG24AM428)', 'dharshini.v@pes.edu', 'Administrator', 1, 0, true],
      ['dhruv_r', 'Dhruv Rajagopalan (PES1UG24AM086)', 'dhruv.r@pes.edu', 'Security_Analyst', 1, 0, true],
      ['alex_rivera', 'Alex Rivera', 'alex.rivera@cyberpulse.io', 'SOC_Manager', 1, 0, true],
      ['sarah_chen', 'Sarah Chen', 'sarah.chen@cyberpulse.io', 'Security_Analyst', 2, 1, true],
      ['marcus_vance', 'Marcus Vance', 'marcus.vance@cyberpulse.io', 'Auditor', 3, 0, true],
      ['elena_rostova', 'Elena Rostova', 'elena.rostova@cyberpulse.io', 'Security_Analyst', 4, 3, true],
    ];
    for (const u of users) {
      await pgClient.query(
        `INSERT INTO users (username, full_name, email, role, dept_id, failed_logins, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (username) DO NOTHING`,
        u
      );
    }

    // 3. Seed Hosts
    console.log('Seeding Monitored Hosts...');
    const hosts = [
      ['prod-auth-gateway-01', '10.0.1.15', 'Ubuntu Linux 22.04 LTS', 'DMZ', 1],
      ['prod-payment-db-master', '10.0.2.50', 'Debian GNU/Linux 12', 'Production', 3],
      ['core-k8s-worker-03', '10.0.3.112', 'Red Hat Enterprise Linux 9', 'Internal_Core', 2],
      ['corp-hr-portal-srv', '10.0.4.25', 'Windows Server 2022', 'Internal_Core', 3],
      ['staging-api-gateway', '172.16.1.10', 'Ubuntu Linux 24.04 LTS', 'Staging', 2],
      ['edge-vpn-concentrator', '10.0.1.2', 'Cisco IOS-XE 17.9', 'DMZ', 1],
      ['dev-sandbox-runner', '172.16.2.80', 'Alpine Linux v3.19', 'Development', 2],
      ['prod-analytics-cluster', '10.0.2.90', 'Rocky Linux 9.3', 'Production', 3],
    ];
    for (const h of hosts) {
      await pgClient.query(
        `INSERT INTO hosts (hostname, ip_address, os_type, environment, dept_id)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (hostname) DO NOTHING`,
        h
      );
    }

    // 4. Seed Attack Tactics (MITRE ATT&CK)
    console.log('Seeding MITRE ATT&CK Tactics...');
    const tactics = [
      ['TA0001', 'Initial Access', 'Initial Compromise', 'CRITICAL', 'Techniques that use various entry vectors to gain an initial foothold.'],
      ['TA0002', 'Execution', 'Command & Scripting', 'HIGH', 'Techniques that result in adversary-controlled code running on a local or remote system.'],
      ['TA0003', 'Persistence', 'Access Maintenance', 'HIGH', 'Techniques adversaries use to keep access across restarts and credential changes.'],
      ['TA0004', 'Privilege Escalation', 'Permission Elevation', 'CRITICAL', 'Techniques adversaries use to gain higher-level permissions on a system.'],
      ['TA0005', 'Defense Evasion', 'Stealth & Obfuscation', 'HIGH', 'Techniques used to avoid detection throughout their compromise.'],
      ['TA0006', 'Credential Access', 'Credential Theft', 'CRITICAL', 'Techniques for stealing credentials like passwords, tokens, and hashes.'],
      ['TA0008', 'Lateral Movement', 'Internal Pivoting', 'HIGH', 'Techniques adversaries use to enter and control remote systems on a network.'],
      ['TA0010', 'Exfiltration', 'Data Leakage', 'CRITICAL', 'Techniques used to steal and transport data from network boundaries.'],
    ];
    for (const t of tactics) {
      await pgClient.query(
        `INSERT INTO attack_tactics (mitre_id, name, kill_chain_phase, base_severity, description)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (mitre_id) DO NOTHING`,
        t
      );
    }

    // 5. Seed NoSQL (MongoDB) Raw Telemetry Payloads
    console.log('Seeding MongoDB Raw Telemetry Collection...');
    const rawTelemetryCol = mongoDb.collection('raw_security_telemetry');
    await rawTelemetryCol.deleteMany({});

    const rawDocs = [];
    for (let i = 1; i <= 30; i++) {
      const rawId = `RAW-2026-LOG-${String(i).padStart(3, '0')}`;
      rawDocs.push({
        raw_log_id: rawId,
        sensor_id: `sensor-netflow-${(i % 4) + 1}`,
        protocol: i % 3 === 0 ? 'SSH' : i % 3 === 1 ? 'HTTPS' : 'DNS',
        payload_hex: `0x7f454c4602010100000000000000000002003e0001000000${i.toString(16).padStart(4, '0')}`,
        headers: {
          'user-agent': i % 2 === 0 ? 'Mozilla/5.0 (Kali Linux x86_64) Nmap NSE' : 'curl/7.88.1-DEV',
          'x-forwarded-for': `198.51.100.${(i * 7) % 250 + 1}`,
          'content-length': 120 + i * 45,
        },
        system_call_trace: [
          { syscall: 'execve', binary: '/bin/sh', pid: 1040 + i, timestamp: new Date(Date.now() - i * 3600000).toISOString() },
          { syscall: 'ptrace', binary: '/usr/bin/python3', target_pid: 1, return_code: -1 },
        ],
        unstructured_tags: [
          i % 2 === 0 ? 'signature_match' : 'anomaly_threshold',
          i % 4 === 0 ? 'tor_exit_node' : 'external_scan',
          'ai_enriched',
        ],
        ingested_at: new Date(Date.now() - i * 1800000),
      });
    }
    await rawTelemetryCol.insertMany(rawDocs);

    // Seed NoSQL Threat Intel Feed
    const threatIntelCol = mongoDb.collection('threat_intel_feed');
    await threatIntelCol.deleteMany({});
    await threatIntelCol.insertMany([
      { ioc_type: 'IP_ADDRESS', ioc_value: '198.51.100.42', threat_actor: 'APT29 (Cozy Bear)', risk_score: 95, tags: ['C2_SERVER', 'BEACON'] },
      { ioc_type: 'IP_ADDRESS', ioc_value: '203.0.113.88', threat_actor: 'FIN7 Syndicate', risk_score: 88, tags: ['BRUTE_FORCE', 'SCANNER'] },
      { ioc_type: 'FILE_HASH_SHA256', ioc_value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', threat_actor: 'Lazarus Group', risk_score: 99, tags: ['RANSOMWARE_PAYLOAD'] },
      { ioc_type: 'DOMAIN', ioc_value: 'update-synck8s-service.net', threat_actor: 'Volt Typhoon', risk_score: 92, tags: ['DNS_EXFIL', 'FAST_FLUX'] },
    ]);

    // 6. Seed Security Events (PostgreSQL)
    console.log('Seeding Structured Security Events in PostgreSQL...');
    const eventTypes = [
      'SSH Brute-Force Password Spraying',
      'SQL Injection in Authorization Parameter',
      'Kerberoasting SPN Ticket Request',
      'Linux Kernel Privilege Escalation Attempt',
      'Unauthorized /etc/shadow File Read',
      'Massive DNS Tunneling Data Outflow',
      'Auditd Service Termination Signal',
      'Ransomware Canary Modification Detected',
      'Reverse TCP Meterpreter Shell Spawn',
      'Anomalous Tor Exit Node Login',
    ];

    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const statuses = ['UNRESOLVED', 'ANALYZING', 'CORRELATED', 'RESOLVED'];

    for (let i = 1; i <= 30; i++) {
      const hostId = (i % 8) + 1;
      const userId = (i % 6) + 1;
      const tacticId = (i % 8) + 1;
      const eventType = eventTypes[i % eventTypes.length];
      const severity = severities[i % severities.length];
      const status = statuses[i % statuses.length];
      const rawLogId = `RAW-2026-LOG-${String(i).padStart(3, '0')}`;
      const srcIp = `198.51.100.${(i * 13) % 254 + 1}`;
      const destIp = `10.0.${(i % 4) + 1}.${(i * 7) % 254 + 1}`;
      const ts = new Date(Date.now() - (30 - i) * 3600000 * 2);

      await pgClient.query(
        `INSERT INTO security_events (host_id, user_id, tactic_id, event_type, source_ip, dest_ip, severity, event_status, raw_log_id, event_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [hostId, userId, tacticId, eventType, srcIp, destIp, severity, status, rawLogId, ts]
      );
    }

    // 7. Seed Incidents with 384-Dimensional Dense Embeddings
    console.log('Seeding Incidents with pgvector 384-dim semantic embeddings...');
    const incidentsData = [
      {
        code: 'INC-2026-001',
        title: 'Distributed SSH Credential Brute Force & Priv-Escalation on Auth Gateway',
        desc: 'Adversary initiated 4,500 distributed SSH login attempts from multiple external IP addresses against prod-auth-gateway-01, followed by sudo abuse and credential dumping of memory structures.',
        priority: 'P1-CRITICAL',
        status: 'OPEN',
        analystId: 2, // Dhruv
        resNotes: null,
      },
      {
        code: 'INC-2026-002',
        title: 'Suspicious Kerberoasting & Golden Ticket Forgery in Internal Core',
        desc: 'Unusual SPN service ticket requests observed requesting RC4 encryption downgrade on corp-hr-portal-srv. Attack vector matches Kerberoasting offline cracking tactics targeting service accounts.',
        priority: 'P2-HIGH',
        status: 'IN_PROGRESS',
        analystId: 2, // Dhruv
        resNotes: null,
      },
      {
        code: 'INC-2026-003',
        title: 'Ransomware Precursor Canary File Alterations on Payment DB Cluster',
        desc: 'High-volume file rename and rapid entropy increase detected across backup storage volumes on prod-payment-db-master. Shadow copy deletion utility was invoked via malicious cron execution.',
        priority: 'P1-CRITICAL',
        status: 'ESCALATED',
        analystId: 1, // Dharshini
        resNotes: null,
      },
      {
        code: 'INC-2026-004',
        title: 'Stealth DNS Tunneling and Mass Database Exfiltration Beacon',
        desc: 'Continuous high-frequency base64 encoded TXT record queries resolved against rogue nameserver ns1.threat-domain.net, exfiltrating aggregated customer transactional records outside company boundary.',
        priority: 'P2-HIGH',
        status: 'OPEN',
        analystId: 4, // Sarah
        resNotes: null,
      },
      {
        code: 'INC-2026-005',
        title: 'Kubernetes DaemonSet Pod Escape and Host Root Privilege Escalation',
        desc: 'A compromised containerized workload executed nsenter and mounted the host filesystem root with privileged capabilities on core-k8s-worker-03, compromising node runtime integrity.',
        priority: 'P1-CRITICAL',
        status: 'RESOLVED',
        analystId: 1, // Dharshini
        resNotes: 'Remediated container admission controller policy to forbid privileged pods. Host worker isolated, container killed, and service account tokens rotated.',
      },
      {
        code: 'INC-2026-006',
        title: 'SQL Injection Exploitation and Unauthorized Payment Schema Dump',
        desc: 'Blind SQL injection in payment checkout endpoint allowed union-based extraction of credit card verification tables and unauthorized customer account table enumeration.',
        priority: 'P2-HIGH',
        status: 'RESOLVED',
        analystId: 2, // Dhruv
        resNotes: 'Patched ORM parameterized query handling on staging-api-gateway. Database user permissions restricted to read-only views without schema access.',
      },
      {
        code: 'INC-2026-007',
        title: 'Anomalous Tor Exit Node Ingress with Multi-Factor Authentication Bypass',
        desc: 'Concurrent session tokens generated from known Tor relay node within 90 seconds of legitimate employee session in Bangalore. Push notification fatigue technique suspected.',
        priority: 'P3-MEDIUM',
        status: 'CLOSED',
        analystId: 6, // Elena
        resNotes: 'Invalidated active OAuth tokens, enforced FIDO2 WebAuthn hardware token requirement, and blacklisted Tor exit ranges at the WAF edge.',
      },
      {
        code: 'INC-2026-008',
        title: 'Audit Logging Tampering & Bash History Zero-Fill on Production Core',
        desc: 'Disabling of Linux auditd logging subsystem accompanied by SIGKILL to Syslog daemon and shredding of analyst bash command history to conceal defense evasion activity.',
        priority: 'P1-CRITICAL',
        status: 'OPEN',
        analystId: 3, // Alex
        resNotes: null,
      },
    ];

    for (const inc of incidentsData) {
      const vectorStr = generateEmbedding(`${inc.title} ${inc.desc}`);
      await pgClient.query(
        `INSERT INTO incidents (incident_code, title, description, priority, status, assigned_analyst_id, embedding, resolution_notes, resolved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8, $9)
         ON CONFLICT (incident_code) DO NOTHING`,
        [
          inc.code,
          inc.title,
          inc.desc,
          inc.priority,
          inc.status,
          inc.analystId,
          vectorStr,
          inc.resNotes,
          inc.status === 'RESOLVED' || inc.status === 'CLOSED' ? new Date() : null,
        ]
      );
    }

    // 8. Correlate Events to Incidents
    console.log('Seeding Incident-Event Correlated Mappings...');
    const mappings = [
      [1, 1, 0.98],
      [1, 9, 0.94],
      [2, 3, 0.91],
      [3, 2, 0.99],
      [3, 8, 0.96],
      [4, 6, 0.95],
      [5, 4, 0.97],
      [6, 2, 0.93],
      [7, 10, 0.89],
      [8, 7, 0.95],
    ];
    for (const m of mappings) {
      await pgClient.query(
        `INSERT INTO incident_event_mapping (incident_id, event_id, correlation_confidence)
         VALUES ($1, $2, $3) ON CONFLICT (incident_id, event_id) DO NOTHING`,
        m
      );
    }

    // 9. Seed Remediation Audits
    console.log('Seeding Remediation Audit Trail...');
    const audits = [
      [1, 2, 'HOST_NETWORK_ISOLATION', 'SUCCESS', 'Quarantined host prod-auth-gateway-01 via iptables drop rule.'],
      [1, 1, 'CREDENTIAL_REVOCATION', 'SUCCESS', 'Revoked compromised SSH keypair and forced password reset.'],
      [3, 1, 'SNAPSHOT_RECOVERY', 'SUCCESS', 'Restored payment database storage volume from immutable ZFS snapshot.'],
      [5, 1, 'K8S_POD_EVICTION', 'SUCCESS', 'Terminated malicious container namespace and blocked image digest.'],
      [6, 2, 'WAF_RULE_DEPLOYMENT', 'SUCCESS', 'Deployed ModSecurity CRS rule 942100 to block SQLi vectors.'],
    ];
    for (const a of audits) {
      await pgClient.query(
        `INSERT INTO remediation_audit (incident_id, performed_by, action_type, execution_status, remarks)
         VALUES ($1, $2, $3, $4, $5)`,
        a
      );
    }

    await pgClient.query('COMMIT');
    console.log('--- Database Seeding Completed Successfully! ---');
  } catch (err) {
    await pgClient.query('ROLLBACK');
    console.error('Error during database seeding:', err);
    throw err;
  } finally {
    pgClient.release();
    await pgPool.end();
    await mongoClient.close();
  }
}

runSeed().catch(err => {
  console.error('Seed process failed:', err);
  process.exit(1);
});
