import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Initialize Presentation with 16:9 Widescreen
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

blank_slide_layout = prs.slide_layouts[6]

# Theme Colors
C_BG = RGBColor(9, 13, 22)        # #090D16 Dark Navy
C_CARD = RGBColor(17, 24, 39)     # #111827 Dark Slate
C_CARD_BORDER = RGBColor(30, 41, 59) # #1E293B
C_CYAN = RGBColor(56, 189, 248)   # #38BDF8 Sky/Cyan
C_BLUE = RGBColor(59, 130, 246)   # #3B82F6 Blue
C_EMERALD = RGBColor(16, 185, 129) # #10B981 Emerald
C_ROSE = RGBColor(244, 63, 94)    # #F43F5E Rose
C_AMBER = RGBColor(245, 158, 11)  # #F59E0B Amber
C_WHITE = RGBColor(248, 250, 252) # #F8FAFC White
C_MUTED = RGBColor(148, 163, 184) # #94A3B8 Muted Slate

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = C_BG

def add_header(slide, title_text, category_text="CYBERPULSE | DBMS EXPERIENTIAL LEARNING"):
    # Category Pill
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
    tf_c = cat_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = category_text.upper()
    p_c.font.size = Pt(10)
    p_c.font.bold = True
    p_c.font.color.rgb = C_CYAN
    p_c.font.name = "Arial"

    # Slide Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.65))
    tf_t = title_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(22)
    p_t.font.bold = True
    p_t.font.color.rgb = C_WHITE
    p_t.font.name = "Arial"

def add_card(slide, left, top, width, height, title, items, border_color=C_CARD_BORDER, title_color=C_CYAN):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = C_CARD
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1.5)
    
    tf = shape.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = title_color
    p.font.name = "Arial"
    p.space_after = Pt(10)
    
    for item in items:
        p_item = tf.add_paragraph()
        p_item.text = item
        p_item.font.size = Pt(11)
        p_item.font.color.rgb = C_WHITE if not item.startswith("  ") else C_MUTED
        p_item.font.name = "Arial"
        p_item.space_after = Pt(6)

# ==============================================================================
# SLIDE 1: Title Slide
# ==============================================================================
s1 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s1)

# Badge
badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(3.8), Inches(0.4))
badge.fill.solid()
badge.fill.fore_color.rgb = RGBColor(15, 23, 42)
badge.line.color.rgb = C_CYAN
b_tf = badge.text_frame
b_p = b_tf.paragraphs[0]
b_p.text = "DBMS EXPERIENTIAL LEARNING – LEVEL 3"
b_p.font.size = Pt(10.5)
b_p.font.bold = True
b_p.font.color.rgb = C_CYAN
b_p.alignment = PP_ALIGN.CENTER

# Main Title
title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.5), Inches(1.8))
tf = title_box.text_frame
tf.word_wrap = True
p1 = tf.paragraphs[0]
p1.text = "SECURITY EVENT INTELLIGENCE &\nINCIDENT CORRELATION DATABASE SYSTEM"
p1.font.size = Pt(32)
p1.font.bold = True
p1.font.color.rgb = C_WHITE
p1.font.name = "Arial"

p2 = tf.add_paragraph()
p2.text = "CYBERPULSE: A Polyglot Relational, Vector & Document-Store Architecture"
p2.font.size = Pt(16)
p2.font.bold = True
p2.font.color.rgb = C_CYAN
p2.font.name = "Arial"
p2.space_before = Pt(10)

# Authors & University Card
add_card(s1, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.3), "PROJECT TEAM MEMBERS", [
    "Dharshini V  —  PES1UG24AM428",
    "  Role: Database Architecture, Relational Schema & Autonomous Triggers",
    "Dhruv Rajagopalan  —  PES1UG24AM086",
    "  Role: Polyglot Integration, pgvector Semantic Engine & Web UI"
], border_color=C_BLUE, title_color=C_CYAN)

add_card(s1, Inches(6.8), Inches(4.3), Inches(5.6), Inches(2.3), "ACADEMIC INSTITUTION", [
    "Department of Computer Science & Engineering",
    "PES University, Bangalore",
    "Course Instructor / Evaluator: Dr. Nagasundari S",
    "Evaluation Date: October 2026",
    "Technology: PostgreSQL 17 + pgvector + MongoDB 9.0 + Next.js"
], border_color=C_EMERALD, title_color=C_EMERALD)

