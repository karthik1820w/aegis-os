export type ThreatSeverity = "critical" | "high" | "medium" | "low";
export type ThreatStatus = "active" | "blocked" | "investigating" | "mitigated";

export interface Threat {
  id: string;
  type: string;
  severity: ThreatSeverity;
  ip: string;
  target: string;
  status: ThreatStatus;
  time: string;
  coords: [number, number];
  riskScore: number;
  description: string;
  evidence: string[];
  region: string;
}

export interface DefenseLayer {
  layer: number;
  name: string;
  status: "healthy" | "degraded" | "critical";
  score: number;
  alerts: number;
}

export interface LiveEvent {
  id: string;
  type: "threat" | "blocked_attack" | "audit" | "incident" | "anomaly";
  severity: ThreatSeverity | "info";
  title: string;
  ip: string;
}

export interface Incident {
  id: string;
  priority: "P1" | "P2" | "P3" | "P4";
  title: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  assignee: string;
  created: string;
  updated: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  resource: string;
  ip: string;
  result: "success" | "failure" | "warning";
  time: string;
}

export const THREATS: Threat[] = [
  {
    id: "THR-001",
    type: "Ransomware C2 Beacon",
    severity: "critical",
    ip: "185.220.101.47",
    target: "PROD-DB-01",
    status: "active",
    time: "2m ago",
    coords: [80, 100],
    riskScore: 97,
    description: "Detected encrypted C2 communication matching known ransomware patterns. Traffic originates from a Tor exit node and targets the production database server.",
    evidence: [
      "PROTO: TCP/443 — TLS 1.2 encrypted",
      "YARA: Matches rule RansomHub_C2_v4",
      "Payload: 2.4KB repeated 12x in 30s",
      "DNS: beacon.r3dnet.onion resolved",
      "Confidence: 97.4%",
    ],
    region: "RU/TOR",
  },
  {
    id: "THR-002",
    type: "SQL Injection Attempt",
    severity: "high",
    ip: "45.129.56.200",
    target: "API-GW-PROD",
    status: "blocked",
    time: "5m ago",
    coords: [300, 75],
    riskScore: 78,
    description: "Multiple SQL injection payloads detected targeting the /api/users endpoint. WAF rules triggered and IP auto-blocked at perimeter.",
    evidence: [
      "Payload: ' OR '1'='1 -- (classic bypass)",
      "Endpoint: POST /api/users/search",
      "Requests: 847 in 90 seconds",
      "WAF Rule: SQLi_Classic_v2 triggered",
      "IP Reputation: Known malicious",
    ],
    region: "CN",
  },
  {
    id: "THR-003",
    type: "Credential Stuffing",
    severity: "critical",
    ip: "192.241.207.150",
    target: "AUTH-SVC",
    status: "active",
    time: "8m ago",
    coords: [100, 160],
    riskScore: 91,
    description: "Large-scale credential stuffing attack using leaked credentials from recent data breach. 12,000 unique credential pairs attempted in the past hour.",
    evidence: [
      "Attempts: 12,847 / hour",
      "Success rate: 0.8% (103 logins)",
      "Credential list: HaveIBeenPwned match",
      "ASN: AS396982 (Google Cloud — hijacked)",
      "Rotational: 127 unique IPs in /20 subnet",
    ],
    region: "US",
  },
  {
    id: "THR-004",
    type: "DNS Tunneling",
    severity: "high",
    ip: "2.56.109.4",
    target: "INT-DNS-01",
    status: "investigating",
    time: "14m ago",
    coords: [530, 100],
    riskScore: 72,
    description: "Suspicious DNS query pattern matching known tunneling tools (iodine/dnscat2). Large TXT record responses suggest data exfiltration.",
    evidence: [
      "Query volume: 4,200/min (baseline: 120)",
      "TXT record size avg: 512 bytes",
      "Subdomain entropy: 4.8 (tunneling indicator)",
      "Pattern: dnscat2 signature match",
      "Exfil estimate: ~2.1 MB/hour",
    ],
    region: "PL",
  },
  {
    id: "THR-005",
    type: "Lateral Movement",
    severity: "critical",
    ip: "10.0.14.22",
    target: "CORP-DC-01",
    status: "active",
    time: "21m ago",
    coords: [340, 55],
    riskScore: 88,
    description: "Internal host exhibiting lateral movement via SMB and WMI. Credential hash extracted via LSASS dump detected on endpoint.",
    evidence: [
      "SMB auth failures: 340 across 28 hosts",
      "Process: lsass.exe memory dump detected",
      "Tool signature: Mimikatz v2.2.0",
      "New admin account: svc_backup2 created",
      "Connection to CORP-DC-01:445 succeeded",
    ],
    region: "INTERNAL",
  },
  {
    id: "THR-006",
    type: "Zero-Day Exploit",
    severity: "critical",
    ip: "185.176.26.3",
    target: "NGINX-EDGE-02",
    status: "active",
    time: "33m ago",
    coords: [285, 65],
    riskScore: 99,
    description: "Novel exploit targeting CVE-2024-3094 (XZ Utils backdoor). Shellcode injection detected in NGINX worker process memory space.",
    evidence: [
      "CVE: CVE-2024-3094 (CVSS 10.0)",
      "Shellcode detected: 0x90909090 NOP sled",
      "Process injection: nginx worker pid 1847",
      "Outbound: Reverse shell attempt on :4444",
      "Threat actor: APT-29 TTPs match",
    ],
    region: "NL",
  },
  {
    id: "THR-007",
    type: "DDoS — Volumetric",
    severity: "high",
    ip: "103.75.190.22",
    target: "EDGE-LB-01",
    status: "mitigated",
    time: "41m ago",
    coords: [540, 150],
    riskScore: 64,
    description: "Distributed denial of service attack from 3,200 unique IPs. Volumetric UDP flood at 48 Gbps. Scrubbing center engaged.",
    evidence: [
      "Volume: 48.2 Gbps peak",
      "Sources: 3,247 unique IPs",
      "Protocol: UDP 53 amplification",
      "Amplification factor: 32x",
      "Scrubbing: 99.1% traffic cleaned",
    ],
    region: "SG",
  },
  {
    id: "THR-008",
    type: "Insider Threat — Data Exfil",
    severity: "medium",
    ip: "10.0.5.88",
    target: "S3-PROD-BUCKET",
    status: "investigating",
    time: "52m ago",
    coords: [130, 115],
    riskScore: 61,
    description: "Employee account uploading large volumes of sensitive data to personal cloud storage. DLP policy triggered on PII transfer.",
    evidence: [
      "User: jsmith@company.com",
      "Transfer: 14.2 GB to personal Dropbox",
      "Content: Customer PII — GDPR applicable",
      "Time: 02:14 AM (off-hours)",
      "DLP Rule: PII_Mass_Exfil triggered",
    ],
    region: "INTERNAL",
  },
  {
    id: "THR-009",
    type: "Phishing Campaign",
    severity: "medium",
    ip: "198.51.100.8",
    target: "EMAIL-GW",
    status: "blocked",
    time: "1h ago",
    coords: [150, 120],
    riskScore: 55,
    description: "Spear-phishing campaign targeting finance team. Malicious macro-enabled Excel attachment with credential harvesting payload.",
    evidence: [
      "Emails: 847 to finance@company.com",
      "Subject: 'Q4 Budget Review — Action Required'",
      "Attachment: invoice_q4.xlsm (malicious macro)",
      "C2 callback: hxxps://ev1l-phish.ru/c2",
      "DMARC: Spoofed domain detected",
    ],
    region: "RU",
  },
  {
    id: "THR-010",
    type: "Privilege Escalation",
    severity: "high",
    ip: "10.0.22.144",
    target: "LINUX-PROD-07",
    status: "blocked",
    time: "1h 20m ago",
    coords: [350, 160],
    riskScore: 76,
    description: "Local privilege escalation via SUID binary exploitation. Attacker gained root access from www-data account.",
    evidence: [
      "Binary: /usr/local/bin/update_util (SUID)",
      "Exploit: Stack buffer overflow",
      "Before: www-data (uid=33)",
      "After: root (uid=0)",
      "Shell spawned: /bin/bash via execve",
    ],
    region: "INTERNAL",
  },
  {
    id: "THR-011",
    type: "Port Scan",
    severity: "low",
    ip: "91.108.4.195",
    target: "DMZ-NET",
    status: "blocked",
    time: "2h ago",
    coords: [380, 85],
    riskScore: 22,
    description: "Systematic TCP SYN scan across DMZ subnet. 65,535 ports scanned in 4 minutes.",
    evidence: [
      "Scan type: TCP SYN stealth scan",
      "Ports: 1-65535 sequential",
      "Rate: 16,384 probes/sec",
      "Tool signature: Masscan 1.3.2",
      "Action: Null-routed at ISP level",
    ],
    region: "DE",
  },
  {
    id: "THR-012",
    type: "API Abuse",
    severity: "medium",
    ip: "204.16.241.10",
    target: "API-GW-PROD",
    status: "blocked",
    time: "2h 15m ago",
    coords: [120, 170],
    riskScore: 48,
    description: "Automated scraping of product catalog API using stolen API key. 2.4M requests in 6 hours.",
    evidence: [
      "API Key: prod_k_...9f2a (revoked)",
      "Requests: 2,412,847 in 6 hours",
      "Endpoint: GET /api/catalog/items",
      "Rate: 112 req/sec sustained",
      "Key origin: GitHub leak detected",
    ],
    region: "US",
  },
  {
    id: "THR-013",
    type: "Cryptomining",
    severity: "low",
    ip: "10.1.4.88",
    target: "K8S-WORKER-03",
    status: "mitigated",
    time: "3h ago",
    coords: [490, 120],
    riskScore: 31,
    description: "Cryptomining malware deployed via compromised container image. CPU usage spiked to 98% on K8s worker node.",
    evidence: [
      "Process: xmrig --pool pool.minexmr.com",
      "CPU: 98.2% sustained for 4h",
      "Wallet: 44AFF...k3x (Monero)",
      "Container: malicious_img:latest",
      "Image pulled from: unknown registry",
    ],
    region: "INTERNAL",
  },
  {
    id: "THR-014",
    type: "Brute Force — SSH",
    severity: "low",
    ip: "185.156.73.20",
    target: "BASTION-01",
    status: "blocked",
    time: "4h ago",
    coords: [310, 100],
    riskScore: 18,
    description: "Automated SSH brute force attack against bastion host. 50,000 password attempts over 2 hours.",
    evidence: [
      "Attempts: 50,847 in 2 hours",
      "Usernames: root, admin, ubuntu, ec2-user",
      "Passwords: Top-1000 wordlist",
      "Tool: Medusa v2.2 signature",
      "Action: Fail2ban triggered — IP blocked",
    ],
    region: "BR",
  },
];

