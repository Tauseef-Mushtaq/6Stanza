/**
 * SEO-3 — safe JSON-LD rendering (module spec §17).
 *
 * `JSON.stringify` alone is not safe to drop into a `<script>` tag:
 * CMS text can legally contain `</script>` as a literal substring
 * (e.g. inside a code block or quote), which would otherwise close
 * the script early and break the page. The `<\/script>` escape below
 * is the standard mitigation and keeps the JSON itself byte-for-byte
 * valid — it only affects how the closing tag sequence is written
 * inside the string, not the JSON structure.
 *
 * `dangerouslySetInnerHTML` is the correct, React-documented mechanism
 * for `application/ld+json` (there is no other way to emit a raw
 * `<script>` body in React) — safe here specifically because the input
 * is always a JSON-serialized object built by `structuredData.ts`, not
 * raw unescaped user/CMS HTML.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
