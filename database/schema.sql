-- ============================================================================
-- SECURITY EVENT INTELLIGENCE & INCIDENT CORRELATION DATABASE SYSTEM
-- Course: DBMS Experiential Learning (Level 3 Project)
-- Institution: PES University
-- Authors: Dharshini V (PES1UG24AM428), Dhruv Rajagopalan (PES1UG24AM086)
-- Target DBMS: PostgreSQL 17 + pgvector extension
-- ============================================================================

-- 1. Enable Vector Extension for Semantic Similarity Search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Cleanup Old Relational Schema Objects (Safe Idempotent Execution)
DROP VIEW IF EXISTS vw_analyst_workload CASCADE;
DROP VIEW IF EXISTS vw_mitre_attack_surface CASCADE;
DROP VIEW IF EXISTS vw_host_risk_analysis CASCADE;
DROP VIEW IF EXISTS vw_department_security_posture CASCADE;

DROP TABLE IF EXISTS remediation_audit CASCADE;
DROP TABLE IF EXISTS incident_event_mapping CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS security_events CASCADE;
DROP TABLE IF EXISTS attack_tactics CASCADE;
DROP TABLE IF EXISTS hosts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ============================================================================
-- 3. RELATIONAL SCHEMA DDL (8 Cohesive Tables with Strong Constraints)
-- ============================================================================

