# CYBERPULSE: Security Event Intelligence & Incident Correlation Database System
**DBMS Experiential Learning – Level 3 Project**  
**Department of Computer Science & Engineering, PES University**

### Team Members
- **Dharshini V** — `PES1UG24AM428`
- **Dhruv Rajagopalan** — `PES1UG24AM086`

---

## 1. Project Overview & Problem Statement
Modern enterprises and Cloud infrastructure environments generate millions of heterogeneous security telemetry records daily (e.g., authentication logs, network flow packets, endpoint system calls, malware indicators). Without rigorous relational schemas, referential constraints, database indexing, and automated correlation mechanisms, connecting related attack vectors across multiple hosts and users becomes computationally slow and prone to human error.

**CYBERPULSE** is a multi-paradigm database system built on **PostgreSQL 17 (RDBMS Core + pgvector)** and **MongoDB 9.0 (NoSQL Document Store)**, fronted by a modern **Next.js** SOC dashboard. It addresses the challenge of security event triage by pushing intelligence directly into the database engine through **ACID multi-table transactions**, **autonomous threat containment triggers**, **PL/pgSQL stored procedures**, and **HNSW-indexed 384-dimensional dense semantic similarity search**.

---

## 2. Key Checkpoint Highlights (Evaluation Rubric Compliance)

| Checkpoint | Requirement | Implementation in CYBERPULSE |
|---|---|---|
| **Checkpoint 1** | Min 5 tables in ER Diagram | **8 Normalized Relational Tables** (`departments`, `users`, `hosts`, `attack_tactics`, `security_events`, `incidents`, `incident_event_mapping`, `remediation_audit`) with strict PKs, FKs, and Check Constraints. |
| **Checkpoint 2** | Use RDBMS + NoSQL (+ Vector) | **PostgreSQL 17** (Relational & ACID core) + **pgvector** (Dense semantic vectors) + **MongoDB 9.0** (Polymorphic raw packet & telemetry store linked via `raw_log_id`). |
| **Checkpoint 3** | Analytical Reports in Demo (e.g. Avg salary of every department) | **Report 1: Department Security Posture & Budget Exposure** (`vw_department_security_posture` grouping by department with `AVG(risk_score)`, `MAX(risk_score)`, and incident counts). |
| **Checkpoint 4** | Project Novelty (Non-LLM) | **1.** In-Engine Autonomous Threat Quarantine Trigger (`trg_security_event_risk`).<br>**2.** Stored Procedure Cursor SLA Auto-Escalation (`sp_auto_escalate_incidents`).<br>**3.** Cross-Store Foreign Key correlation (`raw_log_id`).<br>**4.** Live Interactive SQL & `EXPLAIN ANALYZE` Performance Console. |

---

## 3. Polyglot Architecture & Technology Justification

```
+-----------------------------------------------------------------------------------------+
|                                    CYBERPULSE WEB APPLICATION                           |
|                         Next.js 14 (App Router) + Tailwind CSS + Lucide                 |
|             Roles: Administrator (Full Access) | Security Analyst | Auditor             |
+-----------------------------------------------------------------------------------------+
                                           |
                                [API Layer / REST Endpoints]
                                           |
       +-----------------------------------+-----------------------------------+
       |                                                                       |
       v                                                                       v
+-------------------------------------+               +-------------------------------------+
|      PostgreSQL 17 (RDBMS Core)     |               |      MongoDB 9.0 (NoSQL Store)      |
|  - 8 Normalized Relational Tables   |               |  - Collection: raw_security_telemetry|
|  - Strict PK, FK, & CHECK Rules     |               |    (PCAP hex, headers, syscalls)    |
|  - ACID Multi-Statement Transactions|               |  - Collection: threat_intel_feed    |
|  - PL/pgSQL Triggers & Procedures   |   raw_log_id  |    (IOCs, Threat Actors, CVEs)      |
|  - Relational Aggregations & Views  |<=============>|  - Multi-stage Aggregation Pipeline  |
|                                     |  (Polyglot    |    ($group -> $project -> $sort)    |
|   +------------------------------+  |   Cross-Ref)  +-------------------------------------+
|   |  pgvector Extension (Vector) |  |
|   |  - 384-dim dense embeddings  |  |
|   |  - HNSW Index (Cosine Ops)   |  |
|   |  - <=> Cosine Distance Search|  |
|   +------------------------------+  |
+-------------------------------------+
```