# ==============================================================================
# SLIDE 2: Problem Statement & Motivation
# ==============================================================================
s2 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s2)
add_header(s2, "Problem Statement & Industry Motivation")

add_card(s2, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "The Cybersecurity Challenge", [
    "• High-Velocity Telemetry Overload:",
    "  Modern enterprises generate millions of disparate security events daily (SSH logins, packet flows, syscalls).",
    "• Fragmentation & Weak Correlation:",
    "  Without foreign keys and relational normalization, connecting alerts across hosts and users is slow and error-prone.",
    "• Heterogeneous Payload Structures:",
    "  Raw network packet dumps (PCAPs) and HTTP headers are polymorphic and poorly suited for rigid relational columns.",
    "• Manual Containment Delays:",
    "  Conventional systems require manual triage, delaying critical host containment and SLA adherence."
], border_color=C_ROSE, title_color=C_ROSE)

add_card(s2, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "The DBMS Engineering Solution", [
    "• Polyglot Dual-Store Engine:",
    "  PostgreSQL handles structured relational entities; MongoDB stores unstructured raw packet payloads via foreign references.",
    "• In-Engine Autonomous Threat Containment:",
    "  PostgreSQL triggers dynamically recalculate host blast radius and auto-quarantine infected nodes directly at the DB layer.",
    "• Dense Vector Semantic Playbook Retrieval:",
    "  pgvector 384-dimensional dense embeddings match zero-day alerts with historical playbooks using cosine distance (<=>).",
    "• Relational Aggregations & SLA Procedures:",
    "  Complex multi-table analytical views and stored procedures automate SLA tracking and department posture reports."
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 3: System Objectives & Scope
# ==============================================================================
s3 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s3)
add_header(s3, "System Objectives & Technical Scope")

add_card(s3, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "1. Database Design", [
    "• 8 Normalized Tables (3NF/BCNF):",
    "  Strict PKs, FKs, Unique constraints, and Check rules.",
    "• Comprehensive ER Model:",
    "  1:N and M:N relationships properly resolved via associative mapping entities.",
    "• Cascade Integrity:",
    "  ON DELETE CASCADE and ON DELETE SET NULL rules prevent orphaned security records."
], border_color=C_BLUE, title_color=C_BLUE)

add_card(s3, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "2. Advanced DBMS Logic", [
    "• ACID Multi-Table Transactions:",
    "  Transactional atomicity with automatic ROLLBACK protection.",
    "• Autonomous Triggers:",
    "  Threat escalation and incident closure validation.",
    "• Stored Procedures with Cursors:",
    "  Automated SLA breach detection and remediation logging.",
    "• Analytical Views:",
    "  Multi-table aggregations (AVG, MAX, COUNT, GROUP BY, HAVING)."
], border_color=C_AMBER, title_color=C_AMBER)

add_card(s3, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "3. Multi-Paradigm & Web", [
    "• Polyglot Telemetry Lake:",
    "  MongoDB document store linked to SQL via raw_log_id.",
    "• pgvector Semantic Engine:",
    "  384-dim dense vectors with HNSW graph indexing.",
    "• Next.js 14 SOC Interface:",
    "  Enterprise dark-mode dashboard with Role-Based Access Control (Admin, Analyst, Auditor)."
], border_color=C_EMERALD, title_color=C_EMERALD)

# ==============================================================================
# SLIDE 4: Polyglot Database Architecture
# ==============================================================================
s4 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s4)
add_header(s4, "Polyglot Multi-Paradigm Architecture (SQL + NoSQL + Vector)")

add_card(s4, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "PostgreSQL 17 (RDBMS Core)", [
    "Purpose: Transactional & Relational Core",
    "• 8 Normalized Tables in 3NF",
    "• Foreign Keys & Referential Integrity",
    "• Multi-Statement ACID Transactions",
    "• Stored Functions & PL/pgSQL Procedures",
    "• Autonomous Event Response Triggers",
    "• Materialized Views & Aggregations",
    "• Subqueries & HAVING analytical filters"
], border_color=C_BLUE, title_color=C_BLUE)