export const DEFENSE_LAYERS: DefenseLayer[] = [
  { layer: 1, name: "Perimeter Firewall", status: "healthy", score: 98, alerts: 0 },
  { layer: 2, name: "WAF / DDoS Shield", status: "healthy", score: 94, alerts: 1 },
  { layer: 3, name: "Identity Provider", status: "degraded", score: 71, alerts: 3 },
  { layer: 4, name: "Network Segmentation", status: "healthy", score: 88, alerts: 0 },
  { layer: 5, name: "Endpoint Detection (EDR)", status: "healthy", score: 91, alerts: 2 },
  { layer: 6, name: "Data Loss Prevention", status: "degraded", score: 63, alerts: 4 },
  { layer: 7, name: "SIEM Correlation", status: "critical", score: 42, alerts: 7 },
  { layer: 8, name: "Threat Intelligence", status: "healthy", score: 96, alerts: 0 },
];

export const EVENT_POOL: Omit<LiveEvent, "id">[] = [
  { type: "threat",        severity: "critical", title: "Credential stuffing detected",        ip: "185.220.101.47" },
  { type: "blocked_attack",severity: "low",      title: "Brute force blocked at perimeter",    ip: "192.168.1.12" },
  { type: "anomaly",       severity: "high",     title: "Unusual login from RU geo",           ip: "45.129.56.200" },
  { type: "audit",         severity: "medium",   title: "Admin privilege escalation logged",   ip: "10.0.14.22" },
  { type: "incident",      severity: "critical", title: "C2 beacon detected — PROD",           ip: "103.75.190.22" },
  { type: "blocked_attack",severity: "medium",   title: "SQL injection attempt blocked",       ip: "185.176.26.3" },
  { type: "threat",        severity: "high",     title: "DNS tunneling pattern match",          ip: "2.56.109.4" },
  { type: "blocked_attack",severity: "low",      title: "Port scan blocked: 10 ports",         ip: "198.51.100.8" },
  { type: "anomaly",       severity: "medium",   title: "API rate limit exceeded 10x",         ip: "10.0.5.88" },
  { type: "audit",         severity: "low",      title: "Config change: firewall rule",        ip: "internal" },
  { type: "threat",        severity: "high",     title: "Lateral movement via SMB detected",   ip: "10.0.22.144" },
  { type: "blocked_attack",severity: "critical", title: "Zero-day exploit attempt blocked",    ip: "91.108.4.195" },
  { type: "anomaly",       severity: "low",      title: "Anomalous process spawn: xmrig",      ip: "10.1.4.88" },
  { type: "incident",      severity: "high",     title: "Phishing payload quarantined",        ip: "204.16.241.10" },
  { type: "audit",         severity: "medium",   title: "New admin user created: svc_backup2", ip: "10.0.14.22" },
];