### Why RDBMS (PostgreSQL)?
Structured entities (assets, IP addresses, organizational departments, SOC analysts, and verified incidents) have clear entity relationships requiring strict referential integrity (`ON DELETE CASCADE`, `ON DELETE SET NULL`), ACID transactional atomicity, and relational algebra joins (`INNER JOIN`, `GROUP BY`, `HAVING`).

### Why NoSQL (MongoDB)?
Network flow packets, PCAP payloads, arbitrary HTTP headers, and operating system syscall traces vary greatly in schema and velocity depending on the telemetry agent. Enforcing a relational schema on heterogeneous raw network dumps causes sparse tables or frequent schema alterations. MongoDB provides native JSON document storage indexed by `raw_log_id`.

### Why Vector Database (pgvector)?
Incident narratives, symptoms, and investigation notes are text-heavy. Traditional keyword search fails when an analyst searches "credential brute force" but the past incident is logged as "repeated SSH password spray". Dense 384-dimensional embeddings project semantic meaning into high-dimensional space, allowing sub-millisecond approximate nearest-neighbor retrieval using cosine distance (`<=>`) backed by an HNSW graph index.

---

## 4. Entity-Relationship (ER) Schema Data Dictionary

### Table 1: `departments`
- `dept_id`: `SERIAL PRIMARY KEY`
- `dept_name`: `VARCHAR(100) UNIQUE NOT NULL`
- `budget_allocated`: `NUMERIC(14,2) NOT NULL DEFAULT 50000.00 CHECK (budget_allocated >= 0)`
- `contact_email`: `VARCHAR(120) NOT NULL`
- `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

### Table 2: `users`
- `user_id`: `SERIAL PRIMARY KEY`
- `username`: `VARCHAR(50) UNIQUE NOT NULL`
- `full_name`: `VARCHAR(100) NOT NULL`
- `email`: `VARCHAR(120) UNIQUE NOT NULL`
- `role`: `VARCHAR(30) CHECK (role IN ('Administrator', 'Security_Analyst', 'SOC_Manager', 'Auditor'))`
- `dept_id`: `INT REFERENCES departments(dept_id) ON DELETE SET NULL`
- `failed_logins`: `INT DEFAULT 0 CHECK (failed_logins >= 0)`
- `is_active`: `BOOLEAN DEFAULT TRUE`

### Table 3: `hosts`
- `host_id`: `SERIAL PRIMARY KEY`
- `hostname`: `VARCHAR(100) UNIQUE NOT NULL`
- `ip_address`: `INET UNIQUE NOT NULL`
- `os_type`: `VARCHAR(50) NOT NULL`
- `environment`: `VARCHAR(30) CHECK (environment IN ('Production', 'Staging', 'Development', 'DMZ', 'Internal_Core'))`
- `risk_score`: `NUMERIC(5,2) DEFAULT 0.00 CHECK (risk_score BETWEEN 0.00 AND 100.00)`
- `is_isolated`: `BOOLEAN DEFAULT FALSE`
- `dept_id`: `INT REFERENCES departments(dept_id) ON DELETE SET NULL`

### Table 4: `attack_tactics`
- `tactic_id`: `SERIAL PRIMARY KEY`
- `mitre_id`: `VARCHAR(20) UNIQUE NOT NULL` (e.g. TA0001, TA0006)
- `name`: `VARCHAR(100) NOT NULL`
- `kill_chain_phase`: `VARCHAR(50) NOT NULL`
- `base_severity`: `VARCHAR(20) CHECK (base_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))`
- `description`: `TEXT NOT NULL`

### Table 5: `security_events`
- `event_id`: `SERIAL PRIMARY KEY`
- `host_id`: `INT NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE`
- `user_id`: `INT REFERENCES users(user_id) ON DELETE SET NULL`
- `tactic_id`: `INT REFERENCES attack_tactics(tactic_id) ON DELETE RESTRICT`
- `event_type`: `VARCHAR(100) NOT NULL`
- `source_ip`: `INET NOT NULL`
- `dest_ip`: `INET NOT NULL`
- `severity`: `VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))`
- `event_status`: `VARCHAR(30) DEFAULT 'UNRESOLVED' CHECK (event_status IN ('UNRESOLVED', 'ANALYZING', 'CORRELATED', 'RESOLVED', 'FALSE_POSITIVE'))`
- `raw_log_id`: `VARCHAR(64)` *(Foreign Key Reference to MongoDB document)*
- `event_timestamp`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

### Table 6: `incidents`
- `incident_id`: `SERIAL PRIMARY KEY`
- `incident_code`: `VARCHAR(30) UNIQUE NOT NULL`
- `title`: `VARCHAR(200) NOT NULL`
- `description`: `TEXT NOT NULL`
- `priority`: `VARCHAR(20) CHECK (priority IN ('P1-CRITICAL', 'P2-HIGH', 'P3-MEDIUM', 'P4-LOW'))`
- `status`: `VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'))`
- `assigned_analyst_id`: `INT REFERENCES users(user_id) ON DELETE SET NULL`
- `embedding`: `vector(384)` *(Dense semantic vector)*
- `resolution_notes`: `TEXT` *(Enforced by trigger before closing)*
- `created_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
- `resolved_at`: `TIMESTAMP WITH TIME ZONE`

### Table 7: `incident_event_mapping` (M:N Associative Entity)
- `mapping_id`: `SERIAL PRIMARY KEY`
- `incident_id`: `INT NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE`
- `event_id`: `INT NOT NULL REFERENCES security_events(event_id) ON DELETE CASCADE`
- `correlation_confidence`: `NUMERIC(4,2) DEFAULT 0.85 CHECK (correlation_confidence BETWEEN 0.0 AND 1.0)`
- `mapped_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
- `CONSTRAINT uq_incident_event UNIQUE (incident_id, event_id)`