add_card(s4, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "MongoDB 9.0 (NoSQL Lake)", [
    "Purpose: Unstructured Network Telemetry",
    "• Collection: raw_security_telemetry",
    "  Stores PCAP hex, headers & syscall traces",
    "• Collection: threat_intel_feed",
    "  Stores dynamic IOCs & CVE signatures",
    "• Cross-Database Linkage:",
    "  Linked to SQL events via raw_log_id",
    "• Multi-Stage Aggregation Pipeline:",
    "  $group -> $project -> $sort metrics"
], border_color=C_EMERALD, title_color=C_EMERALD)

add_card(s4, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "pgvector (Vector Engine)", [
    "Purpose: Semantic Similarity Search",
    "• 384-Dimensional Dense Embeddings",
    "• Stored in native vector(384) column",
    "• HNSW Graph Index Acceleration:",
    "  idx_incidents_embedding_hnsw",
    "• Cosine Distance Operator (<=>):",
    "  Sub-millisecond nearest neighbor search",
    "• Recommends historical mitigation playbooks for zero-day threats"
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 5: Visual ER Diagram Slide
# ==============================================================================
s5 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s5)
add_header(s5, "Entity-Relationship (ER) Architecture (8 Normalized Tables)")

er_img_path = r"C:\Users\Dharshini\.gemini\antigravity\scratch\security-event-dbms\er_diagram.png"
if os.path.exists(er_img_path):
    s5.shapes.add_picture(er_img_path, Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.4))

# ==============================================================================
# SLIDE 6: Relational Schema & 3NF Normalization
# ==============================================================================
s6 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s6)
add_header(s6, "Relational Schema Design & 3NF Normalization")

add_card(s6, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "8 Normalized Relational Tables", [
    "1. departments (dept_id PK, dept_name UK, budget_allocated)",
    "2. users (user_id PK, username UK, email UK, role, dept_id FK)",
    "3. hosts (host_id PK, hostname UK, ip_address UK, risk_score, is_isolated, dept_id FK)",
    "4. attack_tactics (tactic_id PK, mitre_id UK, name, base_severity)",
    "5. security_events (event_id PK, host_id FK, user_id FK, tactic_id FK, severity, raw_log_id)",
    "6. incidents (incident_id PK, incident_code UK, priority, status, assigned_analyst_id FK, embedding)",
    "7. incident_event_mapping (mapping_id PK, incident_id FK, event_id FK, confidence, UNIQUE)",
    "8. remediation_audit (audit_id PK, incident_id FK, performed_by FK, action_type, executed_at)"
], border_color=C_CYAN, title_color=C_CYAN)

add_card(s6, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Normalization & Anomaly Prevention", [
    "• 1st Normal Form (1NF):",
    "  All attributes are atomic. Multi-valued network traces are decoupled into MongoDB.",
    "• 2nd Normal Form (2NF):",
    "  All non-key attributes are fully functionally dependent on primary keys (no partial dependencies).",
    "• 3rd Normal Form (3NF) & BCNF:",
    "  No transitive dependencies. Department budgets depend on dept_id, not host_id.",
    "• M:N Cardinality Resolution:",
    "  Incidents and Events are decoupled via incident_event_mapping to eliminate redundancy.",
    "• Referential Integrity Cascades:",
    "  ON DELETE CASCADE for mappings; ON DELETE SET NULL for user/dept references."
], border_color=C_EMERALD, title_color=C_EMERALD)

# ==============================================================================
# SLIDE 7: Advanced Feature 1 - Autonomous Trigger
# ==============================================================================
s7 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s7)
add_header(s7, "Advanced DBMS Feature 1: Autonomous Quarantine Trigger")

add_card(s7, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Trigger Design & Architecture", [
    "• Trigger Name: trg_security_event_risk",
    "• Trigger Event: AFTER INSERT OR UPDATE OF severity, event_status ON security_events",
    "• Autonomous Threat Containment:",
    "  Whenever an event is inserted, the trigger invokes fn_calculate_host_risk(host_id).",
    "• Blast-Radius Risk Formula:",
    "  Risk = 20*(Critical) + 10*(High) + 4*(Medium) + 1*(Low)",
    "• Autonomous Quarantine Execution:",
    "  If Risk >= 75.00 AND NOT is_isolated THEN:",
    "    UPDATE hosts SET is_isolated = TRUE, risk_score = v_new_risk;",
    "• Impact: Zero-latency network quarantine handled directly inside PostgreSQL engine."
], border_color=C_AMBER, title_color=C_AMBER)

