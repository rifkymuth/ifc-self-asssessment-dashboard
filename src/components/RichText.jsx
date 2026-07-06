import { sanitizeHtml } from "../lib/richText";

// Read-only renderer for stored notes/evidence HTML. Sanitizes before injecting.
// Legacy plain-text values are handled by sanitizeHtml (escaped, newlines kept).
export default function RichText({ value, className = "", style }) {
  return (
    <div
      className={`rich-text ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
    />
  );
}