### Table 8: `remediation_audit`
- `audit_id`: `SERIAL PRIMARY KEY`
- `incident_id`: `INT NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE`
- `performed_by`: `INT REFERENCES users(user_id) ON DELETE SET NULL`
- `action_type`: `VARCHAR(100) NOT NULL`
- `execution_status`: `VARCHAR(30) CHECK (execution_status IN ('SUCCESS', 'PENDING', 'FAILED'))`
- `remarks`: `TEXT`
- `executed_at`: `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

---

## 5. Advanced DBMS Concepts Implemented

### 1. ACID Multi-Table Transactions
Implemented in `/api/incidents` and `sp_triage_incident_transaction`.
When an incident is created:
1. `BEGIN` transaction.
2. Insert row into `incidents` with vector embedding.
3. Link related `security_events` in `incident_event_mapping`.
4. Update `security_events.event_status = 'CORRELATED'`.
5. If `P1-CRITICAL`, atomically update `hosts.is_isolated = TRUE` and write to `remediation_audit`.
6. `COMMIT` transaction (or `ROLLBACK` on any constraint failure).

### 2. Autonomous Threat Response Trigger (`trg_security_event_risk`)
An `AFTER INSERT OR UPDATE` trigger on `security_events` that dynamically recalculates host threat level:
```sql
CREATE OR REPLACE FUNCTION trg_fn_security_event_risk_calc()
RETURNS TRIGGER AS $$
DECLARE
    v_new_risk NUMERIC;
BEGIN
    v_new_risk := fn_calculate_host_risk(NEW.host_id);
    IF v_new_risk >= 75.00 THEN
        UPDATE hosts SET risk_score = v_new_risk, is_isolated = TRUE, last_seen = CURRENT_TIMESTAMP WHERE host_id = NEW.host_id;
    ELSE
        UPDATE hosts SET risk_score = v_new_risk, last_seen = CURRENT_TIMESTAMP WHERE host_id = NEW.host_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Incident Resolution Integrity Trigger (`trg_validate_incident_closure`)