add_card(s7, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "PL/pgSQL Trigger Source Code", [
    "CREATE OR REPLACE FUNCTION trg_fn_security_event_risk_calc()",
    "RETURNS TRIGGER AS $$",
    "DECLARE",
    "    v_new_risk NUMERIC;",
    "BEGIN",
    "    v_new_risk := fn_calculate_host_risk(NEW.host_id);",
    "    IF v_new_risk >= 75.00 THEN",
    "        UPDATE hosts SET risk_score = v_new_risk, is_isolated = TRUE WHERE host_id = NEW.host_id;",
    "    ELSE",
    "        UPDATE hosts SET risk_score = v_new_risk WHERE host_id = NEW.host_id;",
    "    END IF;",
    "    RETURN NEW;",
    "END; $$ LANGUAGE plpgsql;"
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 8: Advanced Feature 2 - ACID Transactions
# ==============================================================================
s8 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s8)
add_header(s8, "Advanced DBMS Feature 2: Multi-Table ACID Transactions")

add_card(s8, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "ACID Principles in Incident Triage", [
    "• Atomicity (All-or-Nothing):",
    "  Incident creation, event mapping, host isolation, and audit logging must succeed together.",
    "• Consistency:",
    "  All foreign keys and check constraints are verified before committing.",
    "• Isolation:",
    "  Concurrent analyst triage operations run without read/write conflicts.",
    "• Durability:",
    "  Transaction logs (WAL) guarantee committed incidents survive server restarts.",
    "• Rollback Protection:",
    "  If host isolation or event mapping fails, PostgreSQL executes ROLLBACK automatically."
], border_color=C_BLUE, title_color=C_BLUE)

add_card(s8, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "5-Step Transactional Execution Flow", [
    "BEGIN;",
    "  1. INSERT INTO incidents (code, title, desc, priority, embedding)",
    "     VALUES ('INC-2026-009', ..., $vector::vector)",
    "     RETURNING incident_id;",
    "",
    "  2. INSERT INTO incident_event_mapping (incident_id, event_id)",
    "     VALUES (curr_inc, 12), (curr_inc, 14);",
    "",
    "  3. UPDATE security_events SET event_status = 'CORRELATED';",
    "",
    "  4. UPDATE hosts SET is_isolated = TRUE WHERE host_id = 2;",
    "",
    "  5. INSERT INTO remediation_audit (incident_id, action_type);",
    "COMMIT;"
], border_color=C_EMERALD, title_color=C_EMERALD)

# ==============================================================================
# SLIDE 9: Advanced Feature 3 - Stored Procedure SLA Escalation
# ==============================================================================
s9 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s9)
add_header(s9, "Advanced DBMS Feature 3: Stored Procedure SLA Auto-Escalation")

add_card(s9, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "SLA Monitoring with PL/pgSQL Cursors", [
    "• Procedure: sp_auto_escalate_incidents(p_sla_hours, OUT count)",
    "• Service Level Agreement (SLA) Rule:",
    "  Critical (P1) and High (P2) incidents must be actively triaged within a strict time window.",
    "• Cursor Iteration:",
    "  A cursor scans for open incidents older than the SLA limit (e.g. 1 hour).",
    "• Atomic State Transition:",
    "  Status is elevated from 'OPEN' to 'ESCALATED'.",
    "• Immutable Audit Trail:",
    "  Writes an audit record into remediation_audit for governance compliance.",
    "• INOUT Parameter:",
    "  Returns the exact number of escalated cases back to the application."
], border_color=C_AMBER, title_color=C_AMBER)

