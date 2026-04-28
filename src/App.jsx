import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";

/* ============================================================
   IFC PERFORMANCE STANDARDS 2012 — SELF-ASSESSMENT COMPLIANCE
   A+CSR Indonesia | Client-facing diagnostic instrument
   ============================================================ */

// ---------- STYLE TOKENS (inline CSS for editorial aesthetic) ----------
const STYLE_TAG = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:        #0D1B2A;
    --ink-soft:   #1B2A41;
    --parchment:  #F6F1E7;
    --paper:      #FDFBF5;
    --rule:       #2C3A55;
    --gold:       #B89151;
    --gold-soft:  #D9B97E;
    --sage:       #4A6741;
    --amber:      #C9862E;
    --crimson:    #A63A2A;
    --mute:       #6B6356;
    --mute-2:     #A89F8C;
  }

  .font-display { font-family: 'Fraunces', 'Playfair Display', Georgia, serif; font-variation-settings: 'opsz' 120; }
  .font-body    { font-family: 'Inter', system-ui, sans-serif; }
  .font-mono    { font-family: 'SF Mono', Consolas, monospace; }

  .bg-parchment { background-color: var(--parchment); }
  .bg-paper     { background-color: var(--paper); }
  .bg-ink       { background-color: var(--ink); }
  .bg-ink-soft  { background-color: var(--ink-soft); }
  .text-ink     { color: var(--ink); }
  .text-ink-soft{ color: var(--ink-soft); }
  .text-gold    { color: var(--gold); }
  .text-sage    { color: var(--sage); }
  .text-amber   { color: var(--amber); }
  .text-crimson { color: var(--crimson); }
  .text-mute    { color: var(--mute); }
  .text-mute-2  { color: var(--mute-2); }
  .border-rule  { border-color: var(--rule); }
  .border-ink   { border-color: var(--ink); }
  .border-gold  { border-color: var(--gold); }

  .hairline { border-bottom: 1px solid rgba(13,27,42,0.12); }
  .hairline-t { border-top: 1px solid rgba(13,27,42,0.12); }
  .double-rule { border-top: 1px solid var(--ink); border-bottom: 3px double var(--ink); }

  .paper-grain {
    background-color: var(--parchment);
    background-image:
      radial-gradient(circle at 25% 25%, rgba(184,145,81,0.04) 0%, transparent 40%),
      radial-gradient(circle at 75% 75%, rgba(13,27,42,0.03) 0%, transparent 50%);
  }

  .ink-shadow {
    box-shadow: 0 1px 0 rgba(13,27,42,0.04), 0 2px 6px rgba(13,27,42,0.06);
  }

  .ornament::before, .ornament::after {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: var(--gold);
    vertical-align: middle;
    margin: 0 14px;
  }

  .small-caps {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 500;
  }

  .btn-primary {
    background: var(--ink);
    color: var(--paper);
    padding: 10px 20px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 500;
    border: 1px solid var(--ink);
    transition: all 0.15s;
  }
  .btn-primary:hover { background: var(--ink-soft); }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    padding: 10px 20px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 500;
    border: 1px solid var(--ink);
    transition: all 0.15s;
  }
  .btn-ghost:hover { background: var(--ink); color: var(--paper); }

  .score-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
    border-radius: 2px;
  }

  .indicator-row { transition: background-color 0.15s; }
  .indicator-row:hover { background-color: rgba(184,145,81,0.04); }

  .tab-active { border-bottom: 2px solid var(--ink); color: var(--ink); }
  .tab-inactive { border-bottom: 2px solid transparent; color: var(--mute); }
  .tab-inactive:hover { color: var(--ink-soft); }

  .serial-number {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--mute-2);
  }

  input[type="text"], input[type="date"], textarea {
    font-family: 'Inter', sans-serif;
    background: var(--paper);
    border: 1px solid rgba(13,27,42,0.2);
    padding: 8px 12px;
    font-size: 13px;
    color: var(--ink);
    transition: border-color 0.15s;
    width: 100%;
  }
  input[type="text"]:focus, input[type="date"]:focus, textarea:focus {
    outline: none;
    border-color: var(--ink);
  }

  .score-btn {
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid rgba(13,27,42,0.2);
    background: var(--paper);
    color: var(--mute);
    cursor: pointer;
    transition: all 0.12s;
    flex: 1 1 50px;
    min-width: 50px;
    min-height: 40px;
  }
  .score-btn:hover { border-color: var(--ink); color: var(--ink); }
  .score-btn.active-0 { background: #E8E2D3; color: var(--mute); border-color: var(--mute); }
  .score-btn.active-1 { background: #F4DCCD; color: var(--crimson); border-color: var(--crimson); }
  .score-btn.active-2 { background: #F5E6CB; color: var(--amber); border-color: var(--amber); }
  .score-btn.active-3 { background: #E6EBDB; color: var(--sage); border-color: var(--sage); }
  .score-btn.active-4 { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .score-btn.active-na { background: #E5E0D3; color: var(--mute); border-color: var(--mute-2); font-style: italic; }

  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .print-page { page-break-after: always; }
    .print-break-inside-avoid { page-break-inside: avoid; }
  }
`;

/* ============================================================
   INDICATOR CORPUS — 114 indicators mapped to IFC PS 2012
   Each indicator references the specific paragraph in the PS.
   ============================================================ */

const PS_META = {
  1: {
    code: "PS 1",
    title: "Assessment and Management of Environmental and Social Risks and Impacts",
    short: "ESMS & Stakeholder Engagement",
    abbr: "ESMS",
  },
  2: {
    code: "PS 2",
    title: "Labor and Working Conditions",
    short: "Labor & Working Conditions",
    abbr: "Labor",
  },
  3: {
    code: "PS 3",
    title: "Resource Efficiency and Pollution Prevention",
    short: "Resource Efficiency & Pollution",
    abbr: "Resource",
  },
  4: {
    code: "PS 4",
    title: "Community Health, Safety, and Security",
    short: "Community Health, Safety & Security",
    abbr: "CHSS",
  },
  5: {
    code: "PS 5",
    title: "Land Acquisition and Involuntary Resettlement",
    short: "Land Acquisition & Resettlement",
    abbr: "Land",
  },
  6: {
    code: "PS 6",
    title: "Biodiversity Conservation and Sustainable Management of Living Natural Resources",
    short: "Biodiversity & Natural Resources",
    abbr: "Biodiv.",
  },
  7: {
    code: "PS 7",
    title: "Indigenous Peoples",
    short: "Indigenous Peoples",
    abbr: "IP",
  },
  8: {
    code: "PS 8",
    title: "Cultural Heritage",
    short: "Cultural Heritage",
    abbr: "Heritage",
  },
};

const INDICATORS = [
  // ========== PS 1 — ESMS & STAKEHOLDER ENGAGEMENT (35) ==========
  { id: "1.1.1", ps: 1, section: "Policy", ref: "¶6", text: "Overarching E&S policy established, defining objectives and principles consistent with the Performance Standards.", guidance: "Policy must specify compliance with applicable laws and host-country obligations under international law; communicated at all levels." },
  { id: "1.1.2", ps: 1, section: "Policy", ref: "¶6", text: "Policy identifies who within the organization ensures conformance and is responsible for execution.", guidance: "Named senior management accountability; includes reference to responsible government agency/third party where relevant." },
  { id: "1.2.1", ps: 1, section: "Identification of Risks & Impacts", ref: "¶7", text: "Systematic process established for identifying E&S risks and impacts based on recent baseline data at an appropriate level of detail.", guidance: "Scope consistent with GIIP; may be full ESIA, focused assessment, or audit depending on project type." },
  { id: "1.2.2", ps: 1, section: "Identification of Risks & Impacts", ref: "¶8", text: "Risks and impacts identified across the project's Area of Influence, including associated facilities and cumulative impacts.", guidance: "AoI includes direct/indirect, predictable unplanned developments, and cumulative impacts with other developments." },
  { id: "1.2.3", ps: 1, section: "Identification of Risks & Impacts", ref: "¶7, ¶10", text: "Assessment considers GHG emissions, climate risks, transboundary effects, and primary supply chain risks where client has reasonable control.", guidance: "Includes PS 2 (paras 27–29) and PS 6 (para 30) supply-chain considerations." },
  { id: "1.2.4", ps: 1, section: "Identification of Risks & Impacts", ref: "¶12", text: "Disadvantaged or vulnerable individuals/groups identified and differentiated measures proposed so adverse impacts do not fall disproportionately on them.", guidance: "Consider gender, age, ethnicity, disability, poverty, dependence on unique natural resources." },
  { id: "1.3.1", ps: 1, section: "Management Programs", ref: "¶13–15", text: "Management programs established describing mitigation and performance improvement measures following the mitigation hierarchy (avoid → minimize → compensate/offset).", guidance: "Mitigation hierarchy favors avoidance; compensation/offset only for residual impacts where technically and financially feasible." },
  { id: "1.3.2", ps: 1, section: "Management Programs", ref: "¶16", text: "Environmental & Social Action Plan(s) defined with measurable outcomes, performance indicators, targets, timeframes, resources, and responsibilities.", guidance: "ESAP is responsive to monitoring results and changing circumstances; may include RAP, BAP, LRP, etc." },
  { id: "1.4.1", ps: 1, section: "Organizational Capacity & Competency", ref: "¶17", text: "Organizational structure defining roles, responsibilities, and authority for ESMS implementation; management representative(s) designated.", guidance: "Sufficient management sponsorship and human/financial resources on an ongoing basis." },
  { id: "1.4.2", ps: 1, section: "Organizational Capacity & Competency", ref: "¶18–19", text: "Personnel have requisite knowledge, skills, and experience including current host-country regulatory requirements; external experts engaged where technically complex.", guidance: "Training program in place; competency verified for significant adverse-impact projects." },
  { id: "1.5.1", ps: 1, section: "Emergency Preparedness & Response", ref: "¶20–21", text: "Emergency preparedness and response system covering identification of accident/emergency areas, procedures, equipment, responsibilities, and periodic training.", guidance: "Covers potentially Affected Communities; reviewed and revised to reflect changing conditions." },
  { id: "1.5.2", ps: 1, section: "Emergency Preparedness & Response", ref: "¶21", text: "Active collaboration with Affected Communities and local government on emergency preparedness; active role where government capacity is limited.", guidance: "Documented activities, resources, and responsibilities shared with relevant parties." },
  { id: "1.6.1", ps: 1, section: "Monitoring & Review", ref: "¶22", text: "Procedures established to monitor and measure the effectiveness of the management program and compliance with legal/regulatory obligations.", guidance: "For projects with significant impacts, external experts retained to verify monitoring information." },
  { id: "1.6.2", ps: 1, section: "Monitoring & Review", ref: "¶24", text: "Senior management receives periodic performance reviews of the ESMS and takes necessary corrective and preventive actions.", guidance: "Based on systematic data collection and analysis; actions followed up in subsequent cycles." },
  { id: "1.7.1", ps: 1, section: "Stakeholder Analysis & Planning", ref: "¶26–27", text: "Stakeholder mapping/analysis conducted identifying Affected Communities, vulnerable sub-groups, other stakeholders (NGOs, media, government, neighboring projects), and their interests, influence, and concerns.", guidance: "Disaggregate by gender, age, ethnicity, settlement pattern, livelihood, and land tenure; update as project evolves. Map should distinguish between those directly affected vs. those with an interest." },
  { id: "1.7.2", ps: 1, section: "Stakeholder Analysis & Planning", ref: "¶27", text: "Stakeholder Engagement Plan (SEP) developed, scaled to project risks/impacts and development stage, tailored to characteristics/interests of Affected Communities, with differentiated measures for disadvantaged/vulnerable groups.", guidance: "SEP covers stakeholder analysis, disclosure, consultation, grievance mechanism, reporting. Budget, timeline, responsibilities defined; review/update cycle established." },
  { id: "1.7.3", ps: 1, section: "Stakeholder Analysis & Planning", ref: "¶28", text: "Where exact project location is not yet known, a Stakeholder Engagement Framework is prepared outlining principles and strategy for identifying Affected Communities once location is determined.", guidance: "Applies for corporate-finance, FI portfolios, or projects with undefined physical footprint; framework expanded into full SEP when site is known." },
  { id: "1.7.4", ps: 1, section: "Stakeholder Analysis & Planning", ref: "¶27", text: "Where community representatives are relied upon, reasonable efforts made to verify they genuinely represent the views of Affected Communities and faithfully communicate consultation outcomes to constituents.", guidance: "Verify legitimacy of religious leaders, village councils, civil society; cross-check with direct community engagement to avoid capture by elites or self-appointed representatives." },
  { id: "1.7.5", ps: 1, section: "Disclosure of Information", ref: "¶29", text: "Affected Communities provided access to relevant project information: (i) purpose/nature/scale; (ii) duration; (iii) risks/impacts and mitigation; (iv) envisaged engagement process; (v) grievance mechanism.", guidance: "Culturally appropriate local language(s) and format; understandable; accessible via multiple channels (meetings, posters, radio, mosque/church announcements, village boards). Avoid purely written disclosures in low-literacy contexts." },
  { id: "1.7.6", ps: 1, section: "Disclosure of Information", ref: "¶29", text: "Disclosure is timely — i.e., occurs sufficiently in advance of decisions so communities have meaningful opportunity to review, discuss internally, and respond.", guidance: "Document disclosure dates relative to project milestones; account for local calendar (planting/harvest, religious periods) and cultural decision-making cycles." },
  { id: "1.7.7", ps: 1, section: "Consultation", ref: "¶30", text: "Consultation is two-way: (i) begins early in risks/impacts identification; (ii) continues as issues arise; (iii) free of manipulation/coercion/interference/intimidation; (iv) enables meaningful participation; (v) documented.", guidance: "Attendance lists, minutes, Q&A logs, photos/recordings (with consent), summary of concerns raised and how addressed. Evidence that consultation influenced project decisions." },
  { id: "1.7.8", ps: 1, section: "Consultation", ref: "¶30–31", text: "Consultation tailored to language preferences, decision-making processes, and needs of disadvantaged/vulnerable groups; inclusive engagement focuses on directly affected rather than the broader public.", guidance: "Separate sessions where appropriate for women, youth, elderly, displaced persons, illiterate participants, Indigenous Peoples; select venues/timing that enable their participation." },
  { id: "1.7.9", ps: 1, section: "Consultation", ref: "¶31", text: "For projects with potentially significant adverse impacts, Informed Consultation and Participation (ICP) conducted — organized, iterative exchange leading to incorporation of community views in decision-making on mitigation, benefit-sharing, and implementation.", guidance: "Goes beyond one-off consultation; documented iterative process. Client informs those affected about how their concerns have been considered (or why not)." },
  { id: "1.7.10", ps: 1, section: "Consultation", ref: "¶31", text: "Consultation process captures both men's and women's views — through separate forums/engagements where necessary — and reflects their differentiated concerns, priorities, and preferences.", guidance: "Women-only consultations for gender-sensitive topics (resettlement, livelihoods, GBV, health); use female facilitators; schedule at times women can attend. Findings disaggregated by gender in documentation." },
  { id: "1.7.11", ps: 1, section: "Indigenous Peoples Consultation", ref: "¶32", text: "For projects with adverse impacts on Indigenous Peoples, ICP is undertaken and, in circumstances described in PS 7, Free, Prior, and Informed Consent (FPIC) is obtained.", guidance: "Cross-reference PS 7 requirements; FPIC circumstances include impacts on lands under customary use, relocation, or critical cultural heritage." },
  { id: "1.7.12", ps: 1, section: "Government-Led Stakeholder Engagement", ref: "¶33", text: "Where host government is responsible for SE, client collaborates to achieve PS 1 outcomes; where government capacity is limited or process falls short, client conducts complementary engagement and supplemental actions.", guidance: "Document gaps between government-led process and PS 1; describe supplemental actions with implementation responsibility and timeline." },
  { id: "1.8.1", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Grievance mechanism for Affected Communities established as early as possible, scaled to project risks/impacts, with Affected Communities as primary users.", guidance: "Established before construction/operations commence; explicitly linked to the SEP. Proportionate to project footprint and community concerns." },
  { id: "1.8.2", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Multiple intake channels available and publicized: in-person (grievance officer, field office), written (suggestion box, letter), phone/SMS, community liaison, and via community representatives where appropriate.", guidance: "Channels match community preferences and literacy levels; well-signposted at project gate, village offices, worship venues, markets; contact details disclosed in local language." },
  { id: "1.8.3", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Mechanism is transparent, culturally appropriate, and readily accessible — at no cost to complainant — and operates without retribution toward those raising concerns.", guidance: "Non-retaliation policy signed by management; document anonymity/confidentiality options; translation services available; accessible for persons with disabilities." },
  { id: "1.8.4", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Documented procedure with defined stages (receipt, acknowledgment, investigation, resolution, appeal/escalation, closure) and committed response timeframes for each stage.", guidance: "Typical practice: acknowledgment ≤7 days; investigation ≤30 days; complex cases with interim communication. Independent/multi-stakeholder escalation panel for unresolved cases." },
  { id: "1.8.5", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Grievance register/log maintained with case categories, demographic disaggregation, status, resolution time, and outcome; analyzed periodically for trends and root causes to inform management program adjustments.", guidance: "Register reviewed by senior management; recurring issues trigger systemic corrective action. Anonymized summaries shared with communities during periodic reporting." },
  { id: "1.8.6", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Mechanism does not impede access to judicial or administrative remedies available under law, nor does it substitute for such remedies; this is communicated to complainants.", guidance: "Explicit statement in procedure; complainants informed of right to pursue external/legal remedies in parallel or after internal process." },
  { id: "1.8.7", ps: 1, section: "Grievance Mechanism", ref: "¶35", text: "Affected Communities informed about the grievance mechanism during the stakeholder engagement process, with awareness reinforced periodically.", guidance: "Awareness tested through spot-surveys, community meetings; materials (leaflets, posters, videos) distributed in local language; re-communicated when mechanism changes." },
  { id: "1.9.1", ps: 1, section: "External Communications & Reporting", ref: "¶34", text: "External communications procedure maintained: (i) receive/register communications from public; (ii) screen and assess; (iii) provide/track/document responses; (iv) adjust management program where appropriate.", guidance: "Applies to general public, not just Affected Communities; periodic sustainability reports encouraged as a proactive channel." },
  { id: "1.9.2", ps: 1, section: "External Communications & Reporting", ref: "¶36", text: "Periodic reports provided to Affected Communities on action plan implementation, ongoing risks/impacts, and issues raised via consultation or grievance mechanism (no less than annually).", guidance: "Frequency proportionate to community concerns; material changes to mitigation measures communicated promptly; format culturally appropriate." },

  // ========== PS 2 — LABOR AND WORKING CONDITIONS (16) ==========
  { id: "2.1.1", ps: 2, section: "Human Resources Policies", ref: "¶8–9", text: "Human resources policies and procedures adopted, appropriate to size/workforce; workers provided documented information on rights under national law and applicable collective agreements.", guidance: "Covers hours, wages, overtime, compensation, benefits; communicated upon start and upon material changes." },
  { id: "2.1.2", ps: 2, section: "Working Conditions & Terms", ref: "¶10", text: "Collective bargaining agreements respected where client is a party; reasonable working conditions and terms of employment provided where no agreement exists.", guidance: "Reference trade/industry norms in the area, collective agreements, arbitration awards, or national law." },
  { id: "2.1.3", ps: 2, section: "Working Conditions & Terms", ref: "¶11", text: "Migrant workers identified and engaged on substantially equivalent terms and conditions to non-migrant workers performing similar work.", guidance: "Non-discrimination principles explicitly apply to migrant workers." },
  { id: "2.1.4", ps: 2, section: "Working Conditions & Terms", ref: "¶12", text: "Worker accommodation (if provided) meets quality/management policy; basic services adequate; does not restrict freedom of movement or association.", guidance: "Minimum space, water, sanitation, ventilation, protection against heat/cold/noise/pests, cooking and storage, basic medical where applicable." },
  { id: "2.2.1", ps: 2, section: "Workers' Organizations", ref: "¶13–14", text: "Freedom of association respected in accordance with national law; where law is silent or restrictive, client does not discourage alternative mechanisms and does not discriminate/retaliate.", guidance: "Engage workers' representatives with information for meaningful negotiation in a timely manner." },
  { id: "2.3.1", ps: 2, section: "Non-Discrimination & Equal Opportunity", ref: "¶15–16", text: "Employment decisions based on principle of equal opportunity and fair treatment; no discrimination based on personal characteristics unrelated to inherent job requirements.", guidance: "Applies to recruitment, compensation, working conditions, training, promotion, termination, disciplinary practices." },
  { id: "2.3.2", ps: 2, section: "Non-Discrimination & Equal Opportunity", ref: "¶15", text: "Measures in place to prevent and address harassment, intimidation, and/or exploitation, especially in regard to women.", guidance: "Clear reporting channels; documented investigation and remediation procedures." },
  { id: "2.4.1", ps: 2, section: "Retrenchment", ref: "¶18", text: "Prior to collective dismissals, analysis of alternatives to retrenchment conducted; retrenchment plan developed with consultation where alternatives not viable.", guidance: "Alternatives include working-time reductions, capacity-building, long-term maintenance during low production, etc." },
  { id: "2.4.2", ps: 2, section: "Retrenchment", ref: "¶19", text: "Notice of dismissal and severance payments mandated by law and collective agreements paid in a timely manner; outstanding back pay, social security, pension benefits settled.", guidance: "Workers provided evidence of payments made for their benefit." },
  { id: "2.5.1", ps: 2, section: "Workers' Grievance Mechanism", ref: "¶20", text: "Grievance mechanism for workers (and their organizations) established; accessible, transparent, timely, without retribution; allows anonymous complaints.", guidance: "Does not impede access to judicial/administrative remedies or substitute for collective agreement mechanisms." },
  { id: "2.6.1", ps: 2, section: "Child Labor", ref: "¶21", text: "No children employed in economically exploitative manner or in ways harmful to education, health, or development; age of all persons under 18 identified.", guidance: "Children under 18 not employed in hazardous work; risk assessment and monitoring for under-18 workers." },
  { id: "2.7.1", ps: 2, section: "Forced Labor", ref: "¶22", text: "No forced labor employed (including indentured, bonded, or similar labor-contracting arrangements); no trafficked persons employed.", guidance: "Verification mechanisms in place for direct workers and third-party engagements." },
  { id: "2.8.1", ps: 2, section: "Occupational Health & Safety", ref: "¶23", text: "Safe and healthy work environment provided, accounting for sector-specific hazards; preventive and protective measures, training, documentation, and emergency arrangements in place.", guidance: "Consistent with GIIP and EHS Guidelines; addresses physical, chemical, biological, radiological hazards and threats to women." },
  { id: "2.9.1", ps: 2, section: "Contracted Workers", ref: "¶24–26", text: "Third parties engaging contracted workers verified as reputable/legitimate with appropriate ESMS; policies/procedures for managing and monitoring third-party performance.", guidance: "Commercially reasonable efforts to incorporate PS 2 requirements in contractual agreements." },
  { id: "2.9.2", ps: 2, section: "Contracted Workers", ref: "¶26", text: "Contracted workers have access to a grievance mechanism; client extends own mechanism where third party cannot provide one.", guidance: "Workers informed at recruitment; confidentiality maintained." },
  { id: "2.10.1", ps: 2, section: "Supply Chain", ref: "¶27–29", text: "Primary supply chain monitored for high risk of child labor, forced labor, and significant life-threatening safety issues; appropriate remedial actions taken.", guidance: "Where remedy not possible, shift primary supply chain over time to compliant suppliers." },

  // ========== PS 3 — RESOURCE EFFICIENCY & POLLUTION PREVENTION (12) ==========
  { id: "3.1.1", ps: 3, section: "Resource Efficiency", ref: "¶6", text: "Technically/financially feasible and cost-effective measures for improving efficiency in energy, water, and material inputs implemented for core business activities.", guidance: "Principles of cleaner production integrated into product design and production processes; benchmarking where data available." },
  { id: "3.2.1", ps: 3, section: "Greenhouse Gases", ref: "¶7", text: "Alternatives and technically/financially feasible, cost-effective options considered and implemented to reduce project-related GHG emissions during design and operation.", guidance: "Includes alternative locations, renewable/low-carbon sources, sustainable practices, fugitive emissions reduction, reduced flaring." },
  { id: "3.2.2", ps: 3, section: "Greenhouse Gases", ref: "¶8", text: "For projects >25,000 tCO₂e annually, direct and indirect (off-site energy) emissions quantified annually per internationally recognized methodologies.", guidance: "Includes non-energy sources (methane, N₂O), soil carbon/biomass changes, and significant decay of organic matter where applicable." },
  { id: "3.3.1", ps: 3, section: "Water Consumption", ref: "¶9", text: "Where project is a significant water consumer, measures adopted to avoid/reduce water usage so consumption does not adversely impact others.", guidance: "Includes conservation, alternative supplies, offsets, evaluation of alternative locations." },
  { id: "3.4.1", ps: 3, section: "Pollution Prevention", ref: "¶10", text: "Release of pollutants to air, water, and land avoided or, where not feasible, minimized/controlled across routine, non-routine, and accidental circumstances.", guidance: "Addresses local, regional, and transboundary impacts consistent with EHS Guidelines or more stringent host-country requirements." },
  { id: "3.4.2", ps: 3, section: "Pollution Prevention", ref: "¶10–11", text: "Historical contamination liability assessed; additional strategies (including location alternatives and offsets) considered where project would be a significant source in a degraded area.", guidance: "Considers ambient conditions, assimilative capacity, existing/future land use, biodiversity proximity, cumulative impacts." },
  { id: "3.5.1", ps: 3, section: "Wastes", ref: "¶12", text: "Generation of hazardous and non-hazardous wastes avoided; where unavoidable, reduction/reuse/recovery/safe treatment/disposal applied.", guidance: "Hazardous waste disposed of per GIIP; transboundary movement consistent with Basel Convention." },
  { id: "3.5.2", ps: 3, section: "Wastes", ref: "¶12", text: "Third-party hazardous waste disposal uses licensed contractors with chain-of-custody documentation to final destination; disposal sites verified to meet acceptable standards.", guidance: "Where licensed sites do not meet standards, reduce waste sent and consider alternative disposal options." },
  { id: "3.6.1", ps: 3, section: "Hazardous Materials Management", ref: "¶13", text: "Release of hazardous materials avoided or minimized; less hazardous substitutes considered; internationally banned/phased-out chemicals avoided.", guidance: "Covers production, transportation, handling, storage, use; consistent with Stockholm Convention and Montreal Protocol." },
  { id: "3.7.1", ps: 3, section: "Pesticide Use & Management", ref: "¶14–16", text: "IPM/IVM approach formulated and implemented where appropriate; pesticides selected for low toxicity, effectiveness, and minimal non-target/environmental effects.", guidance: "Handled, stored, applied, and disposed per FAO International Code of Conduct on Distribution and Use of Pesticides." },
  { id: "3.7.2", ps: 3, section: "Pesticide Use & Management", ref: "¶17", text: "No purchase/storage/use/manufacture/trade in WHO Class Ia or Ib pesticides; Class II only with appropriate controls and trained personnel.", guidance: "Restricted chemicals not accessible to personnel without proper training, equipment, and facilities." },
  { id: "3.4.3", ps: 3, section: "Pollution Prevention", ref: "¶5", text: "Where host-country regulations differ from EHS Guidelines, more stringent standard applied; any less-stringent alternative justified and protective of human health/environment.", guidance: "Justification included in site-specific environmental assessment." },

  // ========== PS 4 — COMMUNITY HEALTH, SAFETY & SECURITY (12) ==========
  { id: "4.1.1", ps: 4, section: "Community Health & Safety", ref: "¶5", text: "Risks and impacts to community health and safety evaluated across project lifecycle; preventive and control measures consistent with GIIP established.", guidance: "Measures favor avoidance over minimization; proportionate to nature and magnitude of impacts." },
  { id: "4.2.1", ps: 4, section: "Infrastructure & Equipment Safety", ref: "¶6", text: "Structural elements designed, constructed, operated, and decommissioned per GIIP, considering safety risks to third parties or communities.", guidance: "Designed by competent professionals; certified/approved by authorities; principles of universal access where publicly accessible." },
  { id: "4.2.2", ps: 4, section: "Infrastructure & Equipment Safety", ref: "¶6", text: "For structural elements in high-risk locations (dams, tailings dams, ash ponds), independent external experts engaged early and throughout lifecycle.", guidance: "Experts separate from design/construction team; review continues through decommissioning." },
  { id: "4.3.1", ps: 4, section: "Hazardous Materials Management & Safety", ref: "¶7", text: "Community exposure to hazardous materials avoided or minimized; commercially reasonable efforts to control safety of deliveries, transportation, and disposal.", guidance: "Special care for life-threatening hazards; modification, substitution, or elimination applied." },
  { id: "4.4.1", ps: 4, section: "Ecosystem Services", ref: "¶8", text: "Project impacts on priority ecosystem services (provisioning and regulating) identified; adverse impacts avoided or mitigated per PS 5 & PS 6.", guidance: "Consider vulnerability, climate-change interactions, natural buffer areas, freshwater availability." },
  { id: "4.5.1", ps: 4, section: "Community Exposure to Disease", ref: "¶9–10", text: "Potential community exposure to water-borne, water-based, water-related, vector-borne, and communicable diseases from project activities avoided or minimized.", guidance: "Consider differentiated exposure of vulnerable groups; opportunities to improve environmental conditions where diseases are endemic." },
  { id: "4.5.2", ps: 4, section: "Community Exposure to Disease", ref: "¶10", text: "Transmission of communicable diseases associated with temporary/permanent labor influx avoided or minimized.", guidance: "Includes influx management plans, health screening, community health education." },
  { id: "4.6.1", ps: 4, section: "Emergency Preparedness & Response", ref: "¶11", text: "Collaboration with Affected Communities, local government, and other parties in preparing to respond effectively to emergencies; active role where government capacity limited.", guidance: "Documented activities, resources, responsibilities disclosed to relevant parties." },
  { id: "4.7.1", ps: 4, section: "Security Personnel", ref: "¶12", text: "Security arrangements (direct or contracted) assessed for risks to those within and outside the project site; guided by proportionality and UN Code of Conduct for Law Enforcement Officials.", guidance: "Reasonable inquiries re past abuses; training in use of force; appropriate conduct toward workers and communities." },
  { id: "4.7.2", ps: 4, section: "Security Personnel", ref: "¶12", text: "Use of force sanctioned only for preventive/defensive purposes in proportion to threat; grievance mechanism for communities to express concerns about security.", guidance: "Rules of engagement documented; chain of command clear; incident reporting process." },
  { id: "4.7.3", ps: 4, section: "Security Personnel", ref: "¶13–14", text: "Risks arising from government security personnel assessed/documented; public authorities encouraged to disclose arrangements; unlawful/abusive acts investigated and reported.", guidance: "Consistent with Voluntary Principles on Security and Human Rights (good practice reference)." },
  { id: "4.3.2", ps: 4, section: "Hazardous Materials Management & Safety", ref: "¶7", text: "Measures to avoid or control community exposure to pesticides implemented in accordance with PS 3 requirements.", guidance: "Particular care during application in proximity to communities; notification protocols." },

  // ========== PS 5 — LAND ACQUISITION & INVOLUNTARY RESETTLEMENT (35) ==========
  { id: "5.1.1", ps: 5, section: "Project Design", ref: "¶8", text: "Feasible alternative project designs considered to avoid or minimize physical/economic displacement, balancing environmental, social, and financial costs/benefits.", guidance: "Particular attention to impacts on the poor and vulnerable." },
  { id: "5.1.2", ps: 5, section: "Project Design", ref: "¶3, ¶objectives", text: "Negotiated settlements used where possible to avoid expropriation, even where legal means to acquire without consent exist; forced eviction avoided.", guidance: "Forced eviction only per law and in accordance with PS 5 requirements." },
  { id: "5.2.1", ps: 5, section: "Compensation & Benefits", ref: "¶9", text: "Displaced persons compensated at full replacement cost and offered other assistance; compensation standards transparent and consistently applied.", guidance: "Replacement cost = market value + transaction costs; depreciation not deducted." },
  { id: "5.2.2", ps: 5, section: "Compensation & Benefits", ref: "¶9", text: "Land-based compensation offered where livelihoods are land-based or land is collectively owned; possession taken only after compensation made available.", guidance: "Staggered payments acceptable where one-off would undermine resettlement objectives." },
  { id: "5.2.3", ps: 5, section: "Compensation & Benefits", ref: "¶9", text: "Displaced communities provided opportunities to derive appropriate development benefits from the project.", guidance: "Benefit-sharing mechanisms culturally appropriate; documented." },
  { id: "5.3.1", ps: 5, section: "Community Engagement", ref: "¶10", text: "Engagement with Affected Communities and host communities per PS 1; decision-making includes options and alternatives; women's perspectives captured.", guidance: "Intra-household analysis where women's and men's livelihoods differently affected; preferences re compensation mechanisms explored." },
  { id: "5.4.1", ps: 5, section: "Grievance Mechanism (Resettlement)", ref: "¶11", text: "Grievance mechanism specific to resettlement established as early as possible in project development — before any land acquisition or displacement activities commence.", guidance: "Linked to but distinguishable from PS 1 general mechanism; covers compensation disputes, cut-off date claims, eligibility issues, replacement land/housing quality." },
  { id: "5.4.2", ps: 5, section: "Grievance Mechanism (Resettlement)", ref: "¶11", text: "Mechanism addresses specific concerns of displaced persons and host communities: compensation valuation, eligibility determination, replacement land/housing quality, livelihood restoration progress, and cultural/religious asset disputes.", guidance: "Categories tracked separately for physical vs. economic displacement; gender-disaggregated; disaggregated by vulnerability status." },
  { id: "5.4.3", ps: 5, section: "Grievance Mechanism (Resettlement)", ref: "¶11", text: "Includes an impartial recourse/appeal mechanism for unresolved disputes — typically a multi-stakeholder panel with community representatives, independent experts, and government (where appropriate).", guidance: "Decision-making independent from the acquiring party; decisions documented and communicated; mechanism does not impede judicial remedies." },
  { id: "5.4.4", ps: 5, section: "Grievance Mechanism (Resettlement)", ref: "¶11", text: "Grievances documented with case details, resolution timelines, and outcomes; resettlement grievance data feeds into monitoring of the RAP/LRP.", guidance: "Recurring grievance types trigger RAP/LRP adjustments; completion audit reviews grievance data as evidence of effective implementation." },
  { id: "5.5.1", ps: 5, section: "RAP/LRP Planning", ref: "¶12", text: "Census conducted to collect socio-economic baseline data — demographics, land/asset inventory, livelihoods, income, tenure status, vulnerability, cultural attachments.", guidance: "Comprehensive enumeration of affected persons, households, and assets with unique ID; GIS-referenced where possible. Disaggregated by gender, age, vulnerability." },
  { id: "5.5.2", ps: 5, section: "RAP/LRP Planning", ref: "¶12", text: "Cut-off date for eligibility clearly established, documented, and widely disseminated throughout the project area in culturally appropriate ways.", guidance: "Announced via village meetings, posters, local radio, newspaper of record; signed witness lists/attendance logs maintained; cut-off photographed/mapped where feasible." },
  { id: "5.5.3", ps: 5, section: "RAP/LRP Planning", ref: "¶14, ¶25", text: "Resettlement Action Plan and/or Livelihood Restoration Plan prepared covering scope, entitlements, budget, schedule, responsibilities, and monitoring framework.", guidance: "RAP for physical displacement (¶19); LRP for economic displacement (¶25); integrated document where both occur. Compliance with ¶19 contents: entitlements, budget, schedule, all categories of affected persons including host communities." },
  { id: "5.5.4", ps: 5, section: "RAP/LRP Planning", ref: "¶14", text: "M&E framework for RAP/LRP established — with KPIs, baseline, milestones, completion criteria, and provisions for periodic independent review.", guidance: "KPIs cover input (budget, staff), output (compensation paid, land transferred), outcome (livelihoods restored, standard of living). Independent monitoring by external professionals for projects with significant impacts." },
  { id: "5.5.5", ps: 5, section: "RAP/LRP Planning", ref: "¶15", text: "External completion audit of RAP/LRP planned and commissioned by competent/independent resettlement professionals at the end of agreed monitoring period for significant projects.", guidance: "Completion audit reviews all mitigation measures, compares outcomes to objectives, concludes on monitoring closure, and recommends Corrective Action Plan where objectives not met." },
  { id: "5.6.1", ps: 5, section: "Physical Displacement", ref: "¶20–21", text: "Displaced persons offered a choice among feasible resettlement options — adequate replacement housing, replacement land, or cash compensation where appropriate — with relocation assistance tailored to each group.", guidance: "Options genuinely feasible (not nominal); preferences of displaced persons re-location and hosting arrangements respected; existing social/cultural institutions preserved." },
  { id: "5.6.2", ps: 5, section: "Physical Displacement", ref: "¶20–21", text: "New resettlement sites offer improved living conditions — housing quality, basic services (water, sanitation, electricity, road access), access to social infrastructure (schools, health, markets), and tenure security.", guidance: "Site assessment pre-selection covering environmental hazards, distance to livelihoods, host-community absorption capacity; construction quality inspected." },
  { id: "5.6.3", ps: 5, section: "Physical Displacement", ref: "¶22", text: "Persons without legal title or recognizable claim (paragraph 17(iii)) offered adequate housing with security of tenure and compensated for non-land assets at full replacement cost.", guidance: "Relocation assistance sufficient to restore standard of living at an alternative site; cut-off date protection applies; urban informal settler trade-offs (location vs. tenure) addressed transparently." },
  { id: "5.6.4", ps: 5, section: "Physical Displacement", ref: "¶24", text: "Forced evictions not carried out except in accordance with law and the requirements of this Performance Standard; appropriate legal and other protections provided.", guidance: "Due process followed; no actions during adverse weather, school exams, harvest, or religious periods; vulnerable persons given special protection." },
  { id: "5.7.1", ps: 5, section: "Livelihood Restoration (General)", ref: "¶25", text: "Livelihood Restoration Plan compensates affected persons/communities at full replacement cost for lost assets or access to assets; entitlements transparent, consistent, and equitable.", guidance: "Valuation methodology documented and shared with displaced persons; replacement cost excludes depreciation; transaction costs included." },
  { id: "5.7.2", ps: 5, section: "Livelihood Restoration (Baseline & Typology)", ref: "¶12, ¶25", text: "Livelihood baseline completed covering all income streams (primary, secondary, seasonal), natural-resource dependence, cash vs. subsistence mix, and gender division of labor — by household and individual where relevant.", guidance: "Multiple livelihood categories identified (farming, fishing, forestry, livestock, petty trade, wage labor, artisanal mining); time-use diaries where appropriate." },
  { id: "5.7.3", ps: 5, section: "Livelihood Restoration (Baseline & Typology)", ref: "¶28", text: "Displaced persons categorized by livelihood type — land-based, natural-resource-based, wage-based, mixed — with tailored restoration strategy for each category.", guidance: "Land-based: replacement land prioritized; natural-resource-based: continued/alternative access; wage-based: skills training, job placement; mixed: composite package." },
  { id: "5.7.4", ps: 5, section: "Livelihood Restoration (Compensation)", ref: "¶27", text: "Business/commercial operators compensated for (i) cost of reestablishing operations elsewhere, (ii) lost net income during transition, and (iii) transfer/reinstallation costs of plant, machinery, equipment.", guidance: "Formal and informal businesses both covered; transitional cash flow support during relocation and ramp-up period." },
  { id: "5.7.5", ps: 5, section: "Livelihood Restoration (Compensation)", ref: "¶27", text: "Economically displaced persons without legally recognized claims (paragraph 17(iii)) compensated for lost non-land assets — crops, irrigation infrastructure, structures, land improvements — at full replacement cost.", guidance: "Cut-off date protection; no obligation for post-cut-off opportunistic settlers; documentation of improvements pre-acquisition." },
  { id: "5.7.6", ps: 5, section: "Livelihood Restoration (Land-Based)", ref: "¶28", text: "For land-based livelihoods, replacement land of combination of productive potential, locational advantages, and other factors at least equivalent to that being lost is offered as matter of priority.", guidance: "Soil quality, water access, market access, tenure security compared; where suitable replacement land not available, detailed verification required before alternative income-earning opportunities substituted." },
  { id: "5.7.7", ps: 5, section: "Livelihood Restoration (Natural-Resource-Based)", ref: "¶28", text: "For natural-resource-based livelihoods affected by access restrictions (¶5), continued access to affected resources or access to alternative resources with equivalent earning potential and accessibility provided.", guidance: "Where natural resources central to identity (e.g., sacred groves, fishing grounds), benefits/compensation may be collective rather than individual; fair benefit-sharing where project uses resources." },
  { id: "5.7.8", ps: 5, section: "Livelihood Restoration (Cash & Alternative Income)", ref: "¶28", text: "Where land/similar resources cannot be provided, alternative income-earning opportunities (credit facilities, skills training, cash support, employment) provided — recognizing cash compensation alone is frequently insufficient to restore livelihoods.", guidance: "Active labor market assessment; training matched to verified demand; monitoring of post-training placement; credit access with financial literacy support." },
  { id: "5.7.9", ps: 5, section: "Livelihood Restoration (Women & Vulnerable)", ref: "¶34.n17", text: "Women's livelihoods explicitly addressed: separate livelihood analysis where men's and women's livelihoods are differently affected; documentation/compensation in both spouses' names; training and credit access adapted to women's needs.", guidance: "Intra-household dynamics considered; measures to protect women's rights where national law/tenure does not recognize them; targeted support for female-headed households." },
  { id: "5.7.10", ps: 5, section: "Livelihood Restoration (Vulnerable Groups)", ref: "¶19", text: "Needs of the poor and vulnerable given particular attention — elderly, disabled, female-headed households, landless laborers, indigenous groups, children — with differentiated support packages.", guidance: "Vulnerability screening at census; tailored transitional support; linkage to social protection systems; monitoring indicators disaggregated by vulnerability." },
  { id: "5.7.11", ps: 5, section: "Livelihood Restoration (Transitional Support)", ref: "¶29", text: "Transitional support — cash stipends, food assistance, interim employment — provided based on reasonable estimate of time required to restore income-earning capacity and standards of living.", guidance: "Duration calibrated to livelihood type (e.g., tree crops may take 3–7 years); not prematurely discontinued; reviewed against restoration milestones." },
  { id: "5.7.12", ps: 5, section: "Livelihood Restoration (Development Benefits)", ref: "¶9", text: "Displaced communities provided opportunities to derive appropriate development benefits from the project — employment, supplier contracts, community infrastructure, shared equity/royalty arrangements where feasible.", guidance: "Benefit-sharing arrangements culturally appropriate and formalized; do not substitute for but supplement compensation and livelihood restoration." },
  { id: "5.7.13", ps: 5, section: "Livelihood Restoration (Monitoring & Completion)", ref: "¶15", text: "LRP implementation considered complete only when displaced persons have received full compensation/assistance AND are deemed to have been provided adequate opportunity to sustainably restore livelihoods.", guidance: "Completion criteria pre-defined and measurable (e.g., income parity or better, school attendance maintained, food security indicators, access to services); independent verification required." },
  { id: "5.7.14", ps: 5, section: "Livelihood Restoration (Host Communities)", ref: "¶19", text: "Impacts on host communities receiving displaced persons assessed and mitigated; entitlements extended to host communities where appropriate (shared services, labor competition, price inflation, social tensions).", guidance: "Host community consultation and grievance access; support for shared infrastructure; measures to prevent conflict between displaced and host populations." },
  { id: "5.8.1", ps: 5, section: "Government-Managed Resettlement", ref: "¶30–31", text: "Where government responsible, collaboration with agency to achieve PS 5 outcomes; active role where government capacity is limited; Supplemental Resettlement Plan prepared if needed.", guidance: "SRP addresses identification of affected people, description of regulated activities, supplemental measures, financial/implementation responsibilities." },
  { id: "5.8.2", ps: 5, section: "Government-Managed Resettlement", ref: "¶32", text: "For government-managed economic displacement, Environmental & Social Action Plan developed to complement government action where measures fall short of PS 5.", guidance: "Additional compensation and livelihood restoration efforts included where applicable." },

  // ========== PS 6 — BIODIVERSITY & NATURAL RESOURCES (14) ==========
  { id: "6.1.1", ps: 6, section: "General", ref: "¶6", text: "Direct and indirect project-related impacts on biodiversity and ecosystem services identified, including relevant threats (habitat loss, IAS, overexploitation, hydrology, pollution).", guidance: "Considers landscape/seascape scale; values attached by Affected Communities and other stakeholders." },
  { id: "6.1.2", ps: 6, section: "General", ref: "¶7–8", text: "Mitigation hierarchy applied to biodiversity and ecosystem services; competent professionals retained (external experts where critical habitat or offsets are involved).", guidance: "Adaptive management practiced throughout project lifecycle." },
  { id: "6.2.1", ps: 6, section: "Modified Habitat", ref: "¶11–12", text: "Impacts on modified habitats with significant biodiversity value minimized; mitigation measures implemented as appropriate.", guidance: "Significant biodiversity value determined via risks/impacts identification." },
  { id: "6.3.1", ps: 6, section: "Natural Habitat", ref: "¶13–14", text: "Significant conversion or degradation of natural habitats avoided unless no viable alternatives, stakeholder consultation completed, and impacts mitigated per hierarchy.", guidance: "Significant conversion = elimination/severe diminution of integrity or substantial reduction of ability to maintain viable native populations." },
  { id: "6.3.2", ps: 6, section: "Natural Habitat", ref: "¶15", text: "Mitigation measures in natural habitat designed to achieve no net loss of biodiversity where feasible (set-asides, biological corridors, restoration, offsets).", guidance: "Set-asides defined using recognized approaches (e.g., High Conservation Value, systematic conservation planning)." },
  { id: "6.4.1", ps: 6, section: "Critical Habitat", ref: "¶16–17", text: "Critical habitat identified (CR/EN species, endemic/restricted-range, globally significant migratory/congregatory, threatened/unique ecosystems, key evolutionary processes).", guidance: "Determination informed by IUCN Red List and national/regional lists; aligned with competent professionals." },
  { id: "6.4.2", ps: 6, section: "Critical Habitat", ref: "¶17–18", text: "No project activities in critical habitat unless: no viable alternatives, no measurable adverse impacts on biodiversity values, no net reduction of CR/EN species, and robust long-term monitoring integrated.", guidance: "Biodiversity Action Plan designed to achieve net gains for the biodiversity values for which critical habitat was designated." },
  { id: "6.4.3", ps: 6, section: "Critical Habitat", ref: "¶19", text: "Where biodiversity offsets are proposed, assessment demonstrates significant residual impacts adequately mitigated to meet PS 6 paragraph 17 requirements.", guidance: "Like-for-like or better principle; external experts involved in offset design." },
  { id: "6.5.1", ps: 6, section: "Legally Protected & Internationally Recognized Areas", ref: "¶20", text: "Proposed development in legally protected/internationally recognized areas is legally permitted, consistent with management plans, with relevant consultation and conservation-enhancement programs.", guidance: "Internationally recognized: UNESCO WHS, MAB reserves, Key Biodiversity Areas, Ramsar wetlands." },
  { id: "6.6.1", ps: 6, section: "Invasive Alien Species", ref: "¶21–23", text: "No intentional introduction of new alien species unless regulated; no deliberate introduction of species with high invasive risk; risk assessment included for any introductions.", guidance: "Measures to avoid accidental/unintended introductions (substrates, ballast, plant materials)." },
  { id: "6.6.2", ps: 6, section: "Invasive Alien Species", ref: "¶23", text: "Diligence exercised in not spreading established IAS; where practicable, measures taken to eradicate such species from natural habitats under management control.", guidance: "Programs integrated into operational procedures; monitored for effectiveness." },
  { id: "6.7.1", ps: 6, section: "Ecosystem Services", ref: "¶24–25", text: "Systematic review conducted to identify priority ecosystem services; Affected Communities participate in determination where likely impacted; adverse impacts avoided/mitigated.", guidance: "Priority services: those most likely impacted and/or on which project directly depends (e.g., water)." },
  { id: "6.8.1", ps: 6, section: "Sustainable Management of Living Natural Resources", ref: "¶26–29", text: "Primary production of living natural resources managed sustainably per industry-specific practices and credible standards; independent verification/certification pursued.", guidance: "Agribusiness/forestry projects prioritize unforested/already-converted land; pre-assessment where certification pending." },
  { id: "6.9.1", ps: 6, section: "Supply Chain", ref: "¶30", text: "Where primary production is sourced from regions with risk of natural/critical habitat conversion, systems and verification practices adopted to evaluate primary suppliers.", guidance: "Supply identification, ongoing review, procurement limited to non-converting suppliers, shift toward compliant suppliers over time." },

  // ========== PS 7 — INDIGENOUS PEOPLES (28) ==========
  { id: "7.1.1", ps: 7, section: "Identification & Avoidance", ref: "¶5–8", text: "Indigenous Peoples within project area of influence identified via E&S assessment; nature and degree of direct/indirect economic, social, cultural, and environmental impacts documented.", guidance: "Characteristics: self-identification, collective attachment, customary institutions, distinct language." },
  { id: "7.1.2", ps: 7, section: "Identification & Avoidance", ref: "¶9", text: "Adverse impacts on Affected Communities of Indigenous Peoples avoided where possible; where unavoidable, minimized, restored, and/or compensated culturally appropriately.", guidance: "Time-bound plan (e.g., Indigenous Peoples Plan or community development plan with separate IP components) developed with ICP." },
  { id: "7.2.1", ps: 7, section: "Participation & Consent (ICP)", ref: "¶10", text: "Culturally appropriate engagement process undertaken — stakeholder analysis, disclosure, consultation/participation — with Indigenous Peoples' representative bodies/organizations (councils of elders, village councils).", guidance: "Engagement tailored to Indigenous Peoples' protocols; not mere compliance with generic SEP; customary institutions respected." },
  { id: "7.2.2", ps: 7, section: "Participation & Consent (ICP)", ref: "¶10", text: "Sufficient time allowed for Indigenous Peoples' decision-making processes, recognizing that internal decisions are often collective, iterative, and may involve internal dissent requiring resolution.", guidance: "Project timeline accommodates community decision cycles; no pressure tactics; document time allowed from disclosure to decision; sensitive to seasonal, ceremonial, and cultural calendars." },
  { id: "7.2.3", ps: 7, section: "Participation & Consent (FPIC Scope)", ref: "¶11, ¶13–17", text: "FPIC circumstances correctly identified: (i) impacts on lands/resources under customary use; (ii) relocation from traditional/customary lands; (iii) significant impacts on critical cultural heritage; (iv) commercial use of IP cultural heritage/knowledge/practices.", guidance: "Each FPIC trigger documented separately; external experts engaged to assist in risk/impact identification when any FPIC circumstance is present." },
  { id: "7.2.4", ps: 7, section: "FPIC Process", ref: "¶12", text: "FPIC established through good-faith negotiation between client and Affected Communities of Indigenous Peoples — building on and expanding the ICP process.", guidance: "Good faith: willingness to modify project design in response to community views; no take-it-or-leave-it offers; parties engage with genuine intent to reach agreement." },
  { id: "7.2.5", ps: 7, section: "FPIC Process", ref: "¶12", text: "FPIC process conditions met: FREE (no coercion/intimidation/manipulation); PRIOR (in advance of decisions/activities); INFORMED (full, objective, accessible information on project scope, risks, impacts, mitigation, alternatives).", guidance: "Information in Indigenous language(s) and culturally appropriate format; independent advisors available to the community if requested; no conditioning of compensation/benefits on consent." },
  { id: "7.2.6", ps: 7, section: "FPIC Process", ref: "¶12", text: "The mutually accepted process between client and Affected Communities of Indigenous Peoples is documented — covering parties, representatives, meeting logs, information shared, negotiation points, and resolution of disputes.", guidance: "Process document signed/endorsed by community representatives; translated/back-translated; retained as evidence throughout project life; periodically reaffirmed where circumstances change." },
  { id: "7.2.7", ps: 7, section: "FPIC Process", ref: "¶12", text: "Evidence of agreement between the parties as outcome of negotiations is documented — this may include formal agreements, MoUs, or community resolutions recording what was agreed and under what conditions.", guidance: "Agreements are explicit about scope of consent (which activities, which period, subject to what conditions); provide for renegotiation where material changes occur; avoid ambiguity that could later be disputed." },
  { id: "7.2.8", ps: 7, section: "FPIC Process", ref: "¶12", text: "FPIC does not require unanimity and may be achieved even when individuals or groups within the community explicitly disagree — but the process acknowledges and documents such disagreement.", guidance: "Minority views recorded; internal decision legitimacy assessed (widely participatory, consistent with customary governance); documented safeguards to prevent harm to dissenting community members." },
  { id: "7.2.9", ps: 7, section: "FPIC Process", ref: "¶10, ¶12", text: "Community representatives verified as legitimate under the community's own governance norms; measures taken to ensure inclusion of women, youth, elders, and marginalized sub-groups in FPIC decision-making.", guidance: "Guard against elite capture or externally-selected representatives; women's participation structurally enabled (separate forums where culturally required); representatives accountable to the community, not to the project." },
  { id: "7.2.10", ps: 7, section: "FPIC Process", ref: "¶11", text: "External experts engaged to assist in identification of project risks and impacts whenever FPIC circumstances apply, and to support good-faith negotiation where appropriate.", guidance: "Experts independent of project proponent; qualifications include anthropology, indigenous rights law, relevant cultural expertise; community may have its own advisors." },
  { id: "7.2.11", ps: 7, section: "FPIC Application", ref: "¶11", text: "FPIC applies to project design, implementation, and expected outcomes — not only at a single point in time; ongoing consent is reaffirmed at major project milestones and when scope/impacts change materially.", guidance: "Define trigger events for reaffirmation (e.g., expansion, change in ownership, unforeseen impacts); document consent continuity or renegotiation." },
  { id: "7.3.1", ps: 7, section: "Impacts on Lands/Resources (Customary Use)", ref: "¶13–14", text: "Documented efforts to avoid land/resource impacts; property interests and traditional resource uses identified before purchase/leasing; gender-inclusive assessment of use.", guidance: "Indigenous Peoples informed of land rights under national law, including any recognition of customary use." },
  { id: "7.3.2", ps: 7, section: "Impacts on Lands/Resources (Customary Use)", ref: "¶14", text: "Land-based compensation or compensation-in-kind provided in lieu of cash where feasible; continued access to natural resources ensured or equivalent replacement identified.", guidance: "Fair and equitable sharing of benefits where project utilizes resources central to identity/livelihood." },
  { id: "7.3.3", ps: 7, section: "Impacts on Lands/Resources (Customary Use)", ref: "¶14", text: "Affected Communities provided with access, usage, and transit on land being developed, subject to overriding health/safety/security considerations.", guidance: "Balances operational requirements with customary access needs." },
  { id: "7.4.1", ps: 7, section: "Relocation from Customary Lands (FPIC Trigger)", ref: "¶15", text: "Feasible alternative project designs considered and documented to avoid relocation from communally held lands/resources under traditional ownership or customary use.", guidance: "Alternatives analysis includes no-project, re-siting, re-routing, redesign; avoidance documented even when relocation appears unavoidable; decision rationale transparent to community." },
  { id: "7.4.2", ps: 7, section: "Relocation from Customary Lands (FPIC Trigger)", ref: "¶15", text: "Where relocation is unavoidable, project does NOT proceed without FPIC of the Affected Communities of Indigenous Peoples.", guidance: "Documentary evidence of FPIC prior to any displacement activity; consent is specific to relocation and not bundled with unrelated project issues." },
  { id: "7.4.3", ps: 7, section: "Relocation from Customary Lands (FPIC Trigger)", ref: "¶15", text: "Relocation carried out consistent with PS 5 requirements (RAP, replacement cost, livelihood restoration, etc.), with additional culturally appropriate safeguards for Indigenous Peoples.", guidance: "PS 5 + PS 7 applied jointly; sacred sites, spiritual landscape, and intergenerational transmission of knowledge explicitly considered in relocation planning." },
  { id: "7.4.4", ps: 7, section: "Relocation from Customary Lands (FPIC Trigger)", ref: "¶15", text: "Where feasible, relocated Indigenous Peoples are able to return to their traditional or customary lands once the cause of relocation ceases to exist.", guidance: "Return provisions documented in FPIC agreement; post-closure land-use planning supports return where appropriate; no permanent alienation where avoidable." },
  { id: "7.5.1", ps: 7, section: "Critical Cultural Heritage (FPIC Trigger)", ref: "¶16", text: "Critical cultural heritage essential to Indigenous Peoples' identity and/or cultural/ceremonial/spiritual life identified through competent professional study and consultation with community.", guidance: "Includes sacred sites, burial grounds, ceremonial grounds, sacred natural features, traditional knowledge sites; inventory developed with community participation." },
  { id: "7.5.2", ps: 7, section: "Critical Cultural Heritage (FPIC Trigger)", ref: "¶16", text: "Avoidance of significant impacts on critical cultural heritage is prioritized; where significant impacts are unavoidable, FPIC is obtained from Affected Communities of Indigenous Peoples.", guidance: "Significance determined jointly with community; avoidance not limited to physical preservation — includes spiritual/functional integrity of sites." },
  { id: "7.5.3", ps: 7, section: "Commercial Use of IP Heritage (FPIC Trigger)", ref: "¶17", text: "Where project proposes commercial use of Indigenous Peoples' cultural heritage (knowledge, innovations, practices), Affected Communities informed of: (i) their rights under national law; (ii) scope and nature of proposed commercial development; (iii) potential consequences.", guidance: "Disclosure in culturally appropriate format and Indigenous language(s); examples include traditional medicinal knowledge, crafts, designs, or naming rights." },
  { id: "7.5.4", ps: 7, section: "Commercial Use of IP Heritage (FPIC Trigger)", ref: "¶17", text: "FPIC obtained for any commercial use of IP cultural heritage, and fair and equitable benefit-sharing from commercialization is ensured — consistent with the customs and traditions of the Indigenous Peoples.", guidance: "Benefit-sharing arrangement documented; royalties, profit-sharing, or collective benefit mechanisms; respect for customary ownership of knowledge (often collective, not individual)." },
  { id: "7.6.1", ps: 7, section: "Mitigation & Development Benefits", ref: "¶18–19", text: "Mitigation measures and sustainable development benefits identified with the Affected Communities of Indigenous Peoples; timely and equitable delivery of agreed measures.", guidance: "Individual vs. collective compensation reflects community laws/institutions/customs and interaction with mainstream society." },
  { id: "7.6.2", ps: 7, section: "Mitigation & Development Benefits", ref: "¶20", text: "Identified opportunities aim to address IP goals and preferences, improving livelihoods culturally appropriately and fostering long-term sustainability of natural resources.", guidance: "Intergenerational differences and needs considered." },
  { id: "7.7.1", ps: 7, section: "Government Role", ref: "¶21–22", text: "Where government has defined role in managing IP issues, collaboration with responsible agency; active role where government capacity is limited.", guidance: "Plan prepared addressing PS 7 requirements, government-provided entitlements, gaps, and financial/implementation responsibilities." },
  { id: "7.7.2", ps: 7, section: "Government Role", ref: "¶22", text: "Plan documents ICP/engagement/FPIC processes (where relevant); government entitlements; gap-bridging measures; client vs. agency financial/implementation roles.", guidance: "Bridge measures ensure PS 7 requirements met despite any government capacity gaps." },

  // ========== PS 8 — CULTURAL HERITAGE (10) ==========
  { id: "8.1.1", ps: 8, section: "Protection in Project Design", ref: "¶6–7", text: "Internationally recognized practices for protection, field-based study, and documentation of cultural heritage implemented; competent professionals retained where chance of impacts exists.", guidance: "Complies with national law implementing host-country obligations under World Heritage Convention." },
  { id: "8.2.1", ps: 8, section: "Chance Find Procedures", ref: "¶8", text: "Project sited and designed to avoid significant adverse impacts; chance find procedure developed as part of ESMS; no disturbance of finds until competent professional assessment.", guidance: "Procedure covers stop-work, notification, assessment, and action protocols." },
  { id: "8.3.1", ps: 8, section: "Consultation", ref: "¶9", text: "Affected Communities with long-standing cultural use consulted to identify heritage of importance; national/local regulatory agencies entrusted with heritage protection involved.", guidance: "Views incorporated into decision-making." },
  { id: "8.4.1", ps: 8, section: "Community Access", ref: "¶10", text: "Continued access allowed to cultural heritage sites previously used by Affected Communities, or alternative access provided, subject to overriding safety considerations.", guidance: "Based on consultation under paragraph 9." },
  { id: "8.5.1", ps: 8, section: "Removal of Replicable Cultural Heritage", ref: "¶11", text: "Mitigation hierarchy applied to replicable cultural heritage: minimize + restore in situ → restore functionality elsewhere → permanent removal → compensation.", guidance: "Replicable = can be moved or replaced; ecosystem processes maintained where relevant." },
  { id: "8.6.1", ps: 8, section: "Removal of Non-Replicable Cultural Heritage", ref: "¶12", text: "Non-replicable cultural heritage not removed unless no technically/financially feasible alternatives, project benefits conclusively outweigh loss, and best available technique used.", guidance: "Preservation in place prioritized; irreparable damage avoided." },
  { id: "8.7.1", ps: 8, section: "Critical Cultural Heritage", ref: "¶13–14", text: "Critical cultural heritage not removed, significantly altered, or damaged; in exceptional cases, ICP with Affected Communities via good-faith negotiation with documented outcome.", guidance: "External experts retained to assist in assessment and protection." },
  { id: "8.7.2", ps: 8, section: "Critical Cultural Heritage", ref: "¶15", text: "Within legally protected heritage areas/buffer zones: national/local regulations complied with, sponsors/managers consulted, conservation-enhancement programs implemented.", guidance: "Additional to requirements for critical cultural heritage in paragraph 14." },
  { id: "8.8.1", ps: 8, section: "Project's Use of Cultural Heritage", ref: "¶16", text: "Commercial use of community cultural heritage/knowledge/practices only after rights disclosure, ICP via good-faith negotiation with documented outcome, and fair/equitable benefit-sharing.", guidance: "Examples: traditional medicinal knowledge, sacred/traditional processing techniques." },
  { id: "8.2.2", ps: 8, section: "Chance Find Procedures", ref: "¶8", text: "Actions in event of chance find consistent with PS 8 requirements identified by competent professionals before any further disturbance.", guidance: "Stop-work authority clearly assigned to designated personnel." },
];

/* ============================================================
   SCORING SYSTEM & MATURITY LEVELS
   ============================================================ */

const SCORE_LEVELS = [
  { value: 0, label: "Not Started", short: "NS", desc: "No evidence of implementation; ad hoc or non-existent." },
  { value: 1, label: "Initial", short: "INI", desc: "Informal or partial practices; not documented or systematic." },
  { value: 2, label: "Developing", short: "DEV", desc: "Documented but inconsistently applied; gaps remain." },
  { value: 3, label: "Established", short: "EST", desc: "Systematic implementation meeting most PS criteria." },
  { value: 4, label: "Advanced", short: "ADV", desc: "Fully integrated, monitored, continuously improving; meets/exceeds PS." },
];

// Storage keys
const K_META = "ifc-ps:metadata";
const K_RESP = "ifc-ps:responses";
const K_ESAP = "ifc-ps:esap";

/* ============================================================
   UTILITIES
   ============================================================ */

const computePSScore = (responses, psNumber) => {
  const psIndicators = INDICATORS.filter((i) => i.ps === psNumber);
  const scored = psIndicators
    .map((i) => responses[i.id])
    .filter((r) => r && r.score !== undefined && r.score !== "NA" && r.score !== null);
  if (scored.length === 0) return { avg: 0, pct: 0, answered: 0, total: psIndicators.length, naCount: psIndicators.filter(i => responses[i.id]?.score === "NA").length };
  const sum = scored.reduce((a, r) => a + Number(r.score), 0);
  const avg = sum / scored.length;
  return {
    avg,
    pct: (avg / 4) * 100,
    answered: scored.length,
    total: psIndicators.length,
    naCount: psIndicators.filter(i => responses[i.id]?.score === "NA").length,
  };
};

const computeOverall = (responses) => {
  const perPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => computePSScore(responses, n));
  const scoredPS = perPS.filter((p) => p.answered > 0);
  if (scoredPS.length === 0) return { avg: 0, pct: 0, completion: 0 };
  const avgOfAvgs = scoredPS.reduce((a, p) => a + p.avg, 0) / scoredPS.length;
  const totalAnswered = perPS.reduce((a, p) => a + p.answered + p.naCount, 0);
  const totalItems = INDICATORS.length;
  return {
    avg: avgOfAvgs,
    pct: (avgOfAvgs / 4) * 100,
    completion: (totalAnswered / totalItems) * 100,
  };
};

const getMaturityLabel = (avg) => {
  if (avg >= 3.5) return { label: "Advanced", color: "var(--ink)", cls: "text-ink" };
  if (avg >= 2.5) return { label: "Established", color: "var(--sage)", cls: "text-sage" };
  if (avg >= 1.5) return { label: "Developing", color: "var(--amber)", cls: "text-amber" };
  if (avg > 0) return { label: "Initial", color: "var(--crimson)", cls: "text-crimson" };
  return { label: "Not Started", color: "var(--mute)", cls: "text-mute" };
};

const priorityGap = (response) => {
  if (!response || response.score === undefined || response.score === null || response.score === "NA") return null;
  const s = Number(response.score);
  if (s <= 1) return "High";
  if (s === 2) return "Medium";
  return null;
};

// Narrative helper: generate prose text based on scores
const narrativeFor = (psScore) => {
  const { avg, answered } = psScore;
  if (answered === 0) {
    return {
      verdict: "Not yet assessed",
      narrative: "This Performance Standard has not been scored. Completing the assessment will yield findings and recommendations specific to this area.",
    };
  }
  if (avg >= 3.5) {
    return {
      verdict: "Strong alignment with the Performance Standard",
      narrative: "The client's management system demonstrates advanced maturity in this area. Practices are fully integrated into core business decisions, continuously monitored, and improved through formal review cycles. External verification and lender-ready documentation are attainable. Sustaining this position will require continued investment in training, internal audit, and senior-management oversight.",
    };
  }
  if (avg >= 2.5) {
    return {
      verdict: "Established practice with room for refinement",
      narrative: "The client has established systematic practices that meet most of the Performance Standard's requirements. Documentation, procedures, and responsibilities are defined and generally implemented. Remaining gaps relate to consistency of application, evidence of outcomes, and depth of stakeholder engagement. A focused improvement plan over 6–12 months would move the client toward Advanced maturity.",
    };
  }
  if (avg >= 1.5) {
    return {
      verdict: "Developing — significant gaps remain",
      narrative: "The client has initiated relevant practices but implementation is inconsistent and documentation is partial. Several requirements are addressed informally or at individual-project level rather than systematically. Prior to any IFC- or Equator-Principles-aligned financing, a structured corrective action plan with clearly assigned responsibilities, timelines, and budget is required.",
    };
  }
  if (avg > 0) {
    return {
      verdict: "Initial stage — material risk exposure",
      narrative: "Current practice is informal, fragmented, or ad-hoc. The absence of documented systems creates material E&S and reputational risk, particularly where project impacts are significant. Immediate attention is required — including policy adoption, role assignment, and baseline studies — before project expansion or external financing is pursued.",
    };
  }
  return {
    verdict: "Not started — foundational action required",
    narrative: "No evidence of implementation has been identified. The client should treat this Performance Standard as a first-order priority, beginning with policy commitment, stakeholder identification, and external expert engagement.",
  };
};

/* ============================================================
   LAYOUT COMPONENTS
   ============================================================ */

function MastheadRule() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center my-2">
      <span style={{ width: 40, height: 1, background: "var(--gold)" }} />
      <span className="mx-3 text-gold font-display" style={{ fontSize: 10 }}>❦</span>
      <span style={{ width: 40, height: 1, background: "var(--gold)" }} />
    </div>
  );
}

function Header({ meta, overall }) {
  return (
    <header className="paper-grain border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="small-caps text-mute" style={{ fontSize: 10 }}>
              A+CSR Indonesia · Diagnostic Suite
            </div>
            <h1
              className="font-display text-ink mt-2 text-3xl md:text-4xl"
              style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em" }}
            >
              IFC Performance Standards 2012
            </h1>
            <div className="font-display text-ink-soft italic mt-1" style={{ fontSize: 20, fontWeight: 300 }}>
              Self-Assessment Compliance Dashboard
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="serial-number">VOL. I · ED. 2026</div>
            <div className="font-display text-ink" style={{ fontSize: 14, marginTop: 4 }}>
              {meta.projectName || "Untitled Project"}
            </div>
            <div className="small-caps text-mute" style={{ fontSize: 9 }}>
              {meta.clientName || "Client organization"}
            </div>
          </div>
        </div>
        <MastheadRule />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 hidden md:flex">
          <div className="flex flex-wrap gap-6 md:gap-8" style={{ fontSize: 11 }}>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Overall Maturity</div>
              <div className="font-display text-ink" style={{ fontSize: 20 }}>
                {overall.avg.toFixed(2)}<span className="text-mute-2" style={{ fontSize: 12 }}> / 4.00</span>
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Completion</div>
              <div className="font-display text-ink" style={{ fontSize: 20 }}>
                {overall.completion.toFixed(0)}<span className="text-mute-2" style={{ fontSize: 12 }}>%</span>
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Status</div>
              <div className={`font-display ${getMaturityLabel(overall.avg).cls}`} style={{ fontSize: 16 }}>
                {getMaturityLabel(overall.avg).label}
              </div>
            </div>
          </div>
          <div className="small-caps text-mute-2" style={{ fontSize: 9 }}>
            {meta.assessmentDate || new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>
    </header>
  );
}

function Nav({ page, setPage }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "assessment", label: "Assessment" },
    { id: "scorecards", label: "Scorecards" },
    { id: "gap", label: "Gap Analysis" },
    { id: "esap", label: "ESAP" },
    { id: "report", label: "Summary Report" },
    { id: "narrative", label: "Full Report" },
    { id: "setup", label: "Setup" },
  ];
  return (
    <nav className="bg-paper no-print">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setPage(t.id)}
              className={`py-4 font-body ${page === t.id ? "tab-active" : "tab-inactive"}`}
              style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   OVERVIEW PAGE
   ============================================================ */

function RadarView({ responses }) {
  const data = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const s = computePSScore(responses, n);
    return {
      ps: PS_META[n].abbr,
      fullName: PS_META[n].code,
      score: s.avg,
      fullMark: 4,
    };
  });

  return (
    <div className="bg-paper border border-rule p-6 ink-shadow">
      <div className="small-caps text-mute mb-1" style={{ fontSize: 10 }}>Fig. I</div>
      <h3 className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
        Maturity Profile
      </h3>
      <p className="font-body text-mute italic" style={{ fontSize: 11, marginBottom: 12 }}>
        Average score across 8 Performance Standards (0–4 scale)
      </p>
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(13,27,42,0.15)" />
            <PolarAngleAxis
              dataKey="ps"
              tick={{ fill: "var(--ink)", fontSize: 11, fontFamily: "Inter", fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 4]}
              tick={{ fill: "var(--mute)", fontSize: 9 }}
              stroke="rgba(13,27,42,0.2)"
            />
            <Radar
              name="Maturity"
              dataKey="score"
              stroke="var(--ink)"
              fill="var(--gold)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PSCard({ psNum, responses, onClick }) {
  const meta = PS_META[psNum];
  const score = computePSScore(responses, psNum);
  const mat = getMaturityLabel(score.avg);
  const pct = score.total > 0 ? ((score.answered + score.naCount) / score.total) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className="text-left bg-paper border border-rule p-5 ink-shadow hover:border-ink transition-all group"
      style={{ minHeight: 180 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>{meta.code}</div>
          <div className="font-display text-ink mt-1" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>
            {meta.short}
          </div>
        </div>
        <div className="font-display text-ink" style={{ fontSize: 28, fontWeight: 300 }}>
          {score.avg.toFixed(1)}
          <span className="text-mute-2" style={{ fontSize: 12 }}>/4</span>
        </div>
      </div>
      <div className="hairline mb-3" />
      <div className="flex items-center justify-between" style={{ fontSize: 10 }}>
        <span className={`small-caps ${mat.cls}`}>{mat.label}</span>
        <span className="text-mute">{score.answered + score.naCount}/{score.total} answered</span>
      </div>
      <div className="mt-3" style={{ height: 3, background: "rgba(13,27,42,0.08)" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: mat.color,
            transition: "width 0.3s",
          }}
        />
      </div>
      <div className="mt-4 small-caps text-mute group-hover:text-ink" style={{ fontSize: 9 }}>
        Open assessment →
      </div>
    </button>
  );
}

function OverviewPage({ responses, setPage, setActivePS }) {
  const overall = computeOverall(responses);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ I</div>
        <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Diagnostic Overview
        </h2>
        <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 640 }}>
          A structured appraisal of the client's alignment with the IFC Performance Standards on
          Environmental and Social Sustainability (2012), covering all eight Standards across {INDICATORS.length}{" "}
          indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <RadarView responses={responses} />
        </div>

        <div className="bg-ink text-paper p-6 flex flex-col">
          <div className="small-caps" style={{ color: "var(--gold-soft)", fontSize: 10 }}>Executive Summary</div>
          <h3 className="font-display mt-1" style={{ fontSize: 22, fontWeight: 400, color: "var(--paper)" }}>
            At a glance
          </h3>
          <div className="my-5" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }} />
          <div className="space-y-5 flex-1">
            <div>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>
                Overall Maturity Index
              </div>
              <div className="font-display" style={{ fontSize: 42, fontWeight: 300, color: "var(--paper)", lineHeight: 1 }}>
                {overall.avg.toFixed(2)}
                <span style={{ fontSize: 16, color: "var(--mute-2)" }}> /4.00</span>
              </div>
              <div className="font-display italic mt-1" style={{ fontSize: 14, color: "var(--gold-soft)" }}>
                {getMaturityLabel(overall.avg).label}
              </div>
            </div>
            <div>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>
                Assessment Completion
              </div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 300, color: "var(--paper)" }}>
                {overall.completion.toFixed(0)}%
              </div>
              <div className="mt-2" style={{ height: 4, background: "rgba(255,255,255,0.15)" }}>
                <div style={{ width: `${overall.completion}%`, height: "100%", background: "var(--gold)", transition: "width 0.3s" }} />
              </div>
            </div>
          </div>
          <button
            onClick={() => setPage("assessment")}
            className="mt-6 py-3 font-body"
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Begin / Continue Assessment
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ II</div>
          <h3 className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500 }}>
            The Eight Performance Standards
          </h3>
        </div>
        <div className="serial-number">click to enter</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <PSCard
            key={n}
            psNum={n}
            responses={responses}
            onClick={() => {
              setActivePS(n);
              setPage("assessment");
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ASSESSMENT PAGE
   ============================================================ */

function ScoreButtons({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {SCORE_LEVELS.map((lvl) => {
        const active = value === lvl.value;
        return (
          <button
            key={lvl.value}
            onClick={() => onChange(lvl.value)}
            className={`score-btn ${active ? `active-${lvl.value}` : ""}`}
            title={lvl.desc}
          >
            {lvl.value} · {lvl.short}
          </button>
        );
      })}
      <button
        onClick={() => onChange("NA")}
        className={`score-btn ${value === "NA" ? "active-na" : ""}`}
        title="Not applicable to this project"
      >
        N/A
      </button>
    </div>
  );
}

function IndicatorRow({ indicator, response, onChange }) {
  const [showNotes, setShowNotes] = useState(false);
  const hasContent = response?.notes || response?.evidence;

  const handleScore = (score) => {
    onChange(indicator.id, { ...response, score });
  };

  const handleField = (field, val) => {
    onChange(indicator.id, { ...response, [field]: val });
  };

  return (
    <div className="indicator-row border-b border-rule" style={{ borderBottomColor: "rgba(13,27,42,0.08)" }}>
      <div className="py-5 px-5">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0" style={{ width: 60 }}>
            <div className="serial-number" style={{ fontSize: 10 }}>
              {indicator.id}
            </div>
            <div className="small-caps text-gold mt-1" style={{ fontSize: 9 }}>
              {indicator.ref}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-body text-ink" style={{ fontSize: 13, lineHeight: 1.55 }}>
              {indicator.text}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-mute font-body italic" style={{ fontSize: 11 }}>
                Guidance
              </summary>
              <p className="font-body text-mute mt-1 pl-3 border-l border-gold" style={{ fontSize: 11, lineHeight: 1.5 }}>
                {indicator.guidance}
              </p>
            </details>
          </div>
          <div className="flex-shrink-0">
            <ScoreButtons value={response?.score} onChange={handleScore} />
            <button
              onClick={() => setShowNotes((s) => !s)}
              className="small-caps text-mute mt-2 hover:text-ink"
              style={{ fontSize: 9 }}
            >
              {showNotes ? "− Hide" : "+ Add"} Notes & Evidence {hasContent && "●"}
            </button>
          </div>
        </div>
        {showNotes && (
          <div className="mt-4 grid grid-cols-2 gap-4 pl-16">
            <div>
              <label className="small-caps text-mute" style={{ fontSize: 9 }}>
                Findings / Notes
              </label>
              <textarea
                rows={3}
                value={response?.notes || ""}
                onChange={(e) => handleField("notes", e.target.value)}
                placeholder="Observations, assessor notes, interview findings..."
                style={{ marginTop: 4, fontSize: 12 }}
              />
            </div>
            <div>
              <label className="small-caps text-mute" style={{ fontSize: 9 }}>
                Evidence / Document Reference
              </label>
              <textarea
                rows={3}
                value={response?.evidence || ""}
                onChange={(e) => handleField("evidence", e.target.value)}
                placeholder="Policy doc ref, procedure ID, records reviewed..."
                style={{ marginTop: 4, fontSize: 12 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AssessmentPage({ responses, setResponses, activePS, setActivePS }) {
  const indicators = useMemo(() => INDICATORS.filter((i) => i.ps === activePS), [activePS]);
  const psScore = computePSScore(responses, activePS);
  const meta = PS_META[activePS];

  // Group by section
  const sections = useMemo(() => {
    const map = new Map();
    indicators.forEach((i) => {
      if (!map.has(i.section)) map.set(i.section, []);
      map.get(i.section).push(i);
    });
    return Array.from(map.entries());
  }, [indicators]);

  const handleChange = (id, payload) => {
    setResponses((prev) => ({ ...prev, [id]: payload }));
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* PS Selector */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <span className="small-caps text-mute mr-2" style={{ fontSize: 10 }}>Jump to PS:</span>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
          const active = n === activePS;
          const s = computePSScore(responses, n);
          return (
            <button
              key={n}
              onClick={() => setActivePS(n)}
              className="px-3 py-2 font-body"
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                background: active ? "var(--ink)" : "var(--paper)",
                color: active ? "var(--paper)" : "var(--ink)",
                border: active ? "1px solid var(--ink)" : "1px solid rgba(13,27,42,0.2)",
                transition: "all 0.15s",
              }}
            >
              PS {n}
              {s.answered > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    color: active ? "var(--gold-soft)" : "var(--gold)",
                  }}
                >
                  {s.avg.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-paper border border-rule ink-shadow">
        {/* PS Header */}
        <div className="bg-ink text-paper p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="small-caps" style={{ fontSize: 10, color: "var(--gold-soft)" }}>
                Performance Standard {activePS}
              </div>
              <h2 className="font-display mt-1" style={{ fontSize: 26, fontWeight: 400, color: "var(--paper)", letterSpacing: "-0.01em", maxWidth: 720, lineHeight: 1.15 }}>
                {meta.title}
              </h2>
            </div>
            <div className="text-right">
              <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>Section Maturity</div>
              <div className="font-display" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, color: "var(--paper)" }}>
                {psScore.avg.toFixed(2)}
              </div>
              <div className="font-display italic" style={{ fontSize: 12, color: "var(--gold-soft)" }}>
                {getMaturityLabel(psScore.avg).label}
              </div>
              <div className="small-caps mt-2" style={{ fontSize: 9, color: "var(--mute-2)" }}>
                {psScore.answered + psScore.naCount}/{psScore.total} answered
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Legend */}
        <div className="px-6 py-3 hairline" style={{ fontSize: 10, background: "rgba(184,145,81,0.05)" }}>
          <div className="small-caps text-mute" style={{ fontSize: 9, marginBottom: 4 }}>Scoring Guide</div>
          <div className="flex gap-6 flex-wrap text-mute font-body" style={{ fontSize: 10 }}>
            {SCORE_LEVELS.map((lvl) => (
              <span key={lvl.value}>
                <strong className="text-ink">{lvl.value}</strong> {lvl.label} — {lvl.desc}
              </span>
            ))}
          </div>
        </div>

        {/* Indicators by Section */}
        {sections.map(([sectionName, items]) => (
          <div key={sectionName}>
            <div className="px-5 py-3" style={{ background: "var(--parchment)", borderTop: "1px solid rgba(13,27,42,0.08)" }}>
              <div className="small-caps text-ink font-body" style={{ fontSize: 11, fontWeight: 600 }}>
                {sectionName}
              </div>
            </div>
            {items.map((ind) => (
              <IndicatorRow
                key={ind.id}
                indicator={ind}
                response={responses[ind.id]}
                onChange={handleChange}
              />
            ))}
          </div>
        ))}

        {/* Nav controls */}
        <div className="p-6 hairline-t flex items-center justify-between">
          <button
            onClick={() => setActivePS(Math.max(1, activePS - 1))}
            disabled={activePS === 1}
            className="btn-ghost"
            style={{ opacity: activePS === 1 ? 0.3 : 1 }}
          >
            ← Previous PS
          </button>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>
            PS {activePS} of 8
          </div>
          <button
            onClick={() => setActivePS(Math.min(8, activePS + 1))}
            disabled={activePS === 8}
            className="btn-primary"
            style={{ opacity: activePS === 8 ? 0.3 : 1 }}
          >
            Next PS →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCORECARDS PAGE — Per-PS detailed scorecards
   ============================================================ */

// Helper: build section-level aggregation for a single PS
const buildSectionStats = (responses, psNumber) => {
  const psInds = INDICATORS.filter((i) => i.ps === psNumber);
  const sectionMap = new Map();
  psInds.forEach((ind) => {
    if (!sectionMap.has(ind.section)) {
      sectionMap.set(ind.section, { indicators: [], scores: [], gaps: 0, strengths: 0, na: 0 });
    }
    const bucket = sectionMap.get(ind.section);
    bucket.indicators.push(ind);
    const r = responses[ind.id];
    if (r?.score === "NA") bucket.na += 1;
    else if (typeof r?.score === "number") {
      bucket.scores.push(r.score);
      if (r.score <= 1) bucket.gaps += 1;
      if (r.score === 4) bucket.strengths += 1;
    }
  });
  return Array.from(sectionMap.entries()).map(([name, b]) => ({
    name,
    indicators: b.indicators,
    total: b.indicators.length,
    answered: b.scores.length,
    naCount: b.na,
    avg: b.scores.length > 0 ? b.scores.reduce((a, s) => a + s, 0) / b.scores.length : 0,
    gaps: b.gaps,
    strengths: b.strengths,
  }));
};

// Helper: score distribution histogram for a single PS
const buildDistribution = (responses, psNumber) => {
  const psInds = INDICATORS.filter((i) => i.ps === psNumber);
  const dist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, NA: 0, unanswered: 0 };
  psInds.forEach((ind) => {
    const r = responses[ind.id];
    if (!r || r.score === undefined || r.score === null) dist.unanswered += 1;
    else if (r.score === "NA") dist.NA += 1;
    else dist[r.score] += 1;
  });
  return dist;
};

// Circular gauge component
function MaturityGauge({ value, size = 140, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / 4));
  const offset = circumference * (1 - pct);
  const color =
    value >= 3.5 ? "var(--ink)" :
    value >= 2.5 ? "var(--sage)" :
    value >= 1.5 ? "var(--amber)" :
    value > 0 ? "var(--crimson)" : "var(--mute-2)";

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(13,27,42,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Tick marks at 1, 2, 3 */}
        {[1, 2, 3].map((t) => {
          const angle = (t / 4) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.cos(rad);
          const y1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.sin(rad);
          const x2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.cos(rad);
          const y2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.sin(rad);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--mute-2)" strokeWidth={1} />;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="font-display" style={{ fontSize: size * 0.3, fontWeight: 300, color: "var(--ink)", lineHeight: 1 }}>
          {value.toFixed(1)}
        </div>
        <div className="small-caps text-mute-2" style={{ fontSize: size * 0.08, marginTop: 2 }}>
          / 4.00
        </div>
      </div>
    </div>
  );
}

// Individual PS Scorecard (full detailed view)
function PSScoreCard({ psNumber, responses, onNavigateAssessment, isPrintable = false }) {
  const meta = PS_META[psNumber];
  const score = computePSScore(responses, psNumber);
  const mat = getMaturityLabel(score.avg);
  const sections = buildSectionStats(responses, psNumber);
  const dist = buildDistribution(responses, psNumber);

  const psIndicators = INDICATORS.filter((i) => i.ps === psNumber);
  const highGaps = psIndicators.filter((i) => {
    const r = responses[i.id];
    return typeof r?.score === "number" && r.score <= 1;
  });
  const mediumGaps = psIndicators.filter((i) => {
    const r = responses[i.id];
    return typeof r?.score === "number" && r.score === 2;
  });
  const strengths = psIndicators.filter((i) => responses[i.id]?.score === 4);

  const coverage = score.total > 0 ? ((score.answered + score.naCount) / score.total) * 100 : 0;

  return (
    <div className="bg-paper border-2 border-ink ink-shadow print-break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
      {/* Header Bar */}
      <div className="bg-ink text-paper px-6 py-5 flex items-start justify-between">
        <div>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--gold-soft)", letterSpacing: "0.2em" }}>
            Performance Standard {psNumber} · Scorecard
          </div>
          <div className="font-display mt-1" style={{ fontSize: 22, fontWeight: 500, color: "var(--paper)", lineHeight: 1.15, maxWidth: 520 }}>
            {meta.title}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="serial-number" style={{ color: "var(--mute-2)", fontSize: 10 }}>
            PS-{String(psNumber).padStart(2, "0")}
          </div>
          <div className="font-display italic mt-1" style={{ fontSize: 12, color: "var(--gold-soft)" }}>
            {mat.label}
          </div>
        </div>
      </div>

      {/* Main body: gauge + KPIs */}
      <div className="px-6 py-5 flex flex-col md:flex-row items-center items-center gap-6 hairline">
        <MaturityGauge value={score.avg} size={140} />
        <div className="flex-1 grid grid-cols-4 gap-4">
          <div>
            <div className="small-caps text-mute" style={{ fontSize: 9 }}>Coverage</div>
            <div className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>
              {coverage.toFixed(0)}<span className="text-mute-2" style={{ fontSize: 12 }}>%</span>
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>
              {score.answered + score.naCount}/{score.total} items
            </div>
          </div>
          <div>
            <div className="small-caps" style={{ fontSize: 9, color: "var(--crimson)" }}>High Gaps</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: highGaps.length > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
              {highGaps.length}
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>score 0–1</div>
          </div>
          <div>
            <div className="small-caps" style={{ fontSize: 9, color: "var(--amber)" }}>Medium Gaps</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: mediumGaps.length > 0 ? "var(--amber)" : "var(--mute-2)" }}>
              {mediumGaps.length}
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>score 2</div>
          </div>
          <div>
            <div className="small-caps text-sage" style={{ fontSize: 9 }}>Strengths</div>
            <div className="font-display text-sage" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.1 }}>
              {strengths.length}
            </div>
            <div className="text-mute" style={{ fontSize: 10 }}>score 4</div>
          </div>
        </div>
      </div>

      {/* Score Distribution Bar */}
      <div className="px-6 py-4 hairline" style={{ background: "rgba(184,145,81,0.03)" }}>
        <div className="small-caps text-mute mb-2" style={{ fontSize: 9 }}>Score Distribution</div>
        <div className="flex items-center gap-1" style={{ height: 24 }}>
          {[
            { key: 0, color: "#E8B4A8", label: "0" },
            { key: 1, color: "#E89E8E", label: "1" },
            { key: 2, color: "#E8C878", label: "2" },
            { key: 3, color: "#B5C88A", label: "3" },
            { key: 4, color: "var(--ink)", label: "4" },
            { key: "NA", color: "#D8D2C4", label: "N/A" },
            { key: "unanswered", color: "#F0EBDF", label: "—" },
          ].map((bucket) => {
            const count = dist[bucket.key];
            const pct = score.total > 0 ? (count / score.total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={bucket.key}
                title={`Score ${bucket.label}: ${count} indicator(s)`}
                style={{
                  flex: pct,
                  height: "100%",
                  background: bucket.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 600,
                  color: bucket.key === 4 ? "var(--paper)" : "var(--ink)",
                  fontFamily: "Inter",
                  minWidth: count > 0 ? 20 : 0,
                }}
              >
                {count}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap" style={{ fontSize: 9 }}>
          {[
            { color: "#E8B4A8", label: "0 · Not Started" },
            { color: "#E89E8E", label: "1 · Initial" },
            { color: "#E8C878", label: "2 · Developing" },
            { color: "#B5C88A", label: "3 · Established" },
            { color: "var(--ink)", label: "4 · Advanced" },
            { color: "#D8D2C4", label: "N/A" },
            { color: "#F0EBDF", label: "Unanswered" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1 text-mute">
              <span style={{ display: "inline-block", width: 10, height: 10, background: item.color, border: "1px solid rgba(13,27,42,0.15)" }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section breakdown */}
      <div className="px-6 py-5 hairline">
        <div className="small-caps text-mute mb-3" style={{ fontSize: 9 }}>Section-Level Breakdown</div>
        <table className="w-full" style={{ fontSize: 11 }}>
          <thead>
            <tr className="hairline">
              <th className="text-left py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Section</th>
              <th className="text-center py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600, width: 60 }}>Score</th>
              <th className="text-center py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600, width: 60 }}>Items</th>
              <th className="text-center py-1 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600, width: 50 }}>Gaps</th>
              <th className="text-left py-1 small-caps text-mute pl-3" style={{ fontSize: 9, fontWeight: 600, width: 140 }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => {
              const secMat = getMaturityLabel(s.avg);
              const secPct = s.total > 0 ? ((s.answered + s.naCount) / s.total) * 100 : 0;
              return (
                <tr key={s.name} style={{ borderBottom: "1px solid rgba(13,27,42,0.06)" }}>
                  <td className="py-2 text-ink">{s.name}</td>
                  <td className="text-center py-2">
                    {s.answered > 0 ? (
                      <span className={`font-display ${secMat.cls}`} style={{ fontSize: 14, fontWeight: 500 }}>
                        {s.avg.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-mute-2" style={{ fontSize: 11 }}>—</span>
                    )}
                  </td>
                  <td className="text-center py-2 text-mute" style={{ fontSize: 10 }}>
                    {s.answered + s.naCount}/{s.total}
                  </td>
                  <td className="text-center py-2" style={{ color: s.gaps > 0 ? "var(--crimson)" : "var(--mute-2)", fontWeight: 500 }}>
                    {s.gaps > 0 ? s.gaps : "—"}
                  </td>
                  <td className="py-2 pl-3">
                    <div style={{ height: 4, background: "rgba(13,27,42,0.08)", borderRadius: 2 }}>
                      <div
                        style={{
                          width: `${secPct}%`,
                          height: "100%",
                          background: secMat.color,
                          borderRadius: 2,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top findings */}
      {(highGaps.length > 0 || strengths.length > 0) && (
        <div className="px-6 py-5 hairline grid grid-cols-2 gap-6">
          {/* High-priority gaps */}
          <div>
            <div className="small-caps mb-2" style={{ fontSize: 9, color: highGaps.length > 0 ? "var(--crimson)" : "var(--mute)" }}>
              Top High-Priority Gaps
            </div>
            {highGaps.length === 0 ? (
              <div className="text-sage italic font-body" style={{ fontSize: 11 }}>
                No high-priority gaps identified.
              </div>
            ) : (
              <ul className="space-y-2">
                {highGaps.slice(0, 5).map((ind) => {
                  const r = responses[ind.id];
                  return (
                    <li key={ind.id} className="flex gap-2" style={{ fontSize: 11, lineHeight: 1.45 }}>
                      <span
                        className="font-display flex-shrink-0"
                        style={{ fontSize: 13, fontWeight: 500, color: "var(--crimson)", minWidth: 18 }}
                      >
                        {r.score}
                      </span>
                      <div className="flex-1">
                        <span className="serial-number" style={{ fontSize: 9 }}>{ind.id}</span>{" "}
                        <span className="text-gold" style={{ fontSize: 9 }}>{ind.ref}</span>
                        <div className="text-ink">
                          {ind.text.substring(0, 130)}{ind.text.length > 130 ? "…" : ""}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {highGaps.length > 5 && (
                  <li className="text-mute italic" style={{ fontSize: 10 }}>
                    + {highGaps.length - 5} more high-priority gap(s)
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Strengths */}
          <div>
            <div className="small-caps text-sage mb-2" style={{ fontSize: 9 }}>
              Areas of Strength
            </div>
            {strengths.length === 0 ? (
              <div className="text-mute italic font-body" style={{ fontSize: 11 }}>
                No Advanced-level (score 4) indicators identified yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {strengths.slice(0, 5).map((ind) => (
                  <li key={ind.id} className="flex gap-2" style={{ fontSize: 11, lineHeight: 1.45 }}>
                    <span
                      className="font-display flex-shrink-0"
                      style={{ fontSize: 13, fontWeight: 500, color: "var(--sage)", minWidth: 18 }}
                    >
                      4
                    </span>
                    <div className="flex-1">
                      <span className="serial-number" style={{ fontSize: 9 }}>{ind.id}</span>{" "}
                      <span className="text-gold" style={{ fontSize: 9 }}>{ind.ref}</span>
                      <div className="text-ink">
                        {ind.text.substring(0, 130)}{ind.text.length > 130 ? "…" : ""}
                      </div>
                    </div>
                  </li>
                ))}
                {strengths.length > 5 && (
                  <li className="text-mute italic" style={{ fontSize: 10 }}>
                    + {strengths.length - 5} more strength(s)
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Verdict & Action */}
      <div className="px-6 py-5" style={{ background: "var(--parchment)" }}>
        <div className="small-caps text-gold mb-2" style={{ fontSize: 9 }}>Verdict</div>
        <p className="font-display italic text-ink" style={{ fontSize: 13, lineHeight: 1.55 }}>
          {narrativeFor(score).verdict}.
        </p>
        <p className="font-body text-mute mt-2" style={{ fontSize: 11, lineHeight: 1.6 }}>
          {narrativeFor(score).narrative}
        </p>
        {!isPrintable && onNavigateAssessment && (
          <button
            onClick={() => onNavigateAssessment(psNumber)}
            className="btn-ghost mt-3 no-print"
            style={{ fontSize: 10, padding: "6px 12px" }}
          >
            Open Assessment for PS {psNumber} →
          </button>
        )}
      </div>
    </div>
  );
}

function ScorecardsPage({ responses, setPage, setActivePS }) {
  const [viewMode, setViewMode] = useState("grid"); // grid | detail
  const [selectedPS, setSelectedPS] = useState(1);
  const overall = computeOverall(responses);

  const handleOpenAssessment = (psNumber) => {
    setActivePS(psNumber);
    setPage("assessment");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap-reverse items-start justify-between gap-4 no-print">
        <div>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ IV</div>
          <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
            Performance Standard Scorecards
          </h2>
          <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 640 }}>
            Individual scorecard for each of the eight Performance Standards — maturity gauge, section
            breakdown, score distribution, priority findings, and verdict. Printable page-per-PS.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="small-caps text-mute mr-2" style={{ fontSize: 10 }}>View:</div>
          <button
            onClick={() => setViewMode("grid")}
            className="px-3 py-2 font-body"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: viewMode === "grid" ? "var(--ink)" : "var(--paper)",
              color: viewMode === "grid" ? "var(--paper)" : "var(--ink)",
              border: "1px solid var(--ink)",
            }}
          >
            All Scorecards
          </button>
          <button
            onClick={() => setViewMode("detail")}
            className="px-3 py-2 font-body"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: viewMode === "detail" ? "var(--ink)" : "var(--paper)",
              color: viewMode === "detail" ? "var(--paper)" : "var(--ink)",
              border: "1px solid var(--ink)",
            }}
          >
            Detail View
          </button>
          <button onClick={() => window.print()} className="btn-primary ml-2">
            Print
          </button>
        </div>
      </div>

      {/* Portfolio Summary Strip */}
      <div className="bg-ink text-paper px-6 py-4 mb-6 gap-6 flex flex-col md:flex-row items-center justify-between no-print">
        <div>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--gold-soft)" }}>Portfolio Summary</div>
          <div className="font-display mt-1" style={{ fontSize: 14, color: "var(--paper)" }}>
            Overall Maturity: <strong style={{ fontSize: 18 }}>{overall.avg.toFixed(2)}</strong> / 4.00{" "}
            <span className="italic" style={{ color: "var(--gold-soft)", fontSize: 13 }}>
              ({getMaturityLabel(overall.avg).label})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-6" style={{ fontSize: 11 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const s = computePSScore(responses, n);
            return (
              <button
                key={n}
                onClick={() => {
                  setSelectedPS(n);
                  setViewMode("detail");
                }}
                className="text-center hover:opacity-80"
                style={{ minWidth: 36 }}
              >
                <div className="small-caps" style={{ fontSize: 9, color: "var(--gold-soft)" }}>PS {n}</div>
                <div className="font-display" style={{ fontSize: 16, color: "var(--paper)" }}>
                  {s.avg.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === "detail" ? (
        <div>
          {/* PS Selector for Detail View */}
          <div className="mb-5 flex items-center gap-2 flex-wrap no-print">
            <span className="small-caps text-mute mr-2" style={{ fontSize: 10 }}>Select PS:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
              const active = n === selectedPS;
              const s = computePSScore(responses, n);
              const mat = getMaturityLabel(s.avg);
              return (
                <button
                  key={n}
                  onClick={() => setSelectedPS(n)}
                  className="px-3 py-2 font-body flex items-baseline gap-2"
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    background: active ? "var(--ink)" : "var(--paper)",
                    color: active ? "var(--paper)" : "var(--ink)",
                    border: active ? "1px solid var(--ink)" : "1px solid rgba(13,27,42,0.2)",
                  }}
                >
                  <span>PS {n}</span>
                  <span style={{ fontSize: 9, color: active ? "var(--gold-soft)" : mat.color }}>
                    {s.avg > 0 ? s.avg.toFixed(1) : "—"}
                  </span>
                </button>
              );
            })}
          </div>

          <PSScoreCard
            psNumber={selectedPS}
            responses={responses}
            onNavigateAssessment={handleOpenAssessment}
            isPrintable={false}
          />
        </div>
      ) : (
        /* Grid View: All 8 Scorecards */
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="print-page">
              <PSScoreCard
                psNumber={n}
                responses={responses}
                onNavigateAssessment={handleOpenAssessment}
                isPrintable={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ESAP (Environmental & Social Action Plan) PAGE
   ============================================================ */

// Generate a default action item text from an indicator
const generateActionText = (indicator) => {
  const t = indicator.text;
  // Simple heuristic — try to transform descriptive statement into imperative action
  if (/^(Policy|Procedure|Plan|System|Mechanism|Framework|Process)/i.test(t)) {
    return `Establish and formalize: ${t}`;
  }
  if (/is documented|documented and|in place|established/i.test(t)) {
    return `Develop and implement: ${t.replace(/\.$/, "")}`;
  }
  if (/^(Training|Capacity)/i.test(t)) {
    return `Conduct and document: ${t.replace(/\.$/, "")}`;
  }
  if (/assessment|monitoring|review/i.test(t)) {
    return `Implement and operationalize: ${t.replace(/\.$/, "")}`;
  }
  return `Address gap: ${t}`;
};

// Generate default completion indicators (evidence of closure)
const generateCompletionIndicators = (indicator) => {
  const t = indicator.text.toLowerCase();
  if (t.includes("policy")) return "Signed policy document; Board/senior management approval memo; internal communication record";
  if (t.includes("procedure")) return "Documented procedure; training attendance record; implementation log (min. 3 months)";
  if (t.includes("training")) return "Training curriculum; attendance records; pre/post assessment results";
  if (t.includes("plan")) return "Approved plan document; implementation schedule; quarterly progress report";
  if (t.includes("grievance")) return "Grievance mechanism SOP; case log; stakeholder awareness materials; response time records";
  if (t.includes("monitoring") || t.includes("monitor")) return "Monitoring protocol; baseline data; periodic monitoring reports (min. 2 cycles)";
  if (t.includes("consultation") || t.includes("engagement")) return "Engagement plan; meeting minutes; attendance sheets; feedback register";
  if (t.includes("assessment")) return "Assessment report; methodology description; expert qualifications; management response";
  if (t.includes("compensation")) return "Entitlement matrix; compensation records; receipt acknowledgments; third-party verification";
  if (t.includes("register") || t.includes("log")) return "Functional register (accessible & maintained); sample entries; quarterly review record";
  return "Documented evidence of implementation; internal verification memo; photo/site evidence where applicable";
};

// Recommend target timeline based on priority
const recommendTimeline = (priority) => {
  if (priority === "High") return "3 months";
  if (priority === "Medium") return "6 months";
  return "12 months";
};

// Calculate target date from now
const calcTargetDate = (monthsAhead) => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toISOString().slice(0, 10);
};

// Generate ESAP item from a gap indicator + response
const buildESAPItemFromGap = (indicator, response) => {
  let priority = "Low";
  if (response && typeof response.score === "number") {
    if (response.score <= 1) priority = "High";
    else if (response.score === 2) priority = "Medium";
    else if (response.score === 3) priority = "Low";
  }
  const monthsAhead = priority === "High" ? 3 : priority === "Medium" ? 6 : 12;
  return {
    id: `esap-${indicator.id}-${Date.now()}`,
    indicatorId: indicator.id,
    component: `PS ${indicator.ps} · ${indicator.section} (${indicator.ref})`,
    action: generateActionText(indicator),
    priority,
    targetDate: calcTargetDate(monthsAhead),
    completionIndicators: generateCompletionIndicators(indicator),
    pic: "",
    resources: "",
    status: "Not Started",
    progressPct: 0,
    lastUpdate: "",
    notes: response?.notes ? `From assessment: ${response.notes}` : "",
  };
};

// Priority color mapping
const priorityStyles = {
  High:   { bg: "#F4DCCD", fg: "var(--crimson)", border: "var(--crimson)" },
  Medium: { bg: "#F5E6CB", fg: "var(--amber)",   border: "var(--amber)" },
  Low:    { bg: "#E6EBDB", fg: "var(--sage)",    border: "var(--sage)" },
};

// Status color mapping
const statusStyles = {
  "Not Started":  { bg: "#E8E2D3", fg: "var(--mute)",    border: "var(--mute-2)" },
  "In Progress":  { bg: "#F5E6CB", fg: "var(--amber)",   border: "var(--amber)" },
  "Completed":    { bg: "#E6EBDB", fg: "var(--sage)",    border: "var(--sage)" },
  "Overdue":      { bg: "#F4DCCD", fg: "var(--crimson)", border: "var(--crimson)" },
  "Deferred":     { bg: "#E5E0D3", fg: "var(--mute)",    border: "var(--mute-2)" },
};

// Determine if item is overdue
const isOverdue = (item) => {
  if (!item.targetDate || item.status === "Completed" || item.status === "Deferred") return false;
  return new Date(item.targetDate) < new Date();
};

function ESAPPage({ esapItems, setEsapItems, responses, meta }) {
  const [filterPS, setFilterPS] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);

  // Filtered items
  const filtered = useMemo(() => {
    return esapItems.filter((item) => {
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (filterStatus !== "all") {
        if (filterStatus === "Overdue") {
          if (!isOverdue(item)) return false;
        } else if (item.status !== filterStatus) return false;
      }
      if (filterPS !== "all") {
        const ps = item.indicatorId ? INDICATORS.find(i => i.id === item.indicatorId)?.ps : null;
        if (String(ps) !== filterPS) return false;
      }
      return true;
    }).sort((a, b) => {
      // Sort by priority then target date
      const order = { High: 0, Medium: 1, Low: 2 };
      const p = (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
      if (p !== 0) return p;
      return (a.targetDate || "9999").localeCompare(b.targetDate || "9999");
    });
  }, [esapItems, filterPS, filterPriority, filterStatus]);

  // KPIs
  const kpis = useMemo(() => {
    const total = esapItems.length;
    const byPriority = { High: 0, Medium: 0, Low: 0 };
    const byStatus = { "Not Started": 0, "In Progress": 0, "Completed": 0, "Deferred": 0 };
    let overdue = 0;
    let totalProgress = 0;
    esapItems.forEach((i) => {
      byPriority[i.priority] = (byPriority[i.priority] || 0) + 1;
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      if (isOverdue(i)) overdue += 1;
      totalProgress += (i.progressPct || 0);
    });
    const completionRate = total > 0 ? (byStatus.Completed / total) * 100 : 0;
    const avgProgress = total > 0 ? totalProgress / total : 0;
    return { total, byPriority, byStatus, overdue, completionRate, avgProgress };
  }, [esapItems]);

  // Generate ESAP from current gaps
  const generateFromGaps = () => {
    const existingIds = new Set(esapItems.filter(e => e.indicatorId).map(e => e.indicatorId));
    const newItems = [];
    INDICATORS.forEach((ind) => {
      const resp = responses[ind.id];
      if (!resp || resp.score === "NA" || resp.score === undefined) return;
      if (typeof resp.score !== "number") return;
      if (resp.score >= 4) return; // Advanced — no action needed
      if (existingIds.has(ind.id)) return; // Already in ESAP
      newItems.push(buildESAPItemFromGap(ind, resp));
    });
    if (newItems.length === 0) {
      alert("No new gaps found. ESAP already covers all identified gaps.");
      return;
    }
    setEsapItems([...esapItems, ...newItems]);
    alert(`Added ${newItems.length} new action item(s) from current gaps.`);
  };

  const addManualItem = () => {
    const newItem = {
      id: `esap-manual-${Date.now()}`,
      indicatorId: null,
      component: "",
      action: "",
      priority: "Medium",
      targetDate: calcTargetDate(6),
      completionIndicators: "",
      pic: "",
      resources: "",
      status: "Not Started",
      progressPct: 0,
      lastUpdate: "",
      notes: "Manually added item",
    };
    setEsapItems([...esapItems, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id, updates) => {
    setEsapItems(esapItems.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, ...updates };
      // Auto-timestamp when status or progress changes
      if (updates.status !== undefined || updates.progressPct !== undefined) {
        updated.lastUpdate = new Date().toISOString().slice(0, 10);
      }
      // Auto-set progress based on status
      if (updates.status === "Completed") updated.progressPct = 100;
      else if (updates.status === "Not Started") updated.progressPct = 0;
      return updated;
    }));
  };

  const removeItem = (id) => {
    if (window.confirm("Remove this action item from the ESAP?")) {
      setEsapItems(esapItems.filter(i => i.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const clearAllESAP = () => {
    if (window.confirm("Clear all ESAP items? This cannot be undone.")) {
      setEsapItems([]);
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const header = ["Item", "ESAP Component", "Action Item", "Priority", "Target Completion",
                    "Indicators of Completion (Documentation)", "Accountability (PIC)", "Resources",
                    "Status", "Progress %", "Last Update", "Notes"];
    const esc = (s) => `"${String(s || "").replace(/"/g, '""')}"`;
    const rows = filtered.map((item, idx) => [
      idx + 1,
      item.component,
      item.action,
      item.priority,
      item.targetDate,
      item.completionIndicators,
      item.pic,
      item.resources,
      item.status,
      item.progressPct,
      item.lastUpdate,
      item.notes,
    ].map(esc).join(","));
    const csv = [header.map(esc).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const projectSlug = (meta?.projectName || "ESAP").replace(/[^a-z0-9]/gi, "_").substring(0, 40);
    a.href = url;
    a.download = `${projectSlug}_ESAP_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between no-print">
        <div>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ V</div>
          <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
            Environmental & Social Action Plan (ESAP)
          </h2>
          <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 780 }}>
            Structured remediation plan mapping each identified gap to an action, target date, responsible
            person, and completion evidence. Monitored by lender compliance teams throughout the
            investment cycle.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={generateFromGaps} className="btn-primary">
            ⟳ Generate from Gaps
          </button>
          <button onClick={addManualItem} className="btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }}>
            + Manual Item
          </button>
          <button onClick={exportCSV} className="btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }}>
            ↓ Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }}>
            Print
          </button>
          {esapItems.length > 0 && (
            <button
              onClick={clearAllESAP}
              className="btn-ghost"
              style={{ fontSize: 10, padding: "8px 12px", borderColor: "var(--crimson)", color: "var(--crimson)" }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Print-only header */}
      <div className="print-only mb-6" style={{ display: "none" }}>
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>
          {meta?.projectName || "Project"} · Environmental & Social Action Plan
        </div>
        <h2 className="font-display text-ink" style={{ fontSize: 24, fontWeight: 400 }}>
          ESAP · {meta?.clientName || "—"}
        </h2>
        <div className="font-body text-mute" style={{ fontSize: 10 }}>
          Generated: {new Date().toISOString().slice(0, 10)} · Total items: {filtered.length}
        </div>
      </div>

      {/* Empty state */}
      {esapItems.length === 0 && (
        <div className="bg-paper border border-ink ink-shadow p-12 text-center">
          <div className="font-display text-ink italic" style={{ fontSize: 22, marginBottom: 12 }}>
            No ESAP items yet
          </div>
          <p className="font-body text-mute mb-6" style={{ fontSize: 13, maxWidth: 540, margin: "0 auto 20px" }}>
            The Environmental & Social Action Plan is generated automatically from your
            gap analysis. Each scored indicator below maturity level 4 becomes a candidate
            action item. You can also add manual items not tied to specific indicators.
          </p>
          <button onClick={generateFromGaps} className="btn-primary">
            Generate ESAP from Current Gaps
          </button>
        </div>
      )}

      {esapItems.length > 0 && (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-3 mb-5 no-print">
            <div className="bg-paper border border-ink p-3" style={{ borderWidth: 2 }}>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Total Items</div>
              <div className="font-display text-ink" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>
                {kpis.total}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>action items</div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: "var(--crimson)", borderWidth: 1 }}>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--crimson)" }}>High</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, color: "var(--crimson)" }}>
                {kpis.byPriority.High || 0}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>high priority</div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: "var(--amber)" }}>
              <div className="small-caps" style={{ fontSize: 9, color: "var(--amber)" }}>Medium</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, color: "var(--amber)" }}>
                {kpis.byPriority.Medium || 0}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>medium priority</div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: "var(--sage)" }}>
              <div className="small-caps text-sage" style={{ fontSize: 9 }}>Completed</div>
              <div className="font-display text-sage" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>
                {kpis.byStatus.Completed || 0}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>
                {kpis.completionRate.toFixed(0)}% completion rate
              </div>
            </div>
            <div className="bg-paper border p-3" style={{ borderColor: kpis.overdue > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
              <div className="small-caps" style={{ fontSize: 9, color: kpis.overdue > 0 ? "var(--crimson)" : "var(--mute)" }}>Overdue</div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1, color: kpis.overdue > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                {kpis.overdue}
              </div>
              <div className="text-mute" style={{ fontSize: 9 }}>past target date</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5 no-print">
            <div className="flex items-center justify-between mb-1">
              <span className="small-caps text-mute" style={{ fontSize: 9 }}>Overall ESAP Progress</span>
              <span className="font-display text-ink italic" style={{ fontSize: 11 }}>
                {kpis.avgProgress.toFixed(0)}% average across all items
              </span>
            </div>
            <div style={{ height: 8, background: "rgba(13,27,42,0.08)" }}>
              <div style={{
                width: `${kpis.avgProgress}%`,
                height: "100%",
                background: "var(--ink)",
                transition: "width 0.3s",
              }} />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-paper border border-ink p-3 mb-4 flex gap-4 items-center flex-wrap no-print" style={{ borderWidth: 0.5 }}>
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Filters:</span>

            <div className="flex items-center gap-1">
              <span className="text-mute" style={{ fontSize: 10 }}>PS:</span>
              <select
                value={filterPS}
                onChange={(e) => setFilterPS(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 11, padding: "3px 6px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid rgba(13,27,42,0.2)", cursor: "pointer"
                }}
              >
                <option value="all">All</option>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={String(n)}>PS {n}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-mute" style={{ fontSize: 10 }}>Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 11, padding: "3px 6px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid rgba(13,27,42,0.2)", cursor: "pointer"
                }}
              >
                <option value="all">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-mute" style={{ fontSize: 10 }}>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  fontFamily: "inherit", fontSize: 11, padding: "3px 6px",
                  background: "var(--paper)", color: "var(--ink)",
                  border: "1px solid rgba(13,27,42,0.2)", cursor: "pointer"
                }}
              >
                <option value="all">All</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Deferred">Deferred</option>
              </select>
            </div>

            <span className="text-mute italic ml-auto" style={{ fontSize: 10 }}>
              Showing {filtered.length} of {esapItems.length}
            </span>
          </div>

          {/* ESAP Table */}
          <div className="bg-paper border-2 border-ink ink-shadow" style={{ overflow: "auto" }}>
            <table className="w-full" style={{ fontSize: 10, borderCollapse: "collapse", minWidth: 1400 }}>
              <thead>
                <tr style={{ background: "var(--ink)", color: "var(--paper)" }}>
                  <th style={esapThStyle(40)}>#</th>
                  <th style={esapThStyle(180)}>ESAP Component</th>
                  <th style={esapThStyle(280)}>Action Item</th>
                  <th style={esapThStyle(80)}>Priority</th>
                  <th style={esapThStyle(110)}>Target</th>
                  <th style={esapThStyle(220)}>Completion Indicators</th>
                  <th style={esapThStyle(130)}>PIC</th>
                  <th style={esapThStyle(130)}>Resources</th>
                  <th style={esapThStyle(130)}>Status / Update</th>
                  <th style={esapThStyle(140)}>Notes</th>
                  <th style={{ ...esapThStyle(40), textAlign: "center" }} className="no-print">·</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const overdue = isOverdue(item);
                  const statusKey = overdue ? "Overdue" : item.status;
                  const ps = priorityStyles[item.priority] || priorityStyles.Medium;
                  const st = statusStyles[statusKey] || statusStyles["Not Started"];
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid rgba(13,27,42,0.1)",
                        background: idx % 2 === 0 ? "var(--paper)" : "rgba(246,241,231,0.5)",
                      }}
                    >
                      <td style={esapTdStyle}>
                        <span className="serial-number" style={{ fontSize: 10 }}>{idx + 1}</span>
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.component}
                            onChange={(e) => updateItem(item.id, { component: e.target.value })}
                            style={esapInputStyle}
                          />
                        ) : (
                          <span className="font-display italic text-ink" style={{ fontSize: 10 }}>{item.component}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <textarea
                            value={item.action}
                            onChange={(e) => updateItem(item.id, { action: e.target.value })}
                            rows={3}
                            style={{ ...esapInputStyle, resize: "vertical" }}
                          />
                        ) : (
                          <span style={{ fontSize: 10, lineHeight: 1.4 }}>{item.action}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <select
                            value={item.priority}
                            onChange={(e) => updateItem(item.id, { priority: e.target.value })}
                            style={esapInputStyle}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        ) : (
                          <span style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            fontSize: 9,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            background: ps.bg,
                            color: ps.fg,
                            border: `1px solid ${ps.border}`,
                          }}>
                            {item.priority}
                          </span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="date"
                            value={item.targetDate || ""}
                            onChange={(e) => updateItem(item.id, { targetDate: e.target.value })}
                            style={esapInputStyle}
                          />
                        ) : (
                          <span className="font-mono" style={{ fontSize: 10, color: overdue ? "var(--crimson)" : "var(--ink)" }}>
                            {item.targetDate || "—"}
                            {overdue && <span className="italic ml-1" style={{ fontSize: 9 }}> (overdue)</span>}
                          </span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <textarea
                            value={item.completionIndicators}
                            onChange={(e) => updateItem(item.id, { completionIndicators: e.target.value })}
                            rows={3}
                            style={{ ...esapInputStyle, resize: "vertical" }}
                          />
                        ) : (
                          <span style={{ fontSize: 9, lineHeight: 1.4, color: "var(--mute)" }}>
                            {item.completionIndicators}
                          </span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.pic}
                            onChange={(e) => updateItem(item.id, { pic: e.target.value })}
                            placeholder="Role / Name"
                            style={esapInputStyle}
                          />
                        ) : (
                          <span style={{ fontSize: 10 }}>{item.pic || <span className="italic text-mute-2">— not assigned —</span>}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.resources}
                            onChange={(e) => updateItem(item.id, { resources: e.target.value })}
                            placeholder="Budget / Team / Consultant"
                            style={esapInputStyle}
                          />
                        ) : (
                          <span style={{ fontSize: 10 }}>{item.resources || <span className="italic text-mute-2">— TBD —</span>}</span>
                        )}
                      </td>
                      <td style={esapTdStyle}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <select
                            value={item.status}
                            onChange={(e) => updateItem(item.id, { status: e.target.value })}
                            style={{
                              fontFamily: "inherit", fontSize: 9, padding: "3px 4px",
                              fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                              background: st.bg, color: st.fg,
                              border: `1px solid ${st.border}`, cursor: "pointer"
                            }}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Deferred">Deferred</option>
                          </select>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={item.progressPct || 0}
                              onChange={(e) => updateItem(item.id, { progressPct: parseInt(e.target.value) })}
                              style={{ flex: 1, height: 4 }}
                            />
                            <span className="font-mono" style={{ fontSize: 9, minWidth: 28, textAlign: "right", color: "var(--ink)" }}>
                              {item.progressPct || 0}%
                            </span>
                          </div>
                          {item.lastUpdate && (
                            <span className="italic text-mute-2" style={{ fontSize: 8 }}>
                              updated {item.lastUpdate}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={esapTdStyle}>
                        {isEditing ? (
                          <textarea
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                            rows={3}
                            placeholder="Notes, risks, dependencies…"
                            style={{ ...esapInputStyle, resize: "vertical" }}
                          />
                        ) : (
                          <span style={{ fontSize: 9, lineHeight: 1.4, color: "var(--mute)" }}>
                            {item.notes || <span className="italic text-mute-2">—</span>}
                          </span>
                        )}
                      </td>
                      <td style={{ ...esapTdStyle, textAlign: "center" }} className="no-print">
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            style={{
                              fontSize: 9, padding: "2px 4px",
                              background: isEditing ? "var(--ink)" : "transparent",
                              color: isEditing ? "var(--paper)" : "var(--ink)",
                              border: "1px solid var(--ink)",
                              cursor: "pointer",
                            }}
                            title={isEditing ? "Save" : "Edit"}
                          >
                            {isEditing ? "✓" : "✎"}
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              fontSize: 9, padding: "2px 4px",
                              background: "transparent",
                              color: "var(--crimson)",
                              border: "1px solid var(--crimson)",
                              cursor: "pointer",
                            }}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <p className="italic text-mute" style={{ fontSize: 12 }}>
                  No items match the current filters.
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-4 text-mute italic" style={{ fontSize: 10 }}>
            <strong>Note:</strong> Target dates are auto-suggested (High = 3 months, Medium = 6 months, Low = 12 months).
            Adjust based on project context and lender-approved timeline. Status progress auto-timestamps
            on change. Export to CSV for lender submission or import into project tracking tools.
          </div>
        </>
      )}
    </div>
  );
}

// Shared table cell styles
const esapThStyle = (width) => ({
  padding: "10px 8px",
  textAlign: "left",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--gold-soft)",
  width: `${width}px`,
  verticalAlign: "top",
  borderBottom: "2px solid var(--gold)",
});

const esapTdStyle = {
  padding: "10px 8px",
  verticalAlign: "top",
  lineHeight: 1.4,
};

const esapInputStyle = {
  fontFamily: "inherit",
  fontSize: 10,
  padding: "4px 6px",
  width: "100%",
  background: "var(--paper)",
  color: "var(--ink)",
  border: "1px solid var(--ink)",
  outline: "none",
};

/* ============================================================
   GAP ANALYSIS PAGE
   ============================================================ */

function GapAnalysisPage({ responses, setPage, setActivePS }) {
  const gaps = useMemo(() => {
    return INDICATORS
      .map((ind) => ({ ind, resp: responses[ind.id], priority: priorityGap(responses[ind.id]) }))
      .filter((x) => x.priority !== null)
      .sort((a, b) => {
        const order = { High: 0, Medium: 1 };
        return order[a.priority] - order[b.priority];
      });
  }, [responses]);

  const highCount = gaps.filter((g) => g.priority === "High").length;
  const medCount = gaps.filter((g) => g.priority === "Medium").length;

  const byPS = useMemo(() => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
      const psGaps = gaps.filter((g) => g.ind.ps === n);
      return {
        ps: `PS ${n}`,
        name: PS_META[n].abbr,
        high: psGaps.filter((g) => g.priority === "High").length,
        medium: psGaps.filter((g) => g.priority === "Medium").length,
        total: psGaps.length,
      };
    });
    return data;
  }, [gaps]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ III</div>
        <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Gap Analysis
        </h2>
        <p className="font-body text-mute italic mt-1" style={{ fontSize: 13, maxWidth: 720 }}>
          Indicators scored below the "Established" threshold (score ≤ 2), ranked by priority.
          High-priority gaps (score 0–1) should be addressed before project financing or
          IFC/Equator Principles-aligned appraisal.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-paper border border-rule p-5 ink-shadow">
          <div className="small-caps text-crimson" style={{ fontSize: 10 }}>High Priority</div>
          <div className="font-display text-crimson mt-1" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1 }}>
            {highCount}
          </div>
          <div className="font-body text-mute italic mt-1" style={{ fontSize: 11 }}>
            Score 0–1 · immediate action required
          </div>
        </div>
        <div className="bg-paper border border-rule p-5 ink-shadow">
          <div className="small-caps text-amber" style={{ fontSize: 10 }}>Medium Priority</div>
          <div className="font-display text-amber mt-1" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1 }}>
            {medCount}
          </div>
          <div className="font-body text-mute italic mt-1" style={{ fontSize: 11 }}>
            Score 2 · improvement plan needed
          </div>
        </div>
        <div className="bg-paper border border-rule p-5 ink-shadow">
          <div className="small-caps text-sage" style={{ fontSize: 10 }}>Met / Exceeded</div>
          <div className="font-display text-sage mt-1" style={{ fontSize: 42, fontWeight: 300, lineHeight: 1 }}>
            {Object.values(responses).filter(r => typeof r?.score === "number" && r.score >= 3).length}
          </div>
          <div className="font-body text-mute italic mt-1" style={{ fontSize: 11 }}>
            Score 3–4 · sustain & monitor
          </div>
        </div>
      </div>

      <div className="bg-paper border border-rule ink-shadow mb-8">
        <div className="px-6 py-4 hairline" style={{ background: "rgba(184,145,81,0.05)" }}>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>Fig. II</div>
          <h3 className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
            Gaps by Performance Standard
          </h3>
        </div>
        <div style={{ height: 260, padding: 16 }}>
          <ResponsiveContainer>
            <BarChart data={byPS} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" tick={{ fill: "var(--ink)", fontSize: 11, fontFamily: "Inter" }} />
              <YAxis tick={{ fill: "var(--mute)", fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--paper)",
                  border: "1px solid var(--ink)",
                  fontFamily: "Inter",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="high" stackId="a" fill="var(--crimson)" name="High" />
              <Bar dataKey="medium" stackId="a" fill="var(--amber)" name="Medium" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-paper border border-rule ink-shadow">
        <div className="px-6 py-4 hairline" style={{ background: "rgba(184,145,81,0.05)" }}>
          <div className="small-caps text-mute" style={{ fontSize: 10 }}>Tab. I</div>
          <h3 className="font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
            Prioritized Gap Register
          </h3>
        </div>
        {gaps.length === 0 ? (
          <div className="p-8 text-center font-body text-mute italic" style={{ fontSize: 13 }}>
            No gaps identified yet. Complete the assessment to populate this register.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 12, minWidth: 880 }}>
              <thead>
                <tr className="hairline" style={{ background: "rgba(13,27,42,0.04)" }}>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Priority</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>ID</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Ref</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Section</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Requirement</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Score</th>
                  <th className="text-left px-5 py-3 small-caps text-mute" style={{ fontSize: 9, fontWeight: 600 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map(({ ind, resp, priority }) => (
                  <tr key={ind.id} className="border-b" style={{ borderBottomColor: "rgba(13,27,42,0.06)" }}>
                    <td className="px-5 py-3">
                      <span
                        className="score-pill"
                        style={{
                          background: priority === "High" ? "#F4DCCD" : "#F5E6CB",
                          color: priority === "High" ? "var(--crimson)" : "var(--amber)",
                        }}
                      >
                        {priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 serial-number" style={{ fontSize: 11 }}>{ind.id}</td>
                    <td className="px-5 py-3 text-gold" style={{ fontSize: 10 }}>{PS_META[ind.ps].code} {ind.ref}</td>
                    <td className="px-5 py-3 text-mute" style={{ fontSize: 11 }}>{ind.section}</td>
                    <td className="px-5 py-3 text-ink" style={{ fontSize: 11, lineHeight: 1.45, maxWidth: 360 }}>
                      {ind.text.substring(0, 140)}{ind.text.length > 140 ? "…" : ""}
                    </td>
                    <td className="px-5 py-3 font-display text-ink" style={{ fontSize: 18, fontWeight: 500 }}>
                      {resp.score}
                    </td>
                    <td className="px-5 py-3 text-mute italic" style={{ fontSize: 11, maxWidth: 180 }}>
                      {resp.notes ? resp.notes.substring(0, 80) + (resp.notes.length > 80 ? "…" : "") : <span className="text-mute-2">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   REPORT PAGE (Print-ready)
   ============================================================ */

function ReportPage({ responses, meta }) {
  const overall = computeOverall(responses);
  const perPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    meta: PS_META[n],
    score: computePSScore(responses, n),
  }));

  const topGaps = useMemo(() => {
    return INDICATORS
      .map((ind) => ({ ind, resp: responses[ind.id], priority: priorityGap(responses[ind.id]) }))
      .filter((x) => x.priority === "High")
      .slice(0, 12);
  }, [responses]);

  const strengths = useMemo(() => {
    return INDICATORS
      .map((ind) => ({ ind, resp: responses[ind.id] }))
      .filter((x) => x.resp?.score === 4)
      .slice(0, 8);
  }, [responses]);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 bg-paper" style={{ minHeight: "100vh" }}>
      <div className="no-print mb-6 flex justify-between items-center p-4 border border-rule" style={{ background: "rgba(184,145,81,0.06)" }}>
        <div className="font-body text-ink" style={{ fontSize: 12 }}>
          <strong>Print-ready report.</strong> Use your browser's Print → Save as PDF to export.
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          Print / Save PDF
        </button>
      </div>

      {/* Cover */}
      <div className="print-page text-center py-12">
        <div className="small-caps text-mute mb-3" style={{ fontSize: 10 }}>
          A+CSR Indonesia · Sustainability & Social Impact Advisory
        </div>
        <MastheadRule />
        <div className="small-caps text-gold my-4" style={{ fontSize: 11, letterSpacing: "0.24em" }}>
          Self-Assessment Compliance Report
        </div>
        <h1 className="font-display text-ink" style={{ fontSize: 38, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.1 }}>
          IFC Performance Standards
          <br />on Environmental & Social Sustainability
        </h1>
        <div className="font-display italic text-ink-soft mt-3" style={{ fontSize: 16, fontWeight: 300 }}>
          Effective January 1, 2012
        </div>
        <MastheadRule />
        <div className="mt-16 space-y-2">
          <div className="font-display text-ink" style={{ fontSize: 22, fontWeight: 500 }}>
            {meta.projectName || "—"}
          </div>
          <div className="font-body text-mute" style={{ fontSize: 14 }}>
            Prepared for <span className="text-ink">{meta.clientName || "—"}</span>
          </div>
          <div className="font-body text-mute italic" style={{ fontSize: 12 }}>
            Assessor: {meta.assessorName || "—"} · Date: {meta.assessmentDate || "—"}
          </div>
        </div>
        <div className="mt-20 serial-number" style={{ fontSize: 10 }}>
          A+CSR Indonesia (PT Caraka Swara Raharja Indonesia) · Jakarta · Bogor
          <br />sustainabilityindonesia.com
        </div>
      </div>

      {/* Executive Summary */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 1</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          Executive Summary
        </h2>
        <div className="mt-4 space-y-4 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            This report presents the outcome of a structured self-assessment of{" "}
            <strong>{meta.projectName || "the project"}</strong>'s alignment with the International
            Finance Corporation (IFC) Performance Standards on Environmental and Social Sustainability
            (effective January 1, 2012), covering all eight Performance Standards across{" "}
            <strong>{INDICATORS.length} indicators</strong>.
          </p>
          <p>
            The overall maturity index is <strong>{overall.avg.toFixed(2)} out of 4.00</strong>,
            placing the project at the <strong>{getMaturityLabel(overall.avg).label}</strong> level.
            Assessment completion stands at <strong>{overall.completion.toFixed(0)}%</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div>
            <div className="small-caps text-gold" style={{ fontSize: 10 }}>Maturity Profile</div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <RadarChart data={perPS.map(p => ({ ps: p.meta.abbr, score: p.score.avg, fullMark: 4 }))}>
                  <PolarGrid stroke="rgba(13,27,42,0.2)" />
                  <PolarAngleAxis dataKey="ps" tick={{ fill: "var(--ink)", fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} />
                  <Radar dataKey="score" stroke="var(--ink)" fill="var(--gold)" fillOpacity={0.4} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="small-caps text-gold" style={{ fontSize: 10 }}>Scores by Standard</div>
            <table className="w-full mt-2 font-body" style={{ fontSize: 11 }}>
              <thead>
                <tr className="hairline">
                  <th className="text-left py-1 small-caps text-mute" style={{ fontSize: 9 }}>PS</th>
                  <th className="text-left py-1 small-caps text-mute" style={{ fontSize: 9 }}>Short Title</th>
                  <th className="text-right py-1 small-caps text-mute" style={{ fontSize: 9 }}>Score</th>
                  <th className="text-right py-1 small-caps text-mute" style={{ fontSize: 9 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {perPS.map((p) => (
                  <tr key={p.n} className="border-b" style={{ borderBottomColor: "rgba(13,27,42,0.06)" }}>
                    <td className="py-2 font-display" style={{ fontSize: 13 }}>{p.n}</td>
                    <td className="py-2">{p.meta.short}</td>
                    <td className="text-right py-2 font-display" style={{ fontSize: 14 }}>
                      {p.score.avg.toFixed(2)}
                    </td>
                    <td className={`text-right py-2 italic ${getMaturityLabel(p.score.avg).cls}`}>
                      {getMaturityLabel(p.score.avg).label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* High-Priority Gaps */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 2</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          High-Priority Findings
        </h2>
        <p className="font-body text-mute italic mt-3" style={{ fontSize: 12 }}>
          Indicators scored 0 or 1 require immediate corrective action. Below, the top{" "}
          {topGaps.length} findings.
        </p>
        {topGaps.length === 0 ? (
          <p className="mt-6 font-body text-sage italic" style={{ fontSize: 13 }}>
            No high-priority gaps identified at this stage of assessment.
          </p>
        ) : (
          <div className="space-y-4 mt-6">
            {topGaps.map(({ ind, resp }, idx) => (
              <div key={ind.id} className="print-break-inside-avoid pb-4 hairline">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex-1">
                    <div className="small-caps text-mute" style={{ fontSize: 9 }}>
                      Finding {String(idx + 1).padStart(2, "0")} · {PS_META[ind.ps].code} {ind.ref} · {ind.section}
                    </div>
                    <div className="font-body text-ink mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
                      {ind.text}
                    </div>
                    {resp?.notes && (
                      <div className="font-body italic text-mute mt-2 pl-3 border-l border-gold" style={{ fontSize: 11 }}>
                        {resp.notes}
                      </div>
                    )}
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 28,
                      fontWeight: 300,
                      color: resp.score === 0 ? "var(--crimson)" : "var(--amber)",
                    }}
                  >
                    {resp.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="print-page mt-12">
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 3</div>
          <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
            Areas of Demonstrated Strength
          </h2>
          <p className="font-body text-mute italic mt-3" style={{ fontSize: 12 }}>
            Indicators scored at the Advanced level (4); these practices should be sustained and
            leveraged as institutional knowledge.
          </p>
          <div className="space-y-3 mt-6">
            {strengths.map(({ ind, resp }) => (
              <div key={ind.id} className="pb-3 hairline print-break-inside-avoid">
                <div className="small-caps text-sage" style={{ fontSize: 9 }}>
                  {PS_META[ind.ps].code} {ind.ref} · {ind.section}
                </div>
                <div className="font-body text-ink mt-1" style={{ fontSize: 12, lineHeight: 1.5 }}>
                  {ind.text}
                </div>
                {resp?.notes && (
                  <div className="font-body italic text-mute mt-1" style={{ fontSize: 11 }}>
                    — {resp.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 4</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          Recommended Next Steps
        </h2>
        <div className="mt-6 space-y-5 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              1. Close High-Priority Gaps (0–3 months)
            </div>
            <p className="mt-1 text-ink">
              Address all indicators scored 0–1 through a time-bound corrective action plan,
              prioritizing PS 1 (ESMS foundations) and any critical-habitat, cultural-heritage,
              or Indigenous Peoples findings. Deliverables should include updated policies,
              procedures, and assigned responsibilities.
            </p>
          </div>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              2. Develop Targeted Management Plans (3–9 months)
            </div>
            <p className="mt-1 text-ink">
              For indicators scored 2, elevate practice to "Established" via specific plans —
              e.g., Resettlement Action Plan (PS 5), Biodiversity Action Plan (PS 6), Indigenous
              Peoples Plan (PS 7), Stakeholder Engagement Plan (PS 1), or Chance Find Procedure
              (PS 8) — with measurable KPIs and monitoring cycles.
            </p>
          </div>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              3. Embed & Continuously Improve (9–24 months)
            </div>
            <p className="mt-1 text-ink">
              Integrate ESMS elements into core business decisions; conduct annual senior-management
              reviews; commission independent verification for projects with significant adverse
              impacts. Target moves all Performance Standards to "Established" (≥2.5) or better
              before financing approvals or Equator-Principles-aligned appraisal.
            </p>
          </div>
          <div>
            <div className="font-display text-ink" style={{ fontSize: 15, fontWeight: 600 }}>
              4. Cross-Reference with Complementary Frameworks
            </div>
            <p className="mt-1 text-ink">
              Align findings with applicable industry standards (e.g., IRMA for mining, RSPO for
              palm oil), host-country regulations (UU 32/2009, Permen ESDM 26/2018, Permen LHK on
              AMDAL/UKL-UPL, RKAB, Izin PPKH), and international frameworks (UNGPs, OECD Due
              Diligence Guidance). A+CSR can support integrated assessments combining IFC PS,
              ESG materiality, and IRMA readiness.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>§ 5</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 26, fontWeight: 500 }}>
          Methodology Note
        </h2>
        <div className="mt-4 space-y-3 font-body text-mute" style={{ fontSize: 11, lineHeight: 1.6 }}>
          <p>
            The assessment instrument maps {INDICATORS.length} indicators to the eight Performance
            Standards, with each indicator referencing the specific paragraph(s) of the IFC PS
            (2012) from which it is derived. Scoring follows a five-level maturity scale (0 — Not
            Started; 1 — Initial; 2 — Developing; 3 — Established; 4 — Advanced), with an N/A
            option for indicators that do not apply to the project's business activities.
          </p>
          <p>
            Performance Standard averages exclude N/A responses. The overall maturity index is
            the unweighted mean of the eight PS averages, giving equal weight to each Standard.
            In practice, client organizations may wish to apply sector-specific weightings —
            A+CSR's full consulting engagement typically develops a bespoke weighting scheme
            during scoping.
          </p>
          <p className="italic">
            This self-assessment is diagnostic in nature and does not constitute, and should not
            be represented as, an independent audit, certification, or assurance opinion. For
            lender-ready assessments, a third-party audit is recommended.
          </p>
        </div>
        <div className="mt-8 serial-number text-center" style={{ fontSize: 10 }}>
          — End of Report —
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NARRATIVE REPORT PAGE (Full consulting-style report)
   ============================================================ */

// Priority icon
const priorityDot = (color) => (
  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, marginRight: 8, verticalAlign: "middle" }} />
);

function NarrativeReportPage({ responses, meta }) {
  const overall = computeOverall(responses);
  const perPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    meta: PS_META[n],
    score: computePSScore(responses, n),
  }));

  // Aggregate gaps by priority
  const allGaps = INDICATORS
    .map((ind) => ({ ind, resp: responses[ind.id], priority: priorityGap(responses[ind.id]) }))
    .filter((x) => x.priority !== null);

  const highGaps = allGaps.filter((g) => g.priority === "High");
  const medGaps = allGaps.filter((g) => g.priority === "Medium");

  const strengths = INDICATORS
    .map((ind) => ({ ind, resp: responses[ind.id] }))
    .filter((x) => x.resp?.score === 4);

  const established = INDICATORS
    .map((ind) => ({ ind, resp: responses[ind.id] }))
    .filter((x) => x.resp?.score === 3);

  // Compute strongest and weakest PS
  const scoredPS = perPS.filter((p) => p.score.answered > 0);
  const strongestPS = [...scoredPS].sort((a, b) => b.score.avg - a.score.avg)[0];
  const weakestPS = [...scoredPS].sort((a, b) => a.score.avg - b.score.avg)[0];

  // Count high gaps per PS
  const highGapsByPS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    count: highGaps.filter((g) => g.ind.ps === n).length,
  }));

  // Risk categorization
  const riskProfile =
    overall.avg >= 3 ? { level: "Low Residual Risk", color: "var(--sage)", desc: "suitable for category B/C appraisal" } :
    overall.avg >= 2 ? { level: "Moderate Residual Risk", color: "var(--amber)", desc: "category A projects require corrective action plan before appraisal" } :
    overall.avg >= 1 ? { level: "High Residual Risk", color: "var(--crimson)", desc: "material E&S gaps — immediate remediation required prior to any financing" } :
    { level: "Severe Risk Exposure", color: "var(--crimson)", desc: "foundational ESMS work required before project progression" };

  // Section score tables
  const psWithSections = perPS.map((p) => {
    const secMap = new Map();
    INDICATORS.filter((i) => i.ps === p.n).forEach((i) => {
      if (!secMap.has(i.section)) secMap.set(i.section, { total: 0, sum: 0, count: 0, gaps: 0 });
      const s = secMap.get(i.section);
      const r = responses[i.id];
      s.total += 1;
      if (r && typeof r.score === "number") {
        s.sum += r.score;
        s.count += 1;
        if (r.score <= 1) s.gaps += 1;
      }
    });
    const sections = Array.from(secMap.entries()).map(([name, data]) => ({
      name,
      avg: data.count > 0 ? data.sum / data.count : 0,
      answered: data.count,
      total: data.total,
      gaps: data.gaps,
    }));
    return { ...p, sections };
  });

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 bg-paper" style={{ minHeight: "100vh" }}>
      <div className="no-print mb-6 flex justify-between items-center p-4 border border-rule" style={{ background: "rgba(184,145,81,0.06)" }}>
        <div className="font-body text-ink" style={{ fontSize: 12 }}>
          <strong>Full narrative report — {INDICATORS.length}-indicator comprehensive analysis.</strong>
          <br />
          <span className="text-mute italic">Use browser Print → Save as PDF for the complete document.</span>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          Print / Save PDF
        </button>
      </div>

      {/* ========== COVER PAGE ========== */}
      <div className="print-page text-center py-12">
        <div className="small-caps text-mute mb-3" style={{ fontSize: 10 }}>
          A+CSR Indonesia · Sustainability & Social Impact Advisory
        </div>
        <MastheadRule />
        <div className="small-caps text-gold my-4" style={{ fontSize: 11, letterSpacing: "0.24em" }}>
          Comprehensive Diagnostic Report
        </div>
        <h1 className="font-display text-ink" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15 }}>
          IFC Performance Standards
          <br />on Environmental & Social Sustainability
        </h1>
        <div className="font-display italic text-ink-soft mt-3" style={{ fontSize: 16, fontWeight: 300 }}>
          Self-Assessment Compliance Review · Full Narrative
        </div>
        <MastheadRule />

        <div className="mt-14 space-y-2">
          <div className="font-display text-ink" style={{ fontSize: 24, fontWeight: 500 }}>
            {meta.projectName || "—"}
          </div>
          <div className="font-body text-mute" style={{ fontSize: 14 }}>
            Prepared for <span className="text-ink font-display italic">{meta.clientName || "—"}</span>
          </div>
          {meta.sector && (
            <div className="font-body text-mute" style={{ fontSize: 12 }}>
              Sector: <span className="text-ink">{meta.sector}</span>
            </div>
          )}
          {meta.location && (
            <div className="font-body text-mute" style={{ fontSize: 12 }}>
              Location: <span className="text-ink">{meta.location}</span>
            </div>
          )}
        </div>

        <div className="mt-12 inline-block text-left border border-ink p-6" style={{ minWidth: 360 }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3" style={{ fontSize: 11 }}>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Overall Maturity</div>
              <div className="font-display text-ink" style={{ fontSize: 20 }}>
                {overall.avg.toFixed(2)} / 4.00
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Risk Profile</div>
              <div className="font-display italic" style={{ fontSize: 14, color: riskProfile.color }}>
                {riskProfile.level}
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>Indicators Assessed</div>
              <div className="font-display text-ink" style={{ fontSize: 16 }}>
                {Object.values(responses).filter(r => r?.score !== undefined && r?.score !== null).length} / {INDICATORS.length}
              </div>
            </div>
            <div>
              <div className="small-caps text-mute" style={{ fontSize: 9 }}>High-Priority Gaps</div>
              <div className="font-display" style={{ fontSize: 16, color: "var(--crimson)" }}>
                {highGaps.length}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-1">
          <div className="font-body text-mute" style={{ fontSize: 11 }}>
            Lead Assessor: <span className="text-ink">{meta.assessorName || "—"}</span>
          </div>
          <div className="font-body text-mute" style={{ fontSize: 11 }}>
            Assessment Date: <span className="text-ink">{meta.assessmentDate || "—"}</span>
          </div>
        </div>

        <div className="mt-16 serial-number" style={{ fontSize: 10 }}>
          A+CSR Indonesia (PT Caraka Swara Raharja Indonesia)
          <br />Jakarta · Bogor · sustainabilityindonesia.com
          <br />
          <span style={{ fontSize: 9 }}>STRICTLY PRIVATE AND CONFIDENTIAL</span>
        </div>
      </div>

      {/* ========== TABLE OF CONTENTS ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Contents</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Table of Contents
        </h2>
        <div className="mt-6 space-y-2 font-body" style={{ fontSize: 12 }}>
          {[
            { n: "1.", title: "Executive Summary", page: "03" },
            { n: "2.", title: "Assessment Context & Scope", page: "04" },
            { n: "3.", title: "Methodology", page: "05" },
            { n: "4.", title: "Overall Findings & Risk Profile", page: "06" },
            { n: "5.", title: "Performance Standard 1 — ESMS & Stakeholder Engagement", page: "08" },
            { n: "6.", title: "Performance Standard 2 — Labor and Working Conditions", page: "10" },
            { n: "7.", title: "Performance Standard 3 — Resource Efficiency and Pollution Prevention", page: "11" },
            { n: "8.", title: "Performance Standard 4 — Community Health, Safety and Security", page: "12" },
            { n: "9.", title: "Performance Standard 5 — Land Acquisition and Involuntary Resettlement", page: "13" },
            { n: "10.", title: "Performance Standard 6 — Biodiversity and Natural Resources", page: "15" },
            { n: "11.", title: "Performance Standard 7 — Indigenous Peoples", page: "16" },
            { n: "12.", title: "Performance Standard 8 — Cultural Heritage", page: "18" },
            { n: "13.", title: "Strategic Roadmap & Recommendations", page: "19" },
            { n: "14.", title: "Appendix A — Prioritized Gap Register", page: "21" },
            { n: "15.", title: "Appendix B — Detailed Findings by Indicator", page: "23" },
            { n: "16.", title: "Appendix C — Glossary & References", page: "30" },
          ].map((item) => (
            <div key={item.n} className="flex items-baseline" style={{ lineHeight: 2 }}>
              <span className="font-display text-gold" style={{ fontSize: 12, minWidth: 32 }}>{item.n}</span>
              <span className="text-ink flex-1">{item.title}</span>
              <span className="flex-1 mx-3" style={{ borderBottom: "1px dotted rgba(13,27,42,0.25)", marginBottom: 4 }} />
              <span className="serial-number text-mute" style={{ fontSize: 11 }}>{item.page}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========== SECTION 1 — EXECUTIVE SUMMARY ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 1</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Executive Summary
        </h2>
        <div className="mt-5 space-y-4 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.7 }}>
          <p>
            This report presents the findings of a structured self-assessment of{" "}
            <strong>{meta.projectName || "the Project"}</strong>
            {meta.clientName ? <>, operated by <strong>{meta.clientName}</strong>,</> : null} against the International
            Finance Corporation (IFC) Performance Standards on Environmental and Social Sustainability,
            effective 1 January 2012. The assessment covers all eight Performance Standards through{" "}
            <strong>{INDICATORS.length} discrete indicators</strong> spanning policy, management systems,
            stakeholder engagement, labor, pollution prevention, community health, land acquisition,
            biodiversity, Indigenous Peoples, and cultural heritage.
          </p>

          <p>
            Based on evidence reviewed and responses provided, the overall Maturity Index stands at{" "}
            <strong>{overall.avg.toFixed(2)} out of a possible 4.00</strong>, placing the Project at the{" "}
            <strong className={getMaturityLabel(overall.avg).cls}>
              {getMaturityLabel(overall.avg).label}
            </strong>{" "}
            level. Against the IFC Sustainability Framework, this translates to a{" "}
            <strong style={{ color: riskProfile.color }}>{riskProfile.level.toLowerCase()}</strong>{" "}
            — {riskProfile.desc}.
          </p>

          <p>
            The assessment identified{" "}
            <strong style={{ color: "var(--crimson)" }}>{highGaps.length} high-priority gaps</strong>
            {" "}(indicators scored 0–1) requiring immediate corrective action,{" "}
            <strong style={{ color: "var(--amber)" }}>{medGaps.length} medium-priority gaps</strong>
            {" "}(scored 2) warranting structured improvement plans, and{" "}
            <strong className="text-sage">{strengths.length + established.length} areas of demonstrated adequacy</strong>{" "}
            (scored 3–4) that should be sustained through ongoing management attention.
          </p>

          {strongestPS && weakestPS && (
            <p>
              The strongest performance is observed in{" "}
              <strong>{strongestPS.meta.code} — {strongestPS.meta.short}</strong>{" "}
              (score {strongestPS.score.avg.toFixed(2)}), reflecting{" "}
              {strongestPS.score.avg >= 3 ? "mature systems and sustained implementation" : "acceptable practice that can be built upon"}.
              Conversely, the area requiring the most urgent attention is{" "}
              <strong>{weakestPS.meta.code} — {weakestPS.meta.short}</strong>{" "}
              (score {weakestPS.score.avg.toFixed(2)}), where{" "}
              {weakestPS.score.avg < 1.5 ? "foundational policies and procedures remain absent or informal" : "practices are developing but inconsistently applied"}.
            </p>
          )}

          <p>
            In the Indonesian extractive-sector context, these findings carry specific implications
            for regulatory compliance (UU 32/2009 PPLH, Permen LHK 7/2018 AMDAL, Permen ESDM 26/2018,
            UU 5/1960 Agraria, UU 39/1999 HAM), lender appraisal (Equator Principles, IFC direct
            investment, green-loan frameworks), and the social license to operate in communities
            with active civil-society scrutiny (WALHI, JATAM, Mongabay, Watchdoc, among others).
          </p>

          <div className="mt-6 p-4 border-l-4" style={{ borderColor: "var(--gold)", background: "rgba(184,145,81,0.06)" }}>
            <div className="small-caps text-gold mb-2" style={{ fontSize: 10 }}>Headline Recommendation</div>
            <p className="font-body text-ink italic" style={{ fontSize: 12 }}>
              {overall.avg >= 3
                ? "Sustain current performance through annual internal review, external verification of monitoring data, and integration of PS requirements into procurement and joint-venture agreements."
                : overall.avg >= 2
                ? "Elevate the Project from 'Developing' to 'Established' within 9–12 months via a time-bound corrective action plan targeting the " + highGaps.length + " high-priority gaps and strengthening documentation across identified weak sections."
                : overall.avg >= 1
                ? "Before further project expansion or external financing, undertake a foundational ESMS programme focused on PS 1 policy and procedures, stakeholder engagement infrastructure, and — where applicable — RAP/LRP and FPIC-related safeguards."
                : "Commission a structured ESMS development engagement covering all eight Standards, starting with policy commitment, role assignment, baseline studies, and external expert onboarding before project activities proceed."}
            </p>
          </div>
        </div>
      </div>

      {/* ========== SECTION 2 — CONTEXT & SCOPE ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 2</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Assessment Context & Scope
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          2.1 Rationale for the Assessment
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            The IFC Performance Standards constitute the de facto global benchmark for private-sector
            environmental and social (E&S) risk management, adopted by the Equator Principles
            Financial Institutions (EPFIs), most multilateral development banks, and major private
            lenders. In the Indonesian context, the Standards are routinely referenced in appraisal
            of extractive projects (nickel, coal, gold, rubber, palm), infrastructure, and carbon
            projects seeking international financing or offtake agreements.
          </p>
          <p>
            A structured self-assessment serves three complementary purposes: it provides the client
            with an internal baseline of compliance maturity, it identifies priority investments in
            management systems and capacity prior to formal external audit, and it generates the
            documentary foundation for subsequent stakeholder engagement, lender due diligence, or
            independent assurance.
          </p>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          2.2 Scope of This Assessment
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>The assessment covers:</p>
          <ul className="pl-6 space-y-1" style={{ listStyle: "square" }}>
            <li>All eight IFC Performance Standards (PS 1 through PS 8)</li>
            <li><strong>{INDICATORS.length}</strong> detailed indicators mapped to specific paragraphs of the Standards</li>
            <li>
              Project identification: <em>{meta.projectName || "—"}</em>
              {meta.sector && <> · Sector: <em>{meta.sector}</em></>}
              {meta.location && <> · Location: <em>{meta.location}</em></>}
            </li>
            <li>Assessment period concluded: {meta.assessmentDate || "—"}</li>
          </ul>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          2.3 Limitations of the Self-Assessment Format
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            This is a <em>diagnostic self-assessment</em>. Findings reflect the client's own review
            of practice against the Standards, informed by documented evidence where cited. The
            report does not constitute — and should not be represented as — an independent audit,
            assurance engagement, or certification. For lender-ready determinations, a third-party
            independent audit is recommended, typically by firms with IFC/MIGA, Equator-Principles,
            or accredited-body credentials.
          </p>
        </div>
      </div>

      {/* ========== SECTION 3 — METHODOLOGY ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 3</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Methodology
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          3.1 Indicator Set
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            The indicator set comprises {INDICATORS.length} requirements distilled directly from
            the Performance Standards (2012) and cross-referenced to the corresponding Guidance
            Notes and the World Bank Group Environmental, Health and Safety (EHS) Guidelines. Each
            indicator cites the specific paragraph(s) of the underlying Standard from which it
            derives, preserving traceability back to the primary source.
          </p>
          <p>
            Indicators are grouped by thematic section within each Performance Standard (e.g., for
            PS 1: Policy; Risks & Impacts Identification; Management Programs; Organizational
            Capacity; Emergency Preparedness; Monitoring & Review; Stakeholder Engagement;
            Grievance Mechanism; External Communications). This architecture allows practitioners
            to read results either vertically (by PS) or horizontally (by management system
            element across PS).
          </p>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          3.2 Maturity Scoring
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>Each indicator is rated on a five-level maturity scale:</p>
          <table className="w-full mt-2" style={{ fontSize: 11 }}>
            <thead>
              <tr style={{ background: "rgba(13,27,42,0.05)" }}>
                <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Level</th>
                <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Descriptor</th>
                <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Characterization</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_LEVELS.map((lvl) => (
                <tr key={lvl.value} className="hairline">
                  <td className="py-2 px-3 font-display text-ink" style={{ fontSize: 15 }}>{lvl.value}</td>
                  <td className="py-2 px-3 font-display italic">{lvl.label}</td>
                  <td className="py-2 px-3 text-mute">{lvl.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3">
            An <strong>N/A</strong> option is available where an indicator does not apply to the
            specific business activities of the Project. N/A responses are excluded from PS-level
            average calculations but counted toward completion metrics.
          </p>
        </div>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          3.3 Aggregation & Risk Profile
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            Each Performance Standard's overall score is the unweighted arithmetic mean of all
            answered (non-N/A) indicators within that PS. The overall Maturity Index is the mean
            of the eight PS scores, giving each Standard equal weight. In consulting engagements,
            A+CSR typically applies sector-specific weighting (e.g., elevating PS 5 and PS 7 for
            nickel/coal operations in Indigenous territories); the present report uses equal
            weighting for transparency.
          </p>
          <p>
            Residual risk profile is derived from overall maturity:{" "}
            ≥3.00 = Low; 2.00–2.99 = Moderate; 1.00–1.99 = High;{" "}
            {"<"}1.00 = Severe.
          </p>
        </div>
      </div>

      {/* ========== SECTION 4 — OVERALL FINDINGS ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 4</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Overall Findings & Risk Profile
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 16, fontWeight: 600 }}>
          4.1 Maturity Distribution Across the Eight Standards
        </h3>
        <div className="grid grid-cols-5 gap-4 mt-4" style={{ alignItems: "start" }}>
          <div className="col-span-3" style={{ height: 280 }}>
            <ResponsiveContainer>
              <RadarChart data={perPS.map((p) => ({ ps: p.meta.abbr, score: p.score.avg, fullMark: 4 }))}>
                <PolarGrid stroke="rgba(13,27,42,0.2)" />
                <PolarAngleAxis dataKey="ps" tick={{ fill: "var(--ink)", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} />
                <Radar dataKey="score" stroke="var(--ink)" fill="var(--gold)" fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 font-body text-ink" style={{ fontSize: 11, lineHeight: 1.6 }}>
            <div className="small-caps text-mute mb-1" style={{ fontSize: 9 }}>Fig. 4.1</div>
            <p className="italic text-mute" style={{ fontSize: 11 }}>
              The radar profile illustrates relative maturity across the eight Performance Standards
              on a 0–4 scale. A well-rounded figure approaching the outer ring indicates balanced,
              Advanced-level E&S management.
            </p>
          </div>
        </div>

        <h3 className="font-display text-ink mt-6" style={{ fontSize: 16, fontWeight: 600 }}>
          4.2 Performance Standard Scorecard
        </h3>
        <table className="w-full mt-3" style={{ fontSize: 11 }}>
          <thead>
            <tr style={{ background: "var(--ink)", color: "var(--paper)" }}>
              <th className="text-left py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>PS</th>
              <th className="text-left py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Title</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Score</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Level</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>High Gaps</th>
              <th className="text-right py-2 px-3" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {perPS.map((p) => {
              const mat = getMaturityLabel(p.score.avg);
              const highs = highGaps.filter((g) => g.ind.ps === p.n).length;
              const coverage = p.score.total > 0 ? Math.round(((p.score.answered + p.score.naCount) / p.score.total) * 100) : 0;
              return (
                <tr key={p.n} className="hairline">
                  <td className="py-2 px-3 font-display" style={{ fontSize: 13, fontWeight: 500 }}>{p.n}</td>
                  <td className="py-2 px-3 text-ink">{p.meta.short}</td>
                  <td className="text-right py-2 px-3 font-display" style={{ fontSize: 14, fontWeight: 500 }}>
                    {p.score.avg.toFixed(2)}
                  </td>
                  <td className={`text-right py-2 px-3 italic font-display ${mat.cls}`} style={{ fontSize: 12 }}>
                    {mat.label}
                  </td>
                  <td className="text-right py-2 px-3" style={{ color: highs > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                    {highs > 0 ? highs : "—"}
                  </td>
                  <td className="text-right py-2 px-3 text-mute">{coverage}%</td>
                </tr>
              );
            })}
            <tr style={{ background: "rgba(184,145,81,0.08)", borderTop: "2px solid var(--ink)" }}>
              <td className="py-2 px-3 font-display font-bold" colSpan={2}>Overall</td>
              <td className="text-right py-2 px-3 font-display" style={{ fontSize: 15, fontWeight: 600 }}>
                {overall.avg.toFixed(2)}
              </td>
              <td className={`text-right py-2 px-3 italic font-display ${getMaturityLabel(overall.avg).cls}`} style={{ fontSize: 13 }}>
                {getMaturityLabel(overall.avg).label}
              </td>
              <td className="text-right py-2 px-3" style={{ color: "var(--crimson)" }}>
                {highGaps.length}
              </td>
              <td className="text-right py-2 px-3">{overall.completion.toFixed(0)}%</td>
            </tr>
          </tbody>
        </table>

        <h3 className="font-display text-ink mt-6" style={{ fontSize: 16, fontWeight: 600 }}>
          4.3 Cross-Cutting Observations
        </h3>
        <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
          <p>
            <strong>Governance and system coherence.</strong>{" "}
            {perPS[0].score.avg >= 3
              ? "The foundations established under PS 1 provide a coherent management-system backbone, enabling consistent application across the downstream standards."
              : perPS[0].score.avg >= 2
              ? "PS 1 shows established practice but remains uneven in depth; strengthening the ESMS backbone will lift downstream standards in turn."
              : "PS 1 maturity is below the Established threshold, which is material: without a functioning ESMS backbone, discrete improvements in downstream standards tend not to sustain. Investment in PS 1 is recommended as a priority."}
          </p>
          <p>
            <strong>Stakeholder engagement intensity.</strong>{" "}
            {(() => {
              const seIds = ["1.7.1","1.7.2","1.7.3","1.7.4","1.7.5","1.7.6","1.7.7","1.7.8","1.7.9","1.7.10","1.7.11","1.7.12"];
              const seResps = seIds.map(id => responses[id]).filter(r => typeof r?.score === "number");
              const seAvg = seResps.length > 0 ? seResps.reduce((a,r)=>a+r.score,0) / seResps.length : 0;
              if (seResps.length === 0) return "Stakeholder engagement indicators have not yet been assessed; this area is critical for extractive-sector projects in Indonesia and warrants priority attention.";
              if (seAvg >= 3) return "Stakeholder engagement is functioning as a two-way system with documented evidence of community influence on project decisions — an asset in the Indonesian context where civil-society scrutiny is active.";
              if (seAvg >= 2) return "Stakeholder engagement is regularly conducted but the depth of inclusion (vulnerable groups, women's separate fora, ICP documentation) shows room for improvement.";
              return "Stakeholder engagement is at an early stage. Given the Indonesian context of active NGO scrutiny (WALHI, JATAM, Mongabay) and evolving FPIC expectations, rapid improvement is warranted.";
            })()}
          </p>
          <p>
            <strong>Land and Indigenous Peoples exposure.</strong>{" "}
            {(() => {
              const ps5 = perPS[4].score.avg, ps7 = perPS[6].score.avg;
              if (ps5 === 0 && ps7 === 0) return "PS 5 and PS 7 have not yet been assessed. These Standards carry the highest-profile legal and reputational risk in the Indonesian extractive context — urgent attention recommended.";
              if (ps5 >= 2.5 && ps7 >= 2.5) return "Land acquisition and Indigenous Peoples management show Established maturity — a significant strength given the heightened scrutiny these Standards attract from lenders and civil society.";
              return "PS 5 and PS 7 relate directly to the highest-severity risks in Indonesian extractive operations: involuntary resettlement, livelihood restoration, and FPIC. The current maturity in these areas is " +
                ((ps5 + ps7) / 2 >= 2 ? "developing" : "below the Developing threshold") +
                ", suggesting that targeted investment in RAP/LRP design, FPIC process, and documented community agreements is a priority.";
            })()}
          </p>
          <p>
            <strong>Biodiversity and resource efficiency.</strong>{" "}
            {(() => {
              const ps3 = perPS[2].score.avg, ps6 = perPS[5].score.avg;
              if (ps3 === 0 && ps6 === 0) return "Environmental standards PS 3 and PS 6 are not yet assessed and should be addressed alongside the social standards in an integrated ESMS approach.";
              if (ps6 >= 2.5) return "Biodiversity management is at an acceptable level; for projects in or near protected areas, critical habitat, or HCV areas, maintaining robust monitoring and offset arrangements remains essential.";
              return "PS 6 is below Established maturity. For projects operating in Indonesia's biodiversity-rich landscapes (Sulawesi, Papua, Kalimantan, Halmahera), investment in Critical Habitat Assessment, BMPs, and biodiversity offset design is recommended.";
            })()}
          </p>
        </div>
      </div>

      {/* ========== SECTIONS 5-12 — PER-PS ANALYSIS ========== */}
      {psWithSections.map((p, idx) => {
        const mat = getMaturityLabel(p.score.avg);
        const narr = narrativeFor(p.score);
        const psGaps = highGaps.filter((g) => g.ind.ps === p.n);
        const psMedium = medGaps.filter((g) => g.ind.ps === p.n);
        const psStrengths = strengths.filter((x) => x.ind.ps === p.n);
        return (
          <div key={p.n} className="print-page mt-12">
            <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section {5 + idx}</div>
            <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 24, fontWeight: 500 }}>
              Performance Standard {p.n} — {p.meta.short}
            </h2>
            <div className="font-display italic text-mute mt-1" style={{ fontSize: 13 }}>
              {p.meta.title}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="border border-rule p-3">
                <div className="small-caps text-mute" style={{ fontSize: 9 }}>Maturity Score</div>
                <div className="font-display text-ink" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
                  {p.score.avg.toFixed(2)}<span className="text-mute-2" style={{ fontSize: 11 }}>/4.00</span>
                </div>
                <div className={`font-display italic mt-1 ${mat.cls}`} style={{ fontSize: 12 }}>
                  {mat.label}
                </div>
              </div>
              <div className="border border-rule p-3">
                <div className="small-caps text-mute" style={{ fontSize: 9 }}>High-Priority Gaps</div>
                <div className="font-display" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1, color: psGaps.length > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                  {psGaps.length}
                </div>
                <div className="text-mute italic" style={{ fontSize: 10 }}>score 0–1 · urgent</div>
              </div>
              <div className="border border-rule p-3">
                <div className="small-caps text-mute" style={{ fontSize: 9 }}>Coverage</div>
                <div className="font-display text-ink" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
                  {p.score.total > 0 ? Math.round(((p.score.answered + p.score.naCount) / p.score.total) * 100) : 0}
                  <span className="text-mute-2" style={{ fontSize: 11 }}>%</span>
                </div>
                <div className="text-mute italic" style={{ fontSize: 10 }}>
                  {p.score.answered + p.score.naCount}/{p.score.total} assessed
                </div>
              </div>
            </div>

            <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
              {5 + idx}.1 Verdict & Analysis
            </h4>
            <div className="mt-2 space-y-3 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
              <p className="font-display italic" style={{ fontSize: 13, color: mat.color }}>
                {narr.verdict}.
              </p>
              <p>{narr.narrative}</p>
            </div>

            {p.sections.some((s) => s.answered > 0) && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.2 Section-Level Breakdown
                </h4>
                <table className="w-full mt-2" style={{ fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "rgba(13,27,42,0.05)" }}>
                      <th className="text-left py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Section</th>
                      <th className="text-right py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Score</th>
                      <th className="text-right py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>Assessed</th>
                      <th className="text-right py-2 px-3 small-caps text-mute" style={{ fontSize: 9 }}>High Gaps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.sections.map((s) => (
                      <tr key={s.name} className="hairline">
                        <td className="py-2 px-3 text-ink">{s.name}</td>
                        <td className="text-right py-2 px-3 font-display" style={{ fontSize: 13 }}>
                          {s.answered > 0 ? s.avg.toFixed(2) : "—"}
                        </td>
                        <td className="text-right py-2 px-3 text-mute">{s.answered}/{s.total}</td>
                        <td className="text-right py-2 px-3" style={{ color: s.gaps > 0 ? "var(--crimson)" : "var(--mute-2)" }}>
                          {s.gaps > 0 ? s.gaps : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {psGaps.length > 0 && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.3 High-Priority Findings in This Standard
                </h4>
                <div className="mt-2 space-y-3">
                  {psGaps.slice(0, 8).map(({ ind, resp }) => (
                    <div key={ind.id} className="print-break-inside-avoid pb-3" style={{ borderBottom: "1px solid rgba(13,27,42,0.08)" }}>
                      <div className="flex items-baseline gap-3">
                        <div className="serial-number flex-shrink-0" style={{ fontSize: 10, minWidth: 42 }}>{ind.id}</div>
                        <div className="flex-1">
                          <div className="font-body text-ink" style={{ fontSize: 12, lineHeight: 1.5 }}>
                            {ind.text}
                          </div>
                          <div className="small-caps text-mute mt-1" style={{ fontSize: 9 }}>
                            {p.meta.code} {ind.ref} · {ind.section}
                          </div>
                          {resp?.notes && (
                            <div className="font-body italic text-mute mt-2 pl-3 border-l border-gold" style={{ fontSize: 11 }}>
                              <strong className="text-ink" style={{ fontStyle: "normal", fontSize: 10 }}>Finding:</strong>{" "}
                              {resp.notes}
                            </div>
                          )}
                        </div>
                        <div className="font-display flex-shrink-0" style={{ fontSize: 22, fontWeight: 300, color: resp.score === 0 ? "var(--crimson)" : "var(--amber)" }}>
                          {resp.score}
                        </div>
                      </div>
                    </div>
                  ))}
                  {psGaps.length > 8 && (
                    <div className="text-mute italic" style={{ fontSize: 11 }}>
                      … plus {psGaps.length - 8} additional high-priority findings — see Appendix A for the complete register.
                    </div>
                  )}
                </div>
              </>
            )}

            {psMedium.length > 0 && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.{psGaps.length > 0 ? 4 : 3} Medium-Priority Observations
                </h4>
                <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <p className="mb-2">
                    {psMedium.length} indicator{psMedium.length > 1 ? "s" : ""} in this Standard scored 2 (Developing). These are
                    areas where documented practice exists but is not yet consistently applied, monitored, or verified.
                    Structured elevation to Established level is recommended.
                  </p>
                  <ul className="pl-4 space-y-1" style={{ fontSize: 11 }}>
                    {psMedium.slice(0, 4).map(({ ind }) => (
                      <li key={ind.id}>
                        <span className="serial-number" style={{ fontSize: 10 }}>{ind.id}</span>{" — "}
                        <span className="italic">{ind.section}:</span>{" "}
                        {ind.text.substring(0, 150)}{ind.text.length > 150 ? "…" : ""}
                      </li>
                    ))}
                    {psMedium.length > 4 && (
                      <li className="italic text-mute">… plus {psMedium.length - 4} further medium-priority observations.</li>
                    )}
                  </ul>
                </div>
              </>
            )}

            {psStrengths.length > 0 && (
              <>
                <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
                  {5 + idx}.{(psGaps.length > 0 ? 1 : 0) + (psMedium.length > 0 ? 1 : 0) + 3} Areas of Demonstrated Strength
                </h4>
                <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <p>
                    {psStrengths.length} indicator{psStrengths.length > 1 ? "s" : ""} in this Standard achieved the Advanced level (score 4),
                    indicating fully integrated and continuously improving practice. These capabilities should be captured
                    as institutional knowledge, referenced in stakeholder communications, and sustained through
                    senior-management oversight.
                  </p>
                </div>
              </>
            )}

            <h4 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
              {5 + idx}.{(psGaps.length > 0 ? 1 : 0) + (psMedium.length > 0 ? 1 : 0) + (psStrengths.length > 0 ? 1 : 0) + 3} Recommended Actions for PS {p.n}
            </h4>
            <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.65 }}>
              {p.score.avg >= 3 ? (
                <ol className="pl-5 space-y-1" style={{ listStyle: "decimal" }}>
                  <li>Sustain current practice through annual internal review cycle.</li>
                  <li>Where not already done, commission external verification for the {p.meta.short} module.</li>
                  <li>Capture institutional knowledge via procedure manuals and internal training.</li>
                </ol>
              ) : p.score.avg >= 2 ? (
                <ol className="pl-5 space-y-1" style={{ listStyle: "decimal" }}>
                  <li>Close the {psGaps.length} high-priority gap{psGaps.length !== 1 ? "s" : ""} via a time-bound corrective action plan (90 days).</li>
                  <li>Elevate the {psMedium.length} medium-priority item{psMedium.length !== 1 ? "s" : ""} through structured documentation, staff training, and management attention (6 months).</li>
                  <li>Integrate this Standard into the annual ESMS review cycle with clear KPIs.</li>
                </ol>
              ) : (
                <ol className="pl-5 space-y-1" style={{ listStyle: "decimal" }}>
                  <li>Establish baseline policy and procedures for {p.meta.short} as a priority.</li>
                  <li>Assign senior-management responsibility and allocate budget; engage external experts where warranted.</li>
                  <li>Develop a 12–18 month improvement plan targeting Established maturity.</li>
                  <li>Align the plan with applicable Indonesian regulations and international good practice.</li>
                </ol>
              )}
            </div>
          </div>
        );
      })}

      {/* ========== SECTION 13 — STRATEGIC ROADMAP ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Section 13</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Strategic Roadmap & Recommendations
        </h2>

        <p className="mt-5 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.7 }}>
          The strategic roadmap below translates the findings of this assessment into a phased
          programme of work. Phases are sequenced to address the most material risks first,
          to build capacity progressively, and to position the Project for eventual external
          audit or lender appraisal.
        </p>

        {/* Phase 1 */}
        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--crimson)" }}>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--crimson)" }}>Phase 1 · 0–3 months</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Close High-Priority Gaps
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Address all {highGaps.length} indicator{highGaps.length !== 1 ? "s" : ""} scored 0–1 through a
              time-bound Corrective Action Plan (CAP). Prioritize PS 1 (ESMS foundations) and any findings
              related to critical habitat (PS 6), land acquisition (PS 5), Indigenous Peoples (PS 7), or
              cultural heritage (PS 8) — areas where residual damage is difficult to reverse.
            </p>
            <p className="mt-2">
              <strong>Key deliverables:</strong> policy documents, role matrices, stakeholder register,
              grievance mechanism procedure, updated RAP/LRP as applicable, FPIC documentation where
              required, BAP/critical habitat assessment where warranted.
            </p>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--amber)" }}>
          <div className="small-caps" style={{ fontSize: 10, color: "var(--amber)" }}>Phase 2 · 3–9 months</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Elevate to Established Maturity
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Work through the {medGaps.length} indicator{medGaps.length !== 1 ? "s" : ""} scored 2 (Developing)
              to bring them to Established (3). This phase focuses on operationalization — making documented
              procedures into consistently-applied practice with evidence of outcomes.
            </p>
            <p className="mt-2">
              <strong>Key activities:</strong> staff training and capacity building; roll-out of monitoring
              systems; integration of PS requirements into contractor management and procurement; development
              of targeted plans (SEP, Emergency Response Plan, OHS Plan, Chance Find Procedure, Influx
              Management Plan, etc.); first complete cycle of senior-management review.
            </p>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--sage)" }}>
          <div className="small-caps text-sage" style={{ fontSize: 10 }}>Phase 3 · 9–24 months</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Embed, Verify, and Continuously Improve
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Integrate ESMS elements into core business decisions; conduct an independent third-party
              audit or verification engagement; pursue any relevant certifications (e.g., ISO 14001, ISO 45001,
              RSPO, IRMA where applicable); target Advanced maturity on PS 1 and the Standards most material
              to the Project's risk profile.
            </p>
            <p className="mt-2">
              <strong>Key outcomes:</strong> IFC/Equator-Principles-ready documentation; internal audit
              function established; public sustainability report published; community relationships formalized
              through long-term engagement agreements.
            </p>
          </div>
        </div>

        {/* Phase 4 */}
        <div className="mt-6 border-l-4 pl-5" style={{ borderColor: "var(--ink)" }}>
          <div className="small-caps" style={{ fontSize: 10 }}>Phase 4 · Ongoing</div>
          <h3 className="font-display text-ink" style={{ fontSize: 17, fontWeight: 600 }}>
            Integrate with Complementary Frameworks
          </h3>
          <div className="mt-2 font-body text-ink" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <p>
              Align outcomes with applicable industry standards and frameworks:
            </p>
            <ul className="pl-5 mt-2 space-y-1" style={{ listStyle: "disc" }}>
              <li><strong>Indonesian regulation:</strong> UU 32/2009 PPLH; UU 39/1999 HAM; UU 5/1960 Pokok Agraria; Permen LHK 7/2018 AMDAL; Permen ESDM 26/2018 Good Mining Practice; Permen ATR/BPN on land acquisition; RKAB submissions; PPKH/IPPKH procedures.</li>
              <li><strong>Sector-specific:</strong> IRMA Standard for Responsible Mining (mining); RSPO P&C (palm oil); FSC or PEFC (forestry); VCS/CCB (carbon projects).</li>
              <li><strong>International frameworks:</strong> UNGPs on Business & Human Rights; OECD Due Diligence Guidance for Responsible Business Conduct; Voluntary Principles on Security & Human Rights; UN Declaration on the Rights of Indigenous Peoples.</li>
              <li><strong>Financial-sector:</strong> Equator Principles 4; IFC direct-investment appraisal; OJK green-finance taxonomy; TCFD / TNFD disclosures.</li>
            </ul>
            <p className="mt-3 italic text-mute">
              A+CSR offers integrated assessments combining IFC PS, ESG materiality, IRMA readiness, and
              sector-specific frameworks within a single engagement — reducing duplication and ensuring
              consistent findings across lender, regulator, and civil-society audiences.
            </p>
          </div>
        </div>
      </div>

      {/* ========== APPENDIX A — FULL GAP REGISTER ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Appendix A</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Prioritized Gap Register
        </h2>
        <p className="font-body text-mute italic mt-2" style={{ fontSize: 11 }}>
          Complete register of indicators scoring below Established maturity (≤2), ordered by priority.
        </p>

        {allGaps.length === 0 ? (
          <p className="mt-4 text-sage italic font-body" style={{ fontSize: 12 }}>
            No gaps currently identified. (Note: gaps appear as assessment is completed.)
          </p>
        ) : (
          <table className="w-full mt-4" style={{ fontSize: 10 }}>
            <thead>
              <tr style={{ background: "var(--ink)", color: "var(--paper)" }}>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>Pri.</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>ID</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>PS Ref</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>Section</th>
                <th className="text-left py-2 px-2" style={{ fontSize: 9 }}>Requirement</th>
                <th className="text-right py-2 px-2" style={{ fontSize: 9 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {allGaps.map(({ ind, resp, priority }) => (
                <tr key={ind.id} className="hairline print-break-inside-avoid">
                  <td className="py-2 px-2">
                    {priorityDot(priority === "High" ? "var(--crimson)" : "var(--amber)")}
                    <span style={{ fontSize: 9 }}>{priority === "High" ? "H" : "M"}</span>
                  </td>
                  <td className="py-2 px-2 serial-number" style={{ fontSize: 9 }}>{ind.id}</td>
                  <td className="py-2 px-2 text-gold" style={{ fontSize: 9 }}>{PS_META[ind.ps].code} {ind.ref}</td>
                  <td className="py-2 px-2 text-mute">{ind.section}</td>
                  <td className="py-2 px-2 text-ink" style={{ lineHeight: 1.4, maxWidth: 280 }}>
                    {ind.text.substring(0, 180)}{ind.text.length > 180 ? "…" : ""}
                  </td>
                  <td className="text-right py-2 px-2 font-display" style={{ fontSize: 13 }}>{resp.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ========== APPENDIX B — DETAILED FINDINGS ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Appendix B</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Detailed Findings by Indicator
        </h2>
        <p className="font-body text-mute italic mt-2" style={{ fontSize: 11 }}>
          Complete record of scoring with notes and evidence references for every assessed indicator.
        </p>

        {[1, 2, 3, 4, 5, 6, 7, 8].map((psNum) => {
          const psInds = INDICATORS.filter((i) => i.ps === psNum);
          const psAssessed = psInds.filter((i) => responses[i.id]?.score !== undefined);
          if (psAssessed.length === 0) return null;

          return (
            <div key={psNum} className="mt-6">
              <h3 className="font-display text-ink" style={{ fontSize: 16, fontWeight: 600, background: "rgba(13,27,42,0.05)", padding: "6px 10px" }}>
                {PS_META[psNum].code} — {PS_META[psNum].short}
              </h3>
              <div className="mt-2 space-y-2">
                {psAssessed.map((ind) => {
                  const r = responses[ind.id];
                  const isNA = r.score === "NA";
                  const scoreColor = isNA ? "var(--mute)" : r.score >= 3 ? "var(--sage)" : r.score === 2 ? "var(--amber)" : "var(--crimson)";
                  return (
                    <div key={ind.id} className="print-break-inside-avoid py-2" style={{ borderBottom: "1px solid rgba(13,27,42,0.06)" }}>
                      <div className="flex items-baseline gap-2">
                        <span className="serial-number flex-shrink-0" style={{ fontSize: 9, minWidth: 42 }}>{ind.id}</span>
                        <span className="text-gold flex-shrink-0" style={{ fontSize: 9 }}>{ind.ref}</span>
                        <span className="text-ink flex-1" style={{ fontSize: 11, lineHeight: 1.4 }}>{ind.text}</span>
                        <span className="font-display flex-shrink-0" style={{ fontSize: 16, fontWeight: 500, color: scoreColor, minWidth: 28, textAlign: "right" }}>
                          {isNA ? "N/A" : r.score}
                        </span>
                      </div>
                      {(r.notes || r.evidence) && (
                        <div className="mt-1 pl-12 font-body" style={{ fontSize: 10, lineHeight: 1.5 }}>
                          {r.notes && (
                            <div className="text-mute italic">
                              <span className="small-caps text-ink" style={{ fontSize: 9, fontStyle: "normal" }}>Notes:</span>{" "}
                              {r.notes}
                            </div>
                          )}
                          {r.evidence && (
                            <div className="text-mute italic mt-1">
                              <span className="small-caps text-ink" style={{ fontSize: 9, fontStyle: "normal" }}>Evidence:</span>{" "}
                              {r.evidence}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== APPENDIX C — GLOSSARY ========== */}
      <div className="print-page mt-12">
        <div className="small-caps text-gold" style={{ fontSize: 10 }}>Appendix C</div>
        <h2 className="font-display text-ink double-rule pb-2" style={{ fontSize: 28, fontWeight: 500 }}>
          Glossary & References
        </h2>

        <h3 className="font-display text-ink mt-5" style={{ fontSize: 15, fontWeight: 600 }}>
          C.1 Key Terms
        </h3>
        <dl className="mt-3 font-body text-ink" style={{ fontSize: 11, lineHeight: 1.6 }}>
          {[
            ["Affected Communities", "Local communities directly affected by the project; subject of stakeholder engagement, consultation, and grievance mechanism obligations under PS 1."],
            ["Area of Influence", "Area encompassing direct, indirect, and associated impacts of a project, including associated facilities and cumulative impacts."],
            ["BAP (Biodiversity Action Plan)", "Required under PS 6 for projects in critical habitat; sets out mitigation strategy designed to achieve net gains for biodiversity values."],
            ["Cumulative Impacts", "Incremental impacts on areas/resources from the project combined with other existing, planned, or reasonably defined developments."],
            ["ESMS", "Environmental and Social Management System; required under PS 1; incorporates policy, risks/impacts identification, management programs, capacity, emergency response, stakeholder engagement, and monitoring."],
            ["FPIC (Free, Prior & Informed Consent)", "Required under PS 7 in specific circumstances affecting Indigenous Peoples — impacts on customary lands, relocation, critical cultural heritage, or commercial use of their heritage/knowledge."],
            ["GIIP (Good International Industry Practice)", "Exercise of professional skill, diligence, prudence, and foresight reasonably expected from skilled professionals engaged in similar undertakings globally or regionally."],
            ["Grievance Mechanism", "Required under PS 1 (community) and PS 2 (workers); scaled to risks; accessible, transparent, non-retaliatory, and does not impede access to judicial remedies."],
            ["ICP (Informed Consultation & Participation)", "Two-way engagement process required for projects with potentially significant adverse impacts; more in-depth than basic consultation; leads to incorporation of community views in decision-making."],
            ["LRP (Livelihood Restoration Plan)", "Required under PS 5 for projects causing economic displacement; aims to restore or improve income-earning capacity, production levels, and standards of living."],
            ["Mitigation Hierarchy", "Sequence of avoid → minimize → restore → compensate/offset for residual impacts; applied across PS 1, 5, 6, 7, 8."],
            ["RAP (Resettlement Action Plan)", "Required under PS 5 for projects causing physical displacement; covers entitlements, compensation, relocation, host communities, budget, schedule, and M&E."],
            ["Stakeholder Engagement Plan (SEP)", "Required under PS 1; scaled to project risks; includes stakeholder analysis, disclosure, consultation/participation, grievance mechanism, ongoing reporting."],
          ].map(([term, def]) => (
            <div key={term} className="mb-2 print-break-inside-avoid">
              <dt className="font-display text-ink" style={{ fontSize: 11, fontWeight: 600, display: "inline" }}>{term}</dt>
              <dd className="inline text-mute"> — {def}</dd>
            </div>
          ))}
        </dl>

        <h3 className="font-display text-ink mt-6" style={{ fontSize: 15, fontWeight: 600 }}>
          C.2 Primary References
        </h3>
        <ul className="mt-3 font-body text-ink pl-5 space-y-1" style={{ fontSize: 11, lineHeight: 1.55, listStyle: "square" }}>
          <li>International Finance Corporation (2012). <em>Performance Standards on Environmental and Social Sustainability</em>. Effective 1 January 2012.</li>
          <li>International Finance Corporation (2012). <em>Guidance Notes to the Performance Standards</em>.</li>
          <li>World Bank Group. <em>Environmental, Health and Safety Guidelines</em> (General and industry-specific).</li>
          <li>IFC Handbook for Land Acquisition and Involuntary Resettlement.</li>
          <li>UN Guiding Principles on Business and Human Rights (2011).</li>
          <li>OECD Due Diligence Guidance for Responsible Business Conduct (2018).</li>
          <li>Voluntary Principles on Security and Human Rights.</li>
          <li>UN Declaration on the Rights of Indigenous Peoples (2007).</li>
          <li>IUCN Red List of Threatened Species (current edition).</li>
          <li>Equator Principles (EP4, 2020).</li>
          <li>Relevant Indonesian legislation (UU 32/2009 PPLH; UU 5/1960 Agraria; UU 39/1999 HAM; Permen LHK on AMDAL; Permen ESDM 26/2018; etc.).</li>
        </ul>

        <div className="mt-10 p-5 border border-ink" style={{ background: "rgba(13,27,42,0.03)" }}>
          <div className="small-caps text-gold" style={{ fontSize: 10 }}>Important Notice</div>
          <p className="font-body text-ink italic mt-2" style={{ fontSize: 11, lineHeight: 1.6 }}>
            This report is a diagnostic self-assessment prepared using A+CSR Indonesia's proprietary
            assessment instrument. It reflects information provided by the client and does not
            constitute an independent audit, certification, or assurance opinion. Findings should
            be used to inform internal improvement planning and preparation for subsequent
            independent review. A+CSR accepts no liability to third parties who may rely upon the
            contents of this report.
          </p>
        </div>

        <div className="mt-10 text-center">
          <MastheadRule />
          <div className="serial-number mt-2" style={{ fontSize: 10 }}>
            — End of Comprehensive Report —
          </div>
          <div className="font-display italic text-mute mt-2" style={{ fontSize: 11 }}>
            Prepared by A+CSR Indonesia · Jakarta · Bogor
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SETUP PAGE (Metadata + Data Management)
   ============================================================ */

function SetupPage({ meta, setMeta, responses, setResponses, clearAll }) {
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const exportJSON = () => {
    const blob = { meta, responses, exportedAt: new Date().toISOString(), version: "1.0" };
    const str = JSON.stringify(blob, null, 2);
    const file = new Blob([str], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ifc-ps-assessment-${(meta.projectName || "project").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.meta) setMeta(parsed.meta);
      if (parsed.responses) setResponses(parsed.responses);
      setImportMsg("Import successful.");
      setImportText("");
    } catch (err) {
      setImportMsg("Import failed: " + err.message);
    }
  };

  const answered = Object.values(responses).filter((r) => r?.score !== undefined && r?.score !== null).length;

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-8">
        <div className="small-caps text-mute" style={{ fontSize: 10 }}>§ 0</div>
        <h2 className="font-display text-ink" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Assessment Setup
        </h2>
        <p className="font-body text-mute italic mt-1" style={{ fontSize: 13 }}>
          Project metadata is included in the exported report and persists across sessions.
        </p>
      </div>

      <div className="bg-paper border border-rule p-6 ink-shadow mb-6">
        <div className="small-caps text-gold mb-4" style={{ fontSize: 10 }}>Project Identification</div>
        <div className="grid grid-cols-2 gap-5">
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Project Name</span>
            <input
              type="text"
              value={meta.projectName}
              onChange={(e) => setMeta({ ...meta, projectName: e.target.value })}
              placeholder="e.g., Blok Pomalaa Nickel Operations"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Client / Company</span>
            <input
              type="text"
              value={meta.clientName}
              onChange={(e) => setMeta({ ...meta, clientName: e.target.value })}
              placeholder="e.g., PT Vale Indonesia Tbk"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Sector / Sub-sector</span>
            <input
              type="text"
              value={meta.sector}
              onChange={(e) => setMeta({ ...meta, sector: e.target.value })}
              placeholder="e.g., Nickel mining & processing"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Location</span>
            <input
              type="text"
              value={meta.location}
              onChange={(e) => setMeta({ ...meta, location: e.target.value })}
              placeholder="e.g., Kolaka, Southeast Sulawesi"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Lead Assessor</span>
            <input
              type="text"
              value={meta.assessorName}
              onChange={(e) => setMeta({ ...meta, assessorName: e.target.value })}
              placeholder="e.g., Noviansyah Manap, MD A+CSR"
            />
          </label>
          <label className="block">
            <span className="small-caps text-mute" style={{ fontSize: 9 }}>Assessment Date</span>
            <input
              type="date"
              value={meta.assessmentDate}
              onChange={(e) => setMeta({ ...meta, assessmentDate: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="bg-paper border border-rule p-6 ink-shadow mb-6">
        <div className="small-caps text-gold mb-4" style={{ fontSize: 10 }}>Progress</div>
        <div className="flex items-baseline gap-6">
          <div>
            <div className="font-display text-ink" style={{ fontSize: 36, fontWeight: 300 }}>
              {answered}<span className="text-mute-2" style={{ fontSize: 16 }}>/{INDICATORS.length}</span>
            </div>
            <div className="small-caps text-mute" style={{ fontSize: 9 }}>Indicators answered</div>
          </div>
          <div className="flex-1" style={{ height: 6, background: "rgba(13,27,42,0.08)" }}>
            <div style={{ width: `${(answered / INDICATORS.length) * 100}%`, height: "100%", background: "var(--gold)", transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      <div className="bg-paper border border-rule p-6 ink-shadow mb-6">
        <div className="small-caps text-gold mb-4" style={{ fontSize: 10 }}>Data Management</div>
        <p className="font-body text-mute italic mb-4" style={{ fontSize: 12 }}>
          Your assessment is automatically saved to your browser storage. Use the controls below to
          back up, share, or transfer the assessment between devices.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportJSON} className="btn-primary">Export JSON</button>
          <button
            onClick={() => {
              if (confirm("Clear all responses and metadata? This cannot be undone.")) clearAll();
            }}
            className="btn-ghost"
            style={{ borderColor: "var(--crimson)", color: "var(--crimson)" }}
          >
            Clear All
          </button>
        </div>
        <div className="mt-5">
          <label className="small-caps text-mute block" style={{ fontSize: 9 }}>Import from JSON</label>
          <textarea
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste previously exported JSON here...'
            style={{ fontFamily: "monospace", fontSize: 11, marginTop: 4 }}
          />
          <div className="flex gap-3 mt-2 items-center">
            <button onClick={doImport} className="btn-ghost" disabled={!importText}>Import</button>
            {importMsg && (
              <span
                className="font-body italic"
                style={{
                  fontSize: 11,
                  color: importMsg.startsWith("Import successful") ? "var(--sage)" : "var(--crimson)",
                }}
              >
                {importMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

const DEFAULT_META = {
  projectName: "",
  clientName: "",
  sector: "",
  location: "",
  assessorName: "",
  assessmentDate: new Date().toISOString().slice(0, 10),
};

export default function App() {
  const [page, setPage] = useState("overview");
  const [activePS, setActivePS] = useState(1);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [responses, setResponses] = useState({});
  const [esapItems, setEsapItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Inject stylesheet
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE_TAG;
    document.head.appendChild(style);
    document.body.style.backgroundColor = "var(--parchment)";
    return () => { document.head.removeChild(style); };
  }, []);

  // Load from storage on mount
  useEffect(() => {
    try {
      const m = localStorage.getItem(K_META);
      if (m) setMeta({ ...DEFAULT_META, ...JSON.parse(m) });
    } catch {}
    try {
      const r = localStorage.getItem(K_RESP);
      if (r) setResponses(JSON.parse(r));
    } catch {}
    try {
      const e = localStorage.getItem(K_ESAP);
      if (e) setEsapItems(JSON.parse(e));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist meta
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(K_META, JSON.stringify(meta));
    } catch {}
  }, [meta, loaded]);

  // Persist responses (debounced)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(K_RESP, JSON.stringify(responses));
      } catch {}
    }, 400);
  }, [responses, loaded]);

  // Persist ESAP items (debounced)
  const esapSaveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    if (esapSaveTimer.current) clearTimeout(esapSaveTimer.current);
    esapSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(K_ESAP, JSON.stringify(esapItems));
      } catch {}
    }, 400);
  }, [esapItems, loaded]);

  const overall = computeOverall(responses);

  const clearAll = () => {
    setMeta(DEFAULT_META);
    setResponses({});
    setEsapItems([]);
    try {
      localStorage.removeItem(K_META);
      localStorage.removeItem(K_RESP);
      localStorage.removeItem(K_ESAP);
    } catch {}
  };

  return (
    <div className="font-body" style={{ backgroundColor: "var(--parchment)", minHeight: "100vh", color: "var(--ink)" }}>
      <Header meta={meta} overall={overall} />
      <Nav page={page} setPage={setPage} />
      {page === "overview" && (
        <OverviewPage responses={responses} setPage={setPage} setActivePS={setActivePS} />
      )}
      {page === "assessment" && (
        <AssessmentPage
          responses={responses}
          setResponses={setResponses}
          activePS={activePS}
          setActivePS={setActivePS}
        />
      )}
      {page === "scorecards" && <ScorecardsPage responses={responses} setPage={setPage} setActivePS={setActivePS} />}
      {page === "gap" && <GapAnalysisPage responses={responses} setPage={setPage} setActivePS={setActivePS} />}
      {page === "esap" && <ESAPPage esapItems={esapItems} setEsapItems={setEsapItems} responses={responses} meta={meta} />}
      {page === "report" && <ReportPage responses={responses} meta={meta} />}
      {page === "narrative" && <NarrativeReportPage responses={responses} meta={meta} />}
      {page === "setup" && (
        <SetupPage
          meta={meta}
          setMeta={setMeta}
          responses={responses}
          setResponses={setResponses}
          clearAll={clearAll}
        />
      )}
      <footer className="no-print mt-12 py-6 text-center hairline-t" style={{ background: "var(--parchment)" }}>
        <div className="small-caps text-mute-2" style={{ fontSize: 9 }}>
          A+CSR Indonesia · Diagnostic Suite · IFC Performance Standards 2012 · {INDICATORS.length} indicators
        </div>
      </footer>
    </div>
  );
}