A `BEFORE UPDATE` trigger on `incidents` ensuring analysts cannot mark an incident as `RESOLVED` or `CLOSED` without detailed forensic notes:
```sql
CREATE OR REPLACE FUNCTION trg_fn_validate_incident_closure()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('RESOLVED', 'CLOSED') THEN
        IF NEW.resolution_notes IS NULL OR LENGTH(TRIM(NEW.resolution_notes)) < 15 THEN
            RAISE EXCEPTION 'Data Integrity Constraint Violation: Incident % cannot be marked % without adequate resolution notes (minimum 15 characters required).', 
                NEW.incident_code, NEW.status;
        END IF;
        IF NEW.resolved_at IS NULL THEN
            NEW.resolved_at := CURRENT_TIMESTAMP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Stored Procedure with Cursor Loop (`sp_auto_escalate_incidents`)
Scans for open high-priority incidents exceeding the SLA window and escalates them atomically:
```sql
CREATE OR REPLACE PROCEDURE sp_auto_escalate_incidents(
    IN p_sla_hours INT,
    INOUT p_escalated_count INT DEFAULT 0
)
LANGUAGE plpgsql AS $$
DECLARE
    r_incident RECORD;
BEGIN
    p_escalated_count := 0;
    FOR r_incident IN 
        SELECT incident_id, incident_code, priority, created_at FROM incidents
        WHERE status = 'OPEN' AND priority IN ('P1-CRITICAL', 'P2-HIGH')
          AND created_at < (CURRENT_TIMESTAMP - (p_sla_hours || ' hours')::INTERVAL)
    LOOP
        UPDATE incidents SET status = 'ESCALATED' WHERE incident_id = r_incident.incident_id;
        INSERT INTO remediation_audit (incident_id, action_type, execution_status, remarks)
        VALUES (r_incident.incident_id, 'AUTO_SLA_ESCALATION', 'SUCCESS', 'Incident escalated automatically by SLA monitor.');
        p_escalated_count := p_escalated_count + 1;
    END LOOP;
END;
$$;
```

### 5. Advanced Performance Indexing & HNSW Vector Index
```sql
-- Composite B-Tree index for event time-series analysis
CREATE INDEX idx_security_events_host_time ON security_events (host_id, event_timestamp DESC);

-- HNSW Vector Index for approximate nearest neighbor cosine search
CREATE INDEX idx_incidents_embedding_hnsw ON incidents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 6. MongoDB NoSQL Aggregation Pipeline
```javascript
db.raw_security_telemetry.aggregate([
  {
    $group: {
      _id: "$protocol",
      totalEvents: { $sum: 1 },
      avgPayloadLength: { $avg: "$headers.content-length" },
      uniqueSensors: { $addToSet: "$sensor_id" },
      samplePayloadSnippet: { $first: "$payload_hex" }
    }
  },
  {
    $project: {
      protocol: "$_id",
      totalEvents: 1,
      avgPayloadLength: { $round: ["$avgPayloadLength", 2] },
      sensorCount: { $size: "$uniqueSensors" },
      samplePayloadSnippet: 1
    }
  },
  { $sort: { totalEvents: -1 } }
]);
```

---

## 6. Important Analytical SQL Queries (Demonstrated in Project)

### Query 1: Department Security Posture (Parallel to "Average salary of every department")
```sql
SELECT 
    d.dept_name,
    d.budget_allocated,
    COUNT(DISTINCT u.user_id) AS total_users,
    COUNT(DISTINCT h.host_id) AS total_hosts,
    ROUND(AVG(COALESCE(h.risk_score, 0)), 2) AS avg_host_risk_score,
    MAX(COALESCE(h.risk_score, 0)) AS max_host_risk_score,
    COUNT(se.event_id) AS total_security_events,
    COUNT(CASE WHEN se.severity IN ('HIGH', 'CRITICAL') THEN 1 END) AS critical_high_events,
    COUNT(DISTINCT inc.incident_id) AS active_incidents
FROM departments d
LEFT JOIN users u ON d.dept_id = u.dept_id
LEFT JOIN hosts h ON d.dept_id = h.dept_id
LEFT JOIN security_events se ON h.host_id = se.host_id
LEFT JOIN incident_event_mapping iem ON se.event_id = iem.event_id
LEFT JOIN incidents inc ON iem.incident_id = inc.incident_id AND inc.status NOT IN ('RESOLVED', 'CLOSED')
GROUP BY d.dept_id, d.dept_name, d.budget_allocated
ORDER BY d.budget_allocated DESC;
```