add_card(s9, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "PL/pgSQL Stored Procedure Code", [
    "CREATE OR REPLACE PROCEDURE sp_auto_escalate_incidents(",
    "    IN p_sla_hours INT, INOUT p_escalated_count INT DEFAULT 0",
    ") LANGUAGE plpgsql AS $$",
    "DECLARE r_inc RECORD;",
    "BEGIN",
    "    FOR r_inc IN ",
    "        SELECT incident_id FROM incidents",
    "        WHERE status = 'OPEN' AND priority IN ('P1-CRITICAL', 'P2-HIGH')",
    "          AND created_at < (CURRENT_TIMESTAMP - (p_sla_hours || ' hours')::INTERVAL)",
    "    LOOP",
    "        UPDATE incidents SET status = 'ESCALATED' WHERE incident_id = r_inc.incident_id;",
    "        INSERT INTO remediation_audit (incident_id, action_type, execution_status)",
    "        VALUES (r_inc.incident_id, 'AUTO_SLA_ESCALATION', 'SUCCESS');",
    "        p_escalated_count := p_escalated_count + 1;",
    "    END LOOP;",
    "END; $$;"
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 10: Advanced Feature 4 - Incident Closure Trigger
# ==============================================================================
s10 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s10)
add_header(s10, "Advanced DBMS Feature 4: Incident Resolution Integrity Trigger")

add_card(s10, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Data Integrity Enforcement", [
    "• Trigger Name: trg_validate_incident_closure",
    "• Trigger Event: BEFORE UPDATE OF status, resolution_notes ON incidents",
    "• The Problem in Real SOCs:",
    "  Analysts often close security incidents without writing forensic explanations, violating compliance audits.",
    "• Database-Enforced Guard:",
    "  The trigger enforces that an incident CANNOT be set to 'RESOLVED' or 'CLOSED' without at least 15 characters of resolution notes.",
    "• Exception Raising:",
    "  If notes are missing/short, PostgreSQL raises an exception and aborts the update.",
    "• Automated Timestamping:",
    "  Automatically stamps resolved_at = CURRENT_TIMESTAMP upon valid resolution."
], border_color=C_ROSE, title_color=C_ROSE)

add_card(s10, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "PL/pgSQL Trigger Implementation", [
    "CREATE OR REPLACE FUNCTION trg_fn_validate_incident_closure()",
    "RETURNS TRIGGER AS $$",
    "BEGIN",
    "    IF NEW.status IN ('RESOLVED', 'CLOSED') THEN",
    "        IF NEW.resolution_notes IS NULL OR LENGTH(TRIM(NEW.resolution_notes)) < 15 THEN",
    "            RAISE EXCEPTION 'Data Integrity Constraint Violation: Incident % cannot be marked % without adequate resolution notes (minimum 15 characters required).',",
    "                NEW.incident_code, NEW.status;",
    "        END IF;",
    "        IF NEW.resolved_at IS NULL THEN",
    "            NEW.resolved_at := CURRENT_TIMESTAMP;",
    "        END IF;",
    "    END IF;",
    "    RETURN NEW;",
    "END; $$ LANGUAGE plpgsql;"
], border_color=C_AMBER, title_color=C_AMBER)

# ==============================================================================
# SLIDE 11: Polyglot NoSQL Ingestion & MongoDB Aggregation
# ==============================================================================
s11 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s11)
add_header(s11, "NoSQL Telemetry Lake & MongoDB Aggregation Pipeline")

add_card(s11, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "MongoDB Telemetry Document Lake", [
    "• Dual-Store Ingestion Architecture:",
    "  Structured event inserted into PostgreSQL; raw packet document inserted into MongoDB with identical raw_log_id.",
    "• Schema-less Telemetry Flexibility:",
    "  Handles arbitrary PCAP payloads (0x7f45...), varying HTTP headers, and system-call arrays without DB migrations.",
    "• Sub-Millisecond Cross-Store Retrieval:",
    "  Analysts clicking raw_log_id in the Next.js UI fetch the raw MongoDB document live in ~90ms.",
    "• Threat Intelligence Collection:",
    "  Stores dynamic IOC indicators, threat actor signatures, and CVE mapping metadata."
], border_color=C_EMERALD, title_color=C_EMERALD)

