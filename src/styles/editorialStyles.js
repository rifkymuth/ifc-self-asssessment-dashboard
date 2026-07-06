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

  .font-display { font-family: 'Fraunces', 'Playfair Display', Georgia, serif; }
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
    font-weight: 400;
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

  /* Rich-text editor (Notes / Evidence) */
  .rich-editor {
    margin-top: 4px;
    border: 1px solid rgba(13,27,42,0.2);
    background: var(--paper);
    transition: border-color 0.15s;
  }
  .rich-editor:focus-within { border-color: var(--ink); }
  .rich-toolbar {
    display: flex;
    gap: 2px;
    padding: 4px 6px;
    border-bottom: 1px solid rgba(13,27,42,0.12);
    background: rgba(13,27,42,0.03);
  }
  .rich-tb-btn {
    min-width: 26px;
    padding: 2px 7px;
    font-size: 11px;
    line-height: 1.4;
    color: var(--mute);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.12s;
  }
  .rich-tb-btn:hover { color: var(--ink); border-color: rgba(13,27,42,0.2); }
  .rich-tb-btn.is-active {
    color: var(--ink);
    background: var(--gold-wash, #F5E6CB);
    border-color: var(--gold, #B08D2E);
  }
  .rich-editor-surface .ProseMirror {
    min-height: 8.5rem;              /* ~6 rows */
    max-height: 24rem;
    overflow-y: auto;
    resize: vertical;
    padding: 8px 12px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    line-height: 1.5;
    color: var(--ink);
    white-space: pre-wrap;
    outline: none;
  }
  .rich-editor-surface .ProseMirror p { margin: 0 0 0.4em; }
  .rich-editor-surface .ProseMirror p:last-child { margin-bottom: 0; }
  .rich-editor-surface .ProseMirror ul,
  .rich-editor-surface .ProseMirror ol { margin: 0 0 0.4em 0; padding-left: 1.4em; }
  .rich-editor-surface .ProseMirror ul { list-style: disc outside; }
  .rich-editor-surface .ProseMirror ol { list-style: decimal outside; }
  .rich-editor-surface .ProseMirror li p { margin: 0; }
  /* Placeholder (empty editor) */
  .rich-editor-surface .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    height: 0;
    color: var(--mute-2);
    font-style: italic;
    pointer-events: none;
  }

  /* Read-only rendered notes/evidence in the report views */
  .rich-text { white-space: pre-wrap; }
  .rich-text p { margin: 0 0 0.35em; }
  .rich-text p:last-child { margin-bottom: 0; }
  .rich-text ul, .rich-text ol { margin: 0.15em 0 0.35em 0; padding-left: 1.4em; }
  .rich-text ul { list-style: disc outside; }
  .rich-text ol { list-style: decimal outside; }
  .rich-text li { margin: 0; }
  .rich-text li p { margin: 0; }
  .rich-text strong, .rich-text b { font-weight: 600; }
  .rich-text blockquote {
    margin: 0.2em 0;
    padding-left: 0.7em;
    border-left: 2px solid var(--gold, #B08D2E);
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