-- Table 1: DEPARTMENTS (Organizational units managing infrastructure assets)
CREATE TABLE departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    budget_allocated NUMERIC(14, 2) NOT NULL DEFAULT 50000.00 CHECK (budget_allocated >= 0),
    contact_email VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: USERS (System users & SOC personnel with Role-Based Access)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Administrator', 'Security_Analyst', 'SOC_Manager', 'Auditor')),
    dept_id INT REFERENCES departments(dept_id) ON DELETE SET NULL,
    failed_logins INT NOT NULL DEFAULT 0 CHECK (failed_logins >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: HOSTS (Monitored servers, endpoints, gateways, and cloud nodes)
CREATE TABLE hosts (
    host_id SERIAL PRIMARY KEY,
    hostname VARCHAR(100) NOT NULL UNIQUE,
    ip_address INET NOT NULL UNIQUE,
    os_type VARCHAR(50) NOT NULL,
    environment VARCHAR(30) NOT NULL CHECK (environment IN ('Production', 'Staging', 'Development', 'DMZ', 'Internal_Core')),
    risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (risk_score >= 0.00 AND risk_score <= 100.00),
    is_isolated BOOLEAN NOT NULL DEFAULT FALSE,
    dept_id INT REFERENCES departments(dept_id) ON DELETE SET NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: ATTACK_TACTICS (MITRE ATT&CK framework catalog)
CREATE TABLE attack_tactics (
    tactic_id SERIAL PRIMARY KEY,
    mitre_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    kill_chain_phase VARCHAR(50) NOT NULL,
    base_severity VARCHAR(20) NOT NULL CHECK (base_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL
);

-- Table 5: SECURITY_EVENTS (High-velocity structured telemetry events)
CREATE TABLE security_events (
    event_id SERIAL PRIMARY KEY,
    host_id INT NOT NULL REFERENCES hosts(host_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    tactic_id INT REFERENCES attack_tactics(tactic_id) ON DELETE RESTRICT,
    event_type VARCHAR(100) NOT NULL,
    source_ip INET NOT NULL,
    dest_ip INET NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    event_status VARCHAR(30) NOT NULL DEFAULT 'UNRESOLVED' CHECK (event_status IN ('UNRESOLVED', 'ANALYZING', 'CORRELATED', 'RESOLVED', 'FALSE_POSITIVE')),
    raw_log_id VARCHAR(64), -- Foreign Reference linking to MongoDB unstructured payload document
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: INCIDENTS (Correlated high-impact security investigations)
CREATE TABLE incidents (
    incident_id SERIAL PRIMARY KEY,
    incident_code VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('P1-CRITICAL', 'P2-HIGH', 'P3-MEDIUM', 'P4-LOW')),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED')),
    assigned_analyst_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    embedding vector(384), -- pgvector 384-dimensional dense semantic embedding
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table 7: INCIDENT_EVENT_MAPPING (M:N associative entity relating events to incidents)
CREATE TABLE incident_event_mapping (
    mapping_id SERIAL PRIMARY KEY,
    incident_id INT NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES security_events(event_id) ON DELETE CASCADE,
    correlation_confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.85 CHECK (correlation_confidence BETWEEN 0.0 AND 1.0),
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_incident_event UNIQUE (incident_id, event_id)
);

-- Table 8: REMEDIATION_AUDIT (Audit ledger of containment & response actions)
CREATE TABLE remediation_audit (
    audit_id SERIAL PRIMARY KEY,
    incident_id INT NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    performed_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    execution_status VARCHAR(30) NOT NULL CHECK (execution_status IN ('SUCCESS', 'PENDING', 'FAILED')),
    remarks TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. PERFORMANCE INDEXING (B-Tree + HNSW Vector Index)
-- ============================================================================
CREATE INDEX idx_security_events_host_time ON security_events (host_id, event_timestamp DESC);
CREATE INDEX idx_security_events_user ON security_events (user_id);
CREATE INDEX idx_security_events_severity ON security_events (severity);
CREATE INDEX idx_incidents_status_priority ON incidents (status, priority);
CREATE INDEX idx_hosts_risk ON hosts (risk_score DESC);

-- Advanced Vector HNSW Index for rapid approximate nearest neighbor cosine search
CREATE INDEX idx_incidents_embedding_hnsw ON incidents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- 5. RELATIONAL VIEWS (Demonstrating complex queries, JOINs & Aggregations)
-- ============================================================================

-- View 1: Department Security Posture & Budget Exposure Report
-- (Fulfills syllabus requirement for departmental summary reports)
CREATE OR REPLACE VIEW vw_department_security_posture AS
SELECT 
    d.dept_id,
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
GROUP BY d.dept_id, d.dept_name, d.budget_allocated;

-- View 2: Comprehensive Host Threat Analysis
CREATE OR REPLACE VIEW vw_host_risk_analysis AS
SELECT 
    h.host_id,
    h.hostname,
    h.ip_address,
    h.environment,
    h.risk_score,
    h.is_isolated,
    d.dept_name,
    COUNT(se.event_id) AS total_events,
    COUNT(CASE WHEN se.severity = 'CRITICAL' THEN 1 END) AS critical_events,
    COUNT(CASE WHEN se.severity = 'HIGH' THEN 1 END) AS high_events,
    MAX(se.event_timestamp) AS latest_event_detected
FROM hosts h
LEFT JOIN departments d ON h.dept_id = d.dept_id
LEFT JOIN security_events se ON h.host_id = se.host_id
GROUP BY h.host_id, h.hostname, h.ip_address, h.environment, h.risk_score, h.is_isolated, d.dept_name;

-- View 3: MITRE ATT&CK Surface Analysis
CREATE OR REPLACE VIEW vw_mitre_attack_surface AS
SELECT 
    t.tactic_id,
    t.mitre_id,
    t.name AS tactic_name,
    t.kill_chain_phase,
    t.base_severity,
    COUNT(se.event_id) AS total_detections,
    COUNT(DISTINCT se.host_id) AS affected_hosts_count,
    COUNT(CASE WHEN se.event_status = 'UNRESOLVED' THEN 1 END) AS pending_alerts
FROM attack_tactics t
LEFT JOIN security_events se ON t.tactic_id = se.tactic_id
GROUP BY t.tactic_id, t.mitre_id, t.name, t.kill_chain_phase, t.base_severity;

-- View 4: SOC Analyst Workload & SLA Performance
CREATE OR REPLACE VIEW vw_analyst_workload AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    COUNT(inc.incident_id) AS assigned_incidents,
    COUNT(CASE WHEN inc.status IN ('OPEN', 'IN_PROGRESS', 'ESCALATED') THEN 1 END) AS active_cases,
    COUNT(CASE WHEN inc.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved_cases,
    ROUND(
        AVG(
            CASE 
                WHEN inc.resolved_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (inc.resolved_at - inc.created_at)) / 3600.0 
                ELSE NULL 
            END
        )::NUMERIC, 2
    ) AS avg_resolution_hours
FROM users u
LEFT JOIN incidents inc ON u.user_id = inc.assigned_analyst_id
WHERE u.role IN ('Security_Analyst', 'SOC_Manager', 'Administrator')
GROUP BY u.user_id, u.username, u.full_name;

-- ============================================================================
-- 6. ADVANCED STORED FUNCTIONS & PROCEDURES
-- ============================================================================

-- Function 1: Deterministic Host Risk Scoring Algorithm
CREATE OR REPLACE FUNCTION fn_calculate_host_risk(p_host_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_critical_count INT;
    v_high_count INT;
    v_medium_count INT;
    v_low_count INT;
    v_calculated_risk NUMERIC;
BEGIN
    SELECT 
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END),
        COUNT(CASE WHEN severity = 'HIGH' THEN 1 END),
        COUNT(CASE WHEN severity = 'MEDIUM' THEN 1 END),
        COUNT(CASE WHEN severity = 'LOW' THEN 1 END)
    INTO v_critical_count, v_high_count, v_medium_count, v_low_count
    FROM security_events
    WHERE host_id = p_host_id AND event_status NOT IN ('RESOLVED', 'FALSE_POSITIVE');

    -- Weighted formula: Base score capped at 100.00
    v_calculated_risk := (v_critical_count * 20.0) + (v_high_count * 10.0) + (v_medium_count * 4.0) + (v_low_count * 1.0);
    
    IF v_calculated_risk > 100.00 THEN
        v_calculated_risk := 100.00;
    END IF;

    RETURN v_calculated_risk;
END;
$$ LANGUAGE plpgsql;

-- Stored Procedure 1: Auto-Escalate Stale Incidents Exceeding SLA
CREATE OR REPLACE PROCEDURE sp_auto_escalate_incidents(
    IN p_sla_hours INT,
    INOUT p_escalated_count INT DEFAULT 0
)
LANGUAGE plpgsql
AS $$
DECLARE
    r_incident RECORD;
BEGIN
    p_escalated_count := 0;
    
    FOR r_incident IN 
        SELECT incident_id, incident_code, priority, created_at
        FROM incidents
        WHERE status = 'OPEN' 
          AND priority IN ('P1-CRITICAL', 'P2-HIGH')
          AND created_at < (CURRENT_TIMESTAMP - (p_sla_hours || ' hours')::INTERVAL)
    LOOP
        -- Transactional atomic update
        UPDATE incidents
        SET status = 'ESCALATED'
        WHERE incident_id = r_incident.incident_id;

        INSERT INTO remediation_audit (incident_id, action_type, execution_status, remarks)
        VALUES (
            r_incident.incident_id, 
            'AUTO_SLA_ESCALATION', 
            'SUCCESS', 
            'Incident escalated automatically: Age exceeded SLA of ' || p_sla_hours || ' hours.'
        );

        p_escalated_count := p_escalated_count + 1;
    END LOOP;
END;
$$;

-- Stored Procedure 2: Atomic Multi-Table Transaction for Incident Triage & Host Isolation
CREATE OR REPLACE PROCEDURE sp_triage_incident_transaction(
    IN p_incident_title VARCHAR,
    INOUT p_incident_desc TEXT,
    IN p_priority VARCHAR,
    IN p_analyst_id INT,
    IN p_host_id INT,
    IN p_event_ids INT[],
    OUT p_created_incident_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_code VARCHAR(30);
    v_event_id INT;
BEGIN
    -- Generate unique incident identifier
    v_code := 'INC-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

    -- Step 1: Insert into Incidents
    INSERT INTO incidents (incident_code, title, description, priority, status, assigned_analyst_id)
    VALUES (v_code, p_incident_title, p_incident_desc, p_priority, 'OPEN', p_analyst_id)
    RETURNING incident_id INTO p_created_incident_id;

    -- Step 2: Associate all selected events
    IF p_event_ids IS NOT NULL THEN
        FOREACH v_event_id IN ARRAY p_event_ids
        LOOP
            INSERT INTO incident_event_mapping (incident_id, event_id, correlation_confidence)
            VALUES (p_created_incident_id, v_event_id, 0.95)
            ON CONFLICT (incident_id, event_id) DO NOTHING;

            UPDATE security_events
            SET event_status = 'CORRELATED'
            WHERE event_id = v_event_id;
        END LOOP;
    END IF;

    -- Step 3: If P1-CRITICAL, immediately isolate compromised host
    IF p_priority = 'P1-CRITICAL' AND p_host_id IS NOT NULL THEN
        UPDATE hosts SET is_isolated = TRUE WHERE host_id = p_host_id;

        INSERT INTO remediation_audit (incident_id, performed_by, action_type, execution_status, remarks)
        VALUES (
            p_created_incident_id,
            p_analyst_id,
            'HOST_NETWORK_CONTAINMENT',
            'SUCCESS',
            'Host ' || p_host_id || ' automatically quarantined upon Critical Incident declaration.'
        );
    END IF;
END;
$$;

-- ============================================================================
-- 7. DATABASE TRIGGERS
-- ============================================================================

-- Trigger Function 1: Autonomous Threat Response & Host Risk Update
CREATE OR REPLACE FUNCTION trg_fn_security_event_risk_calc()
RETURNS TRIGGER AS $$
DECLARE
    v_new_risk NUMERIC;
BEGIN
    -- Calculate new risk score for the host
    v_new_risk := fn_calculate_host_risk(NEW.host_id);

    -- Autonomous Threat Response: If score reaches >= 75.00, automatically isolate host
    IF v_new_risk >= 75.00 THEN
        UPDATE hosts 
        SET risk_score = v_new_risk,
            is_isolated = TRUE,
            last_seen = CURRENT_TIMESTAMP
        WHERE host_id = NEW.host_id;
    ELSE
        UPDATE hosts 
        SET risk_score = v_new_risk,
            last_seen = CURRENT_TIMESTAMP
        WHERE host_id = NEW.host_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_security_event_risk
AFTER INSERT OR UPDATE OF severity, event_status ON security_events
FOR EACH ROW
EXECUTE FUNCTION trg_fn_security_event_risk_calc();

-- Trigger Function 2: Incident Resolution Integrity Enforcement
CREATE OR REPLACE FUNCTION trg_fn_validate_incident_closure()
RETURNS TRIGGER AS $$
BEGIN
    -- Guard condition: Ensure incident cannot be closed without thorough documentation
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

CREATE TRIGGER trg_validate_incident_closure
BEFORE UPDATE OF status, resolution_notes ON incidents
FOR EACH ROW
EXECUTE FUNCTION trg_fn_validate_incident_closure();
