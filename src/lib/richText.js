// Helpers for the rich-text (HTML) notes/evidence fields.
//
// Notes/evidence used to be plain-text strings; they now hold HTML produced by
// the TipTap editor (see components/RichTextEditor.jsx). These helpers keep the
// two worlds compatible: legacy plain-text values still render sensibly, HTML is
// sanitized before it ever reaches dangerouslySetInnerHTML, and any consumer that
// needs raw text (truncation, AI prompts) can strip back down to plain text.

import DOMPurify from "dompurify";

// Tags the report views are allowed to render. Everything the editor can emit
// (bold/italic/lists/paragraphs/headings/blockquote) plus <br>.
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "blockquote", "h3", "h4",
];

const hasTags = (value) => /<[a-z][\s\S]*>/i.test(value);

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Returns a safe HTML string for dangerouslySetInnerHTML.
// - Legacy plain text (no tags) is escaped and its newlines become <br>.
// - HTML is passed through DOMPurify with the allowlist above.
export const sanitizeHtml = (value) => {
  if (!value) return "";
  const str = String(value);
  if (!hasTags(str)) {
    return escapeHtml(str).replace(/\r\n|\r|\n/g, "<br>");
  }
  return DOMPurify.sanitize(str, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
};

// Strips all markup and decodes entities, yielding plain text.
// Used where the value is consumed as text (Gap Analysis preview, ESAP/AI prompt).
export const toPlainText = (value) => {
  if (!value) return "";
  const str = String(value);
  if (!hasTags(str)) return str;
  const doc = new DOMParser().parseFromString(str, "text/html");
  // Turn block/line boundaries into newlines so structure survives the flatten.
  doc.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  doc.querySelectorAll("p, li, h3, h4, blockquote").forEach((el) => {
    el.append("\n");
  });
  return (doc.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
};

// True when the value has no visible content — "", whitespace, or empty markup
// like "<p></p>". Lets report/toggle conditionals hide genuinely-empty fields.
export const isEmptyHtml = (value) => {
  if (!value) return true;
  return toPlainText(value).trim() === "";
};