export const HONEYPOTS = [
  { coords: [160, 120] as [number, number], hits: 24 },
  { coords: [510, 140] as [number, number], hits: 12 },
  { coords: [340, 90]  as [number, number], hits: 38 },
];

export const COMMANDS = [
  { group: "Actions",  icon: "🚫", label: "/block-ip",        desc: "Block an IP address at the perimeter",        shortcut: "" },
  { group: "Actions",  icon: "🔑", label: "/revoke-session",  desc: "Revoke an active user session",               shortcut: "" },
  { group: "Actions",  icon: "🔍", label: "/scan-host",       desc: "Initiate deep scan on a host",                shortcut: "" },
  { group: "Actions",  icon: "⚡", label: "/auto-mitigate",   desc: "Trigger auto-mitigation on threat ID",        shortcut: "" },
  { group: "Actions",  icon: "📋", label: "/create-incident", desc: "Open new incident ticket",                    shortcut: "" },
  { group: "Navigate", icon: "📊", label: "/dashboard",       desc: "Go to security posture overview",             shortcut: "G D" },
  { group: "Navigate", icon: "🎯", label: "/threats",         desc: "Open threat detection panel",                 shortcut: "G T" },
  { group: "Navigate", icon: "📁", label: "/incidents",       desc: "Open incident management",                    shortcut: "G I" },
  { group: "Navigate", icon: "👤", label: "/identities",      desc: "Open identity & access",                      shortcut: "G U" },
  { group: "Navigate", icon: "🔌", label: "/api",             desc: "Open API posture panel",                      shortcut: "" },
  { group: "System",   icon: "🔒", label: "/lockdown",        desc: "Initiate system lockdown protocol",           shortcut: "" },
  { group: "System",   icon: "📤", label: "/export-report",   desc: "Export current threat report",                shortcut: "" },
  { group: "System",   icon: "🔄", label: "/refresh-intel",   desc: "Force threat intelligence refresh",           shortcut: "" },
];