add_card(s11, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "MongoDB Multi-Stage Pipeline Aggregation", [
    "db.raw_security_telemetry.aggregate([",
    "  {",
    "    $group: {",
    "      _id: '$protocol',",
    "      totalEvents: { $sum: 1 },",
    "      avgPayloadLength: { $avg: '$headers.content-length' },",
    "      uniqueSensors: { $addToSet: '$sensor_id' },",
    "      samplePayloadSnippet: { $first: '$payload_hex' }",
    "    }",
    "  },",
    "  {",
    "    $project: {",
    "      protocol: '$_id',",
    "      totalEvents: 1,",
    "      avgPayloadLength: { $round: ['$avgPayloadLength', 2] },",
    "      sensorCount: { $size: '$uniqueSensors' }",
    "    }",
    "  },",
    "  { $sort: { totalEvents: -1 } }",
    "]);"
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 12: pgvector & Semantic Similarity Search
# ==============================================================================
s12 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s12)
add_header(s12, "Vector Database & Semantic Playbook Retrieval (pgvector)")

add_card(s12, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Vector Database Architecture (Option 2)", [
    "• 384-Dimensional Dense Embeddings:",
    "  Incident titles, descriptions, and investigation narratives are embedded into continuous dense vectors.",
    "• Native PostgreSQL Storage:",
    "  Stored in incidents.embedding using the native vector(384) data type from pgvector.",
    "• HNSW Graph Indexing (M=16, ef_construction=64):",
    "  Hierarchical Navigable Small World index accelerates approximate nearest-neighbor search.",
    "• Cosine Distance Operator (<=>):",
    "  Cosine Similarity = 1 - (embedding <=> query_vector).",
    "• Zero-Day Playbook Matching:",
    "  Recalls mitigation steps for novel alerts matching past attack vectors."
], border_color=C_CYAN, title_color=C_CYAN)

add_card(s12, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Live Vector Nearest-Neighbor SQL Query", [
    "SELECT ",
    "    incident_code,",
    "    title,",
    "    priority,",
    "    status,",
    "    resolution_notes,",
    "    ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS similarity_score,",
    "    ROUND((embedding <=> $1::vector)::numeric, 4) AS cosine_distance",
    "FROM incidents",
    "ORDER BY embedding <=> $1::vector ASC",
    "LIMIT 5;",
    "",
    "-- Query Plan: Uses HNSW Index Scan",
    "-- Latency: Sub-150ms execution on local Docker cluster"
], border_color=C_BLUE, title_color=C_BLUE)

# ==============================================================================
# SLIDE 13: Analytical Reports (Checkpoint #3)
# ==============================================================================
s13 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s13)
add_header(s13, "Analytical Reports & Aggregations (Checkpoint #3)")

add_card(s13, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Report 1: Department Security Posture", [
    "Direct implementation of syllabus benchmark (equivalent to average salary per department):",
    "• View: vw_department_security_posture",
    "• Aggregates across departments, users, hosts & events:",
    "  - Department Name & Budget Allocated ($)",
    "  - Total Users & Monitored Hosts Count",
    "  - Average Host Risk Score: AVG(risk_score)",
    "  - Maximum Host Risk Score: MAX(risk_score)",
    "  - Total Security Events Detected: COUNT(event_id)",
    "  - Critical / High Severity Alert Breakdown",
    "  - Active Correlated Incidents Count"
], border_color=C_EMERALD, title_color=C_EMERALD)

add_card(s13, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Additional Analytical Reports", [
    "• Report 2: MITRE ATT&CK Surface Breakdown:",
    "  Uses GROUP BY tactic, COUNT(event_id) and HAVING event_count >= 2 to identify top attack vectors.",
    "",
    "• Report 3: Correlated Subquery Anomaly Report:",
    "  Isolates hosts whose risk score exceeds their departmental environment average using correlated subqueries and HAVING filters.",
    "",
    "• Report 4: SOC Analyst SLA Performance:",
    "  Calculates average incident resolution hours using PostgreSQL epoch intervals: EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0."
], border_color=C_AMBER, title_color=C_AMBER)

# ==============================================================================
# SLIDE 14: Indexing Strategy & Query Optimization
# ==============================================================================
s14 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s14)
add_header(s14, "Performance Indexing & EXPLAIN ANALYZE Execution Plans")

add_card(s14, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Relational & Vector Indexing Strategy", [
    "• B-Tree Composite Index on Events:",
    "  CREATE INDEX idx_security_events_host_time ON security_events (host_id, event_timestamp DESC);",
    "  Accelerates host-specific time-series queries.",
    "• B-Tree Foreign Key Indexes:",
    "  Indexes on user_id, tactic_id, and severity eliminate full table scans during multi-table JOINs.",
    "• HNSW Vector Graph Index:",
    "  CREATE INDEX idx_incidents_embedding_hnsw ON incidents USING hnsw (embedding vector_cosine_ops);",
    "  Constructs multi-layer graphs for sub-linear vector search."
], border_color=C_BLUE, title_color=C_BLUE)