### Query 2: Correlated Subquery & HAVING Clause
```sql
SELECT 
    h.hostname,
    h.ip_address,
    h.environment,
    h.risk_score,
    ROUND((SELECT AVG(h2.risk_score) FROM hosts h2 WHERE h2.environment = h.environment), 2) AS env_avg_risk,
    COUNT(se.event_id) AS critical_event_count
FROM hosts h
JOIN security_events se ON h.host_id = se.host_id
WHERE se.severity IN ('HIGH', 'CRITICAL') AND se.event_status != 'RESOLVED'
GROUP BY h.host_id, h.hostname, h.ip_address, h.environment, h.risk_score, h.is_isolated
HAVING COUNT(se.event_id) >= 1
ORDER BY h.risk_score DESC;
```

### Query 3: Vector Cosine Distance Nearest-Neighbor Query
```sql
SELECT 
    incident_code,
    title,
    priority,
    ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS similarity_score,
    ROUND((embedding <=> $1::vector)::numeric, 4) AS cosine_distance
FROM incidents
ORDER BY embedding <=> $1::vector ASC
LIMIT 5;
```

---

## 7. How to Run & Verify Locally

### Prerequisites
1. **Docker Desktop** running (PostgreSQL & MongoDB containers)
2. **Node.js** v18+ (tested on v24.18.0) and **npm**

### Step 1: Start Database Containers
```bash
# PostgreSQL 17 with pgvector
docker run -d --name pgvector-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres pgvector/pgvector:pg17

# MongoDB 9.0
docker run -d --name mongodb-db -p 27017:27017 mongo:latest
```

### Step 2: Initialize Database Schema & Seed Data
```bash
# 1. Create database and apply DDL schema
docker exec pgvector-db psql -U postgres -c "CREATE DATABASE security_event_db;"
Get-Content database/schema.sql -Raw | docker exec -i pgvector-db psql -U postgres -d security_event_db

# 2. Seed both PostgreSQL and MongoDB simultaneously
node scripts/seed.js
```

### Step 3: Run the Next.js Web Application
```bash
npm install
npm run build
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 8. Viva Voce Quick Defense Reference

- **Q: Which normal forms does your schema satisfy?**  
  **A:** All relational tables satisfy **3rd Normal Form (3NF)** and **BCNF**. Every non-key attribute is fully functionally dependent on the primary key, and there are no transitive dependencies. M:N relationships between incidents and events are properly decoupled into an associative entity (`incident_event_mapping`).

- **Q: How does your project demonstrate novelty beyond standard CRUD?**  
  **A:** Most student projects implement simple web forms that directly write to a database. CYBERPULSE incorporates:
  1. An **in-engine autonomous security response trigger** that calculates host threat propagation and isolates machines (`is_isolated = TRUE`) directly at the database level.
  2. A **stored procedure with transactional cursor loops** for SLA breach auto-escalations.
  3. A **polyglot architecture** cross-referencing PostgreSQL structured events with MongoDB raw hex payloads.
  4. An **HNSW-indexed vector space** performing cosine nearest-neighbor search to automatically recommend remediation playbooks for zero-day incident reports.

- **Q: What role does pgvector play?**  
  **A:** It extends PostgreSQL to support the `vector(384)` data type. It computes cosine distance `<=>` directly inside SQL queries (`ORDER BY embedding <=> $1::vector ASC LIMIT 5`), eliminating the need for a separate external vector database server.