export const INCIDENTS: Incident[] = [
  { id: "INC-0841", priority: "P1", title: "Ransomware C2 active on PROD-DB-01",       status: "open",        assignee: "S. Liu",     created: "2m ago",   updated: "2m ago" },
  { id: "INC-0840", priority: "P1", title: "Zero-day exploitation of NGINX edge node", status: "in_progress", assignee: "R. Patel",   created: "34m ago",  updated: "12m ago" },
  { id: "INC-0839", priority: "P1", title: "Credential stuffing — 103 compromised",    status: "open",        assignee: "D. Chen",    created: "1h ago",   updated: "45m ago" },
  { id: "INC-0838", priority: "P2", title: "Lateral movement — CORP-DC-01",            status: "in_progress", assignee: "M. Torres",  created: "2h ago",   updated: "30m ago" },
  { id: "INC-0837", priority: "P2", title: "DNS tunneling exfiltration attempt",        status: "in_progress", assignee: "S. Liu",     created: "3h ago",   updated: "1h ago" },
  { id: "INC-0836", priority: "P2", title: "Insider threat — mass PII exfiltration",   status: "open",        assignee: "Unassigned", created: "4h ago",   updated: "4h ago" },
  { id: "INC-0835", priority: "P3", title: "DDoS — volumetric attack mitigated",       status: "resolved",    assignee: "R. Patel",   created: "6h ago",   updated: "5h ago" },
  { id: "INC-0834", priority: "P3", title: "API key leak — GitHub public repo",        status: "resolved",    assignee: "D. Chen",    created: "8h ago",   updated: "7h ago" },
  { id: "INC-0833", priority: "P3", title: "Cryptomining malware — K8s worker",        status: "resolved",    assignee: "M. Torres",  created: "12h ago",  updated: "10h ago" },
  { id: "INC-0832", priority: "P4", title: "Port scan from AS bogon range",            status: "closed",      assignee: "S. Liu",     created: "1d ago",   updated: "20h ago" },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  { id: "AUD-4421", action: "Firewall rule modified",           actor: "admin@aegis.io",   resource: "FW-EDGE-01",     ip: "10.0.1.5",    result: "success", time: "2m ago" },
  { id: "AUD-4420", action: "Admin account created",           actor: "svc_backup2",      resource: "IAM",            ip: "10.0.14.22",  result: "warning", time: "5m ago" },
  { id: "AUD-4419", action: "Threat auto-mitigated",           actor: "AEGIS-ENGINE",     resource: "THR-007",        ip: "system",      result: "success", time: "41m ago" },
  { id: "AUD-4418", action: "IP blocked at perimeter",         actor: "AEGIS-ENGINE",     resource: "FW-EDGE-01",     ip: "system",      result: "success", time: "1h ago" },
  { id: "AUD-4417", action: "API key revoked",                 actor: "admin@aegis.io",   resource: "API-KEY-prod_k9f2a", ip: "10.0.1.5", result: "success", time: "2h ago" },
  { id: "AUD-4416", action: "Failed login — brute force",      actor: "root",             resource: "BASTION-01",     ip: "185.156.73.20", result: "failure", time: "4h ago" },
  { id: "AUD-4415", action: "Incident created — P1",          actor: "S. Liu",           resource: "INC-0841",       ip: "10.0.1.5",    result: "success", time: "2m ago" },
  { id: "AUD-4414", action: "SSL certificate renewed",         actor: "CERTBOT",          resource: "NGINX-EDGE-01",  ip: "system",      result: "success", time: "6h ago" },
  { id: "AUD-4413", action: "2FA disabled for user",           actor: "jsmith@company.com", resource: "IAM",          ip: "10.0.5.88",   result: "warning", time: "52m ago" },
  { id: "AUD-4412", action: "DLP policy triggered",            actor: "DLP-ENGINE",       resource: "S3-PROD-BUCKET", ip: "system",      result: "warning", time: "52m ago" },
  { id: "AUD-4411", action: "Container image pulled — unverified", actor: "k8s-worker-03", resource: "K8S-WORKER-03", ip: "10.1.4.88", result: "failure", time: "3h ago" },
  { id: "AUD-4410", action: "Scheduled scan completed",        actor: "SCANNER",          resource: "ALL-HOSTS",      ip: "system",      result: "success", time: "5h ago" },
];