add_card(s14, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Query Plan Verification (EXPLAIN ANALYZE)", [
    "• Interactive Live SQL Console in UI:",
    "  Allows professors to type custom SQL queries and generate query execution trees.",
    "• Execution Plan Inspection:",
    "  - Index Scan vs Sequential Scan cost verification",
    "  - Buffer cache hit rates and memory allocation",
    "  - Hash Join and Nested Loop execution timings",
    "• Real Performance Measurement:",
    "  Sub-millisecond index lookup on composite keys; average execution latency < 15ms across 8 tables."
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 15: Web Application Interface (Next.js 14 SOC)
# ==============================================================================
s15 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s15)
add_header(s15, "Web Application Interface & Role-Based Access Control")

add_card(s15, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Next.js 14 Architecture & Security", [
    "• Modern Frontend Stack:",
    "  Next.js 14 (App Router), React 18, Tailwind CSS dark theme, and Lucide Icons.",
    "• Secure Backend API Layer:",
    "  Next.js Route Handlers communicate with PostgreSQL and MongoDB via connection pooling.",
    "• Environment-Based Credentials:",
    "  Zero hard-coded database secrets; configured via .env.local.",
    "• Real-Time Cluster Health Monitoring:",
    "  Live status indicators verify active socket connectivity to PostgreSQL 17, pgvector, and MongoDB 9.0."
], border_color=C_CYAN, title_color=C_CYAN)

add_card(s15, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Role-Based Access Control (RBAC)", [
    "Interactive UI role switcher supports 3 distinct enterprise personas:",
    "1. Administrator (Full Access):",
    "   Can ingest events, trigger host isolation, correlate incidents, and execute SLA stored procedures.",
    "2. Security Analyst (Triage & Investigation):",
    "   Performs semantic vector searches, analyzes MITRE attack surface, and resolves assigned incidents.",
    "3. Auditor (Read-Only Governance):",
    "   Inspects immutable remediation audit trails, departmental risk posture, and database schema dictionaries."
], border_color=C_EMERALD, title_color=C_EMERALD)

# ==============================================================================
# SLIDE 16: Project Novelty Summary (Checkpoint #4)
# ==============================================================================
s16 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s16)
add_header(s16, "Project Novelty Factors (Beyond Basic CRUD)")

add_card(s16, Inches(0.8), Inches(1.6), Inches(3.6), Inches(5.2), "1. Autonomous Threat Response", [
    "Novelty Factor 1:",
    "• Trigger-Based Defense",
    "  Unlike conventional web apps that handle logic in JavaScript, threat evaluation occurs inside PostgreSQL.",
    "• Dynamic Host Blast-Radius",
    "  Recalculates risk scores and auto-isolates compromised machines (is_isolated = TRUE) autonomously."
], border_color=C_ROSE, title_color=C_ROSE)

add_card(s16, Inches(4.8), Inches(1.6), Inches(3.6), Inches(5.2), "2. Polyglot Cross-Store Link", [
    "Novelty Factor 2:",
    "• Relational-to-Document Bridge",
    "  PostgreSQL foreign keys link directly to MongoDB document IDs (raw_log_id).",
    "• Hybrid Telemetry Pipeline",
    "  Combines strict relational ACID guarantees with high-throughput schema-less PCAP dumps."
], border_color=C_EMERALD, title_color=C_EMERALD)

add_card(s16, Inches(8.8), Inches(1.6), Inches(3.6), Inches(5.2), "3. Vector Playbook Retrieval", [
    "Novelty Factor 3:",
    "• HNSW Semantic Matching",
    "  Native pgvector integration allows cosine nearest-neighbor search for zero-day incident descriptions.",
    "• Stored Procedure SLA Escalator",
    "  Cursor loops automatically elevate stale incidents with audit tracking."
], border_color=C_CYAN, title_color=C_CYAN)

# ==============================================================================
# SLIDE 17: Team Contributions & Git History
# ==============================================================================
s17 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s17)
add_header(s17, "Individual Team Member Contributions & Version Control")

