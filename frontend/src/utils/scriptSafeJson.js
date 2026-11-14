// JSON that is safe to inline in generated source, including inside a
// <script> or <script setup> block: a "</script>" or "<!--" in a string,
// "&" entities or U+2028/2029 cannot end the block or break the literal.
// The escapes are ordinary JSON/JS string escapes, so the value is unchanged.
export const scriptSafeJson = (value, space = 2) => JSON.stringify(value, null, space)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');
