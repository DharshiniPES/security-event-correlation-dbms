import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set up figure
fig, ax = plt.subplots(figsize=(18, 11), dpi=200)
fig.patch.set_facecolor('#090D16')
ax.set_facecolor('#090D16')

# Title
ax.text(9, 10.5, "CYBERPULSE: Relational Entity-Relationship (ER) Architecture", 
        fontsize=22, fontweight='bold', color='#38BDF8', ha='center', va='center', fontfamily='sans-serif')
ax.text(9, 10.0, "8 Normalized Relational Tables (3NF/BCNF) | PostgreSQL 17 + pgvector + MongoDB Polyglot Core", 
        fontsize=13, color='#94A3B8', ha='center', va='center', fontfamily='sans-serif')

# Define tables and their schema boxes
tables = [
    {
        "name": "DEPARTMENTS",
        "x": 0.8, "y": 6.2, "w": 3.6, "h": 3.2,
        "color": "#1E293B", "border": "#38BDF8",
        "attrs": [
            ("PK", "dept_id", "SERIAL PRIMARY KEY"),
            ("UK", "dept_name", "VARCHAR(100) UNIQUE"),
            ("  ", "budget_allocated", "NUMERIC(14,2)"),
            ("  ", "contact_email", "VARCHAR(120)"),
            ("  ", "created_at", "TIMESTAMP WITH TZ"),
        ]
    },
    {
        "name": "USERS",
        "x": 5.2, "y": 6.0, "w": 3.7, "h": 3.4,
        "color": "#1E293B", "border": "#38BDF8",
        "attrs": [
            ("PK", "user_id", "SERIAL PRIMARY KEY"),
            ("UK", "username", "VARCHAR(50) UNIQUE"),
            ("  ", "full_name", "VARCHAR(100)"),
            ("  ", "email", "VARCHAR(120) UNIQUE"),
            ("  ", "role", "VARCHAR(30) [RBAC]"),
            ("FK", "dept_id", "INT -> departments"),
            ("  ", "failed_logins", "INT CHECK >= 0"),
        ]
    },
    {
        "name": "HOSTS",
        "x": 9.7, "y": 6.0, "w": 3.7, "h": 3.4,
        "color": "#1E293B", "border": "#F59E0B",
        "attrs": [
            ("PK", "host_id", "SERIAL PRIMARY KEY"),
            ("UK", "hostname", "VARCHAR(100) UNIQUE"),
            ("UK", "ip_address", "INET UNIQUE"),
            ("  ", "environment", "VARCHAR(30) [DMZ/Prod]"),
            ("  ", "risk_score", "NUMERIC(5,2) [Trigger]"),
            ("  ", "is_isolated", "BOOLEAN [Auto-Quarantine]"),
            ("FK", "dept_id", "INT -> departments"),
        ]
    },
    {
        "name": "ATTACK_TACTICS",
        "x": 14.2, "y": 6.2, "w": 3.4, "h": 3.2,
        "color": "#1E293B", "border": "#F43F5E",
        "attrs": [
            ("PK", "tactic_id", "SERIAL PRIMARY KEY"),
            ("UK", "mitre_id", "VARCHAR(20) [TA0001]"),
            ("  ", "name", "VARCHAR(100)"),
            ("  ", "kill_chain_phase", "VARCHAR(50)"),
            ("  ", "base_severity", "VARCHAR(20) [CRIT/HIGH]"),
            ("  ", "description", "TEXT"),
        ]
    },
    {
        "name": "REMEDIATION_AUDIT",
        "x": 0.8, "y": 1.2, "w": 3.6, "h": 3.4,
        "color": "#1E293B", "border": "#10B981",
        "attrs": [
            ("PK", "audit_id", "SERIAL PRIMARY KEY"),
            ("FK", "incident_id", "INT -> incidents"),
            ("FK", "performed_by", "INT -> users"),
            ("  ", "action_type", "VARCHAR(100)"),
            ("  ", "execution_status", "VARCHAR(30)"),
            ("  ", "remarks", "TEXT"),
            ("  ", "executed_at", "TIMESTAMP WITH TZ"),
        ]
    },
    {
        "name": "INCIDENTS",
        "x": 5.2, "y": 0.9, "w": 3.7, "h": 4.0,
        "color": "#1E293B", "border": "#06B6D4",
        "attrs": [
            ("PK", "incident_id", "SERIAL PRIMARY KEY"),
            ("UK", "incident_code", "VARCHAR(30) UNIQUE"),
            ("  ", "title", "VARCHAR(200)"),
            ("  ", "priority", "VARCHAR(20) [P1 to P4]"),
            ("  ", "status", "VARCHAR(30) [OPEN/RESOLVED]"),
            ("FK", "assigned_analyst_id", "INT -> users"),
            ("VEC", "embedding", "vector(384) [pgvector]"),
            ("TRG", "resolution_notes", "TEXT [>=15 chars]"),
        ]
    },
    {
        "name": "INCIDENT_EVENT_MAPPING",
        "x": 9.7, "y": 1.5, "w": 3.7, "h": 2.8,
        "color": "#1E293B", "border": "#A855F7",
        "attrs": [
            ("PK", "mapping_id", "SERIAL PRIMARY KEY"),
            ("FK", "incident_id", "INT -> incidents"),
            ("FK", "event_id", "INT -> security_events"),
            ("  ", "correlation_confidence", "NUMERIC(4,2)"),
            ("UK", "UNIQUE", "(incident_id, event_id)"),
            ("REL", "M:N Resolving Bridge", "Cardinality Bridge"),
        ]
    },
    {
        "name": "SECURITY_EVENTS",
        "x": 14.2, "y": 0.8, "w": 3.6, "h": 4.1,
        "color": "#1E293B", "border": "#F43F5E",
        "attrs": [
            ("PK", "event_id", "SERIAL PRIMARY KEY"),
            ("FK", "host_id", "INT -> hosts"),
            ("FK", "user_id", "INT -> users"),
            ("FK", "tactic_id", "INT -> attack_tactics"),
            ("  ", "event_type", "VARCHAR(100)"),
            ("  ", "source_ip", "INET"),
            ("  ", "dest_ip", "INET"),
            ("  ", "severity", "VARCHAR(20) [CRITICAL]"),
            ("NOSQL", "raw_log_id", "VARCHAR(64) -> MongoDB"),
        ]
    }
]