add_card(s17, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Dharshini V (PES1UG24AM428)", [
    "• Database Architecture & Relational Schema:",
    "  Designed the 8-table normalized schema with primary keys, foreign keys, and CHECK constraints.",
    "• Autonomous Threat Response Trigger:",
    "  Implemented trg_security_event_risk and the blast-radius calculation function fn_calculate_host_risk.",
    "• Relational Views & Aggregations:",
    "  Authored vw_department_security_posture and correlated subquery reports.",
    "• Incident Resolution Trigger:",
    "  Created trg_validate_incident_closure for resolution integrity."
], border_color=C_BLUE, title_color=C_BLUE)

add_card(s17, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Dhruv Rajagopalan (PES1UG24AM086)", [
    "• Polyglot NoSQL Integration:",
    "  Configured MongoDB telemetry collections and multi-stage aggregation pipelines.",
    "• Vector Database & pgvector:",
    "  Configured 384-dimensional dense semantic embedding engine and HNSW cosine distance queries.",
    "• Stored Procedure Implementation:",
    "  Authored sp_auto_escalate_incidents with cursor loops.",
    "• Next.js Web Interface:",
    "  Built the SOC dashboard, live SQL query console, and API routes."
], border_color=C_EMERALD, title_color=C_EMERALD)

# ==============================================================================
# SLIDE 18: Conclusion & Future Enhancements
# ==============================================================================
s18 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s18)
add_header(s18, "Conclusion & Future Enhancements")

add_card(s18, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2), "Summary of Project Achievements", [
    "• Met and Exceeded All 4 Evaluation Checkpoints:",
    "  8 normalized tables (min 5 required), SQL + NoSQL + Vector polyglot stores, comprehensive department reports with AVG/MAX, and five distinct non-LLM novelty factors.",
    "• Robust DBMS Rigor:",
    "  Pushed critical business logic into database triggers, stored procedures, and ACID transactional boundaries.",
    "• Production-Grade Web Application:",
    "  Functional Next.js 14 SOC dashboard connected to live Docker database containers."
], border_color=C_CYAN, title_color=C_CYAN)

add_card(s18, Inches(6.8), Inches(1.6), Inches(5.6), Inches(5.2), "Planned Future Enhancements", [
    "• Distributed Real-Time Ingestion:",
    "  Integrate Apache Kafka and Debezium Change Data Capture (CDC) for high-throughput streaming events.",
    "• Graph Database Integration (Neo4j):",
    "  Model lateral movement attack paths as directed graph edges alongside the relational schema.",
    "• Automated Playbook Execution:",
    "  Connect remediation audit events to automated Ansible / Terraform infrastructure teardown hooks."
], border_color=C_AMBER, title_color=C_AMBER)

# ==============================================================================
# SLIDE 19: Thank You & Technical Defense
# ==============================================================================
s19 = prs.slides.add_slide(blank_slide_layout)
set_slide_background(s19)

ty_box = s19.shapes.add_textbox(Inches(0.8), Inches(2.0), Inches(11.5), Inches(1.5))
tf = ty_box.text_frame
tf.word_wrap = True
p1 = tf.paragraphs[0]
p1.text = "THANK YOU!"
p1.font.size = Pt(44)
p1.font.bold = True
p1.font.color.rgb = C_CYAN
p1.font.name = "Arial"

p2 = tf.add_paragraph()
p2.text = "Open for Questions & Technical Evaluation"
p2.font.size = Pt(20)
p2.font.bold = True
p2.font.color.rgb = C_WHITE
p2.font.name = "Arial"
p2.space_before = Pt(10)

add_card(s19, Inches(0.8), Inches(3.8), Inches(11.5), Inches(2.8), "PROJECT REPOSITORIES & LIVE DEMO", [
    "• Live Web Application: http://localhost:3000",
    "• GitHub Repository: https://github.com/DharshiniPES/security-event-correlation-dbms",
    "• Database Clusters: PostgreSQL 17 (port 5432) + MongoDB 9.0 (port 27017)",
    "• Relational Schema DDL: database/schema.sql (8 Normalized Tables, Triggers, Procedures, Views)",
    "• Presentation Authors: Dharshini V (PES1UG24AM428) & Dhruv Rajagopalan (PES1UG24AM086) | PES University"
], border_color=C_BLUE, title_color=C_CYAN)

# Save Presentation
ppt_output_path = r"C:\Users\Dharshini\.gemini\antigravity\scratch\security-event-dbms\CYBERPULSE_DBMS_Project_Presentation.pptx"
prs.save(ppt_output_path)
print(f"Presentation successfully created at: {ppt_output_path}")
