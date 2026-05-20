export const STYLE_TAG = `
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