# Draw Tables
for t in tables:
    rect = patches.FancyBboxPatch((t["x"], t["y"]), t["w"], t["h"],
                                  boxstyle="round,pad=0.08,rounding_size=0.15",
                                  facecolor=t["color"], edgecolor=t["border"], linewidth=2.0)
    ax.add_patch(rect)
    
    header_rect = patches.FancyBboxPatch((t["x"], t["y"] + t["h"] - 0.65), t["w"], 0.65,
                                         boxstyle="round,pad=0.04,rounding_size=0.1",
                                         facecolor=t["border"], edgecolor="none", alpha=0.25)
    ax.add_patch(header_rect)
    
    ax.text(t["x"] + t["w"]/2, t["y"] + t["h"] - 0.35, t["name"],
            fontsize=11, fontweight='bold', color='#FFFFFF', ha='center', va='center', fontfamily='monospace')
    
    curr_y = t["y"] + t["h"] - 0.95
    for tag, name, dtype in t["attrs"]:
        tag_color = '#F59E0B' if tag == 'PK' else ('#38BDF8' if tag == 'FK' else ('#10B981' if tag in ['VEC', 'NOSQL'] else ('#F43F5E' if tag in ['UK', 'TRG'] else '#64748B')))
        ax.text(t["x"] + 0.15, curr_y, tag, fontsize=8, fontweight='bold', color=tag_color, fontfamily='monospace', va='center')
        ax.text(t["x"] + 0.75, curr_y, name, fontsize=8.5, fontweight='bold', color='#F1F5F9', fontfamily='sans-serif', va='center')
        ax.text(t["x"] + t["w"] - 0.12, curr_y, dtype, fontsize=7.2, color='#94A3B8', fontfamily='monospace', va='center', ha='right')
        curr_y -= 0.38

def draw_arrow(x1, y1, x2, y2, label, color="#38BDF8", connectionstyle="arc3,rad=0.0"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=1.8, connectionstyle=connectionstyle))
    mid_x = (x1 + x2) / 2
    mid_y = (y1 + y2) / 2
    ax.text(mid_x, mid_y + 0.12, label, fontsize=7.5, fontweight='bold', color=color, ha='center',
            bbox=dict(boxstyle="round,pad=0.15", fc="#0B132B", ec=color, lw=0.8, alpha=0.9))

# Draw key relationships
draw_arrow(4.4, 7.8, 5.2, 7.8, "1:N", "#38BDF8")
draw_arrow(2.6, 6.2, 9.7, 7.6, "1:N (owns)", "#38BDF8", connectionstyle="arc3,rad=-0.15")
draw_arrow(7.0, 6.0, 7.0, 4.9, "1:N (assigned)", "#38BDF8")
draw_arrow(11.5, 6.0, 15.0, 4.9, "1:N (generates)", "#F59E0B", connectionstyle="arc3,rad=0.1")
draw_arrow(15.8, 6.2, 15.8, 4.9, "1:N (classifies)", "#F43F5E")
draw_arrow(8.9, 2.9, 9.7, 2.9, "1:N", "#A855F7")
draw_arrow(14.2, 2.9, 13.4, 2.9, "1:N", "#A855F7")
draw_arrow(5.2, 2.6, 4.4, 2.6, "1:N (logs)", "#10B981")

ax.set_xlim(0, 18.5)
ax.set_ylim(0, 11)
ax.axis('off')

plt.tight_layout()
output_path = r"C:\Users\Dharshini\.gemini\antigravity\scratch\security-event-dbms\er_diagram.png"
plt.savefig(output_path, dpi=200, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
print(f"ER Diagram generated at: {output_path}")
