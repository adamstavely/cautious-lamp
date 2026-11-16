// Functional fixes in the smaller tools: the HTML viewer's formatter keeps
// strings/comments/url() intact, font subsetting uses &text=, presets set
// every border-radius corner, placeholder lines hold exactly N words, the
// image compressor is honest about PNG and GIF, the CSS converter evaluates
// simple Sass/Less maths and warns about the rest, % uses a parent size, and
// the SEO, HTML escaper, box shadow and font scale tools report what they do.
import { nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { formatCss, formatJs } from '../src/utils/codeFormat.js';
import { buildSubsetUrl, uniqueCharacters } from '../src/utils/fontSubset.js';
import { layoutPlaceholderLines, lineWidth } from '../src/utils/placeholderLayout.js';
import { countGifFrames, isLossyType, resolveOutputType } from '../src/utils/imageCompress.js';
import { evaluateValue } from '../src/utils/preprocessorValues.js';
import { decodeNamedEntity } from '../src/utils/htmlEntities.js';
import BorderRadiusGenerator from '../src/views/BorderRadiusGenerator.vue';
import SVGPlaceholderTextGenerator from '../src/views/SVGPlaceholderTextGenerator.vue';
import CssConverter from '../src/views/CssConverter.vue';
import PxConverter from '../src/views/PxConverter.vue';
import SEOTaggingGenerator from '../src/views/SEOTaggingGenerator.vue';
import HTMLEscaper from '../src/views/HTMLEscaper.vue';
import BoxShadowGenerator from '../src/views/BoxShadowGenerator.vue';
import FontScale from '../src/views/FontScale.vue';
import FontStack from '../src/views/FontStack.vue';
import HTMLViewer from '../src/views/HTMLViewer.vue';
import { mountView } from './helpers/mountView.js';

let mounted = [];
const mount = async (view) => {
  const m = await mountView(view);
  mounted.push(m);
  return m;
};
afterEach(() => {
  mounted.forEach((m) => m.unmount());
  mounted = [];
});

const parses = (code) => {
  // eslint-disable-next-line no-new-func
  new Function(code);
};

describe('HTML viewer formatter', () => {
  it('keeps semicolons and braces inside JS strings', () => {
    const src = 'const s = "a;b{c}";';
    const out = formatJs(src);
    expect(out).toBe(src);
    expect(() => parses(out)).not.toThrow();
  });

  it('keeps template literals, regexes, comments and for-loops intact', () => {
    const src = 'const t = `x;${ {a:1}.a };y{`; const r = /a;b{2}/g; for (let i=0;i<3;i++){ f(i) } // done; {\nlet x = 1\nlet y = 2';
    const out = formatJs(src);
    expect(() => parses(out)).not.toThrow();
    expect(out).toContain('const t = `x;${ {a:1}.a };y{`;');
    expect(out).toContain('const r = /a;b{2}/g;');
    expect(out).toContain('for (let i=0;i<3;i++) {');
    expect(out).toContain('} // done; {');
    // No-semicolon code keeps its line breaks
    expect(out).toMatch(/let x = 1\nlet y = 2$/);
  });

  it('indents blocks and keeps } else { together', () => {
    const out = formatJs('if (a) { b(); } else { c(); }');
    expect(out).toBe('if (a) {\n  b();\n} else {\n  c();\n}');
  });

  it('keeps data URLs and quoted content in CSS', () => {
    const out = formatCss('a{background:url(data:image/png;base64,AA{});content:"x;y"}');
    expect(out).toBe('a {\n  background:url(data:image/png;base64,AA{});\n  content:"x;y"\n}');
  });

  it('keeps comments and nests @media blocks in CSS', () => {
    const out = formatCss('/* a;b{ */@media (min-width: 1px){a{color:red;margin:0}}');
    expect(out).toContain('/* a;b{ */');
    expect(out).toContain('@media (min-width: 1px) {\n  a {\n    color:red;\n    margin:0\n  }\n}');
  });

  it('formats the active tab through the view', async () => {
    const { state } = await mount(HTMLViewer);
    state.activeTab = 'js';
    state.codeInputs.js = 'const s = "a;b{c}"; f();';
    state.formatCode();
    expect(state.codeInputs.js).toBe('const s = "a;b{c}";\nf();');
  });

  it('asks before resetting a tab, in a dialog', async () => {
    const { state } = await mount(HTMLViewer);
    state.activeTab = 'css';
    state.resetCode();
    expect(state.confirmingReset).toBe(true);
    expect(state.codeInputs.css).not.toBe('');
    state.confirmReset();
    expect(state.codeInputs.css).toBe('');
  });
});

describe('Font stack and subsetting', () => {
  it('subsets with &text= (unique characters) on the css2 API, not &subset=', () => {
    const url = buildSubsetUrl('Open Sans', '700', 'Hello world\n');
    expect(url).toBe(`https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&text=${encodeURIComponent('Helo wrd')}&display=swap`);
    expect(url).not.toContain('subset=');
    expect(uniqueCharacters('aab\tбб')).toBe('abб');
    expect(buildSubsetUrl('Roboto', '400', '')).toBe('https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap');
  });

  it('loads fonts added from "Pairs well with" so the preview can show them', async () => {
    const { state } = await mount(FontStack);
    state.selectFontForStack('Roboto');
    await nextTick();
    state.addToFontStack('Lato');
    await nextTick();
    const hrefs = [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    expect(hrefs.some((h) => h.includes('family=Roboto'))).toBe(true);
    expect(hrefs.some((h) => h.includes('family=Lato'))).toBe(true);
  });

  it('builds the subset URL from the characters typed', async () => {
    const { state } = await mount(FontStack);
    state.selectFontForSubsetting('Roboto');
    state.selectedWeightForSubsetting = '400';
    state.subsetText = 'ABC';
    await nextTick();
    expect(state.subsetUrl).toContain('&text=ABC');
  });
});

describe('Border radius generator', () => {
  it('presets set all four corners while unlocked', async () => {
    const { state } = await mount(BorderRadiusGenerator);
    state.locked = false;
    await nextTick();
    state.setCorner(state.corners[1], 3);
    state.loadPreset(24);
    await nextTick();
    expect(state.cssCode).toBe('border-radius: 24px;');
  });

  it('the unified value sets all corners while unlocked, and corners stay independent', async () => {
    const { state } = await mount(BorderRadiusGenerator);
    state.locked = false;
    await nextTick();
    state.setAllCorners(10);
    expect(state.cssCode).toBe('border-radius: 10px;');
    state.setCorner(state.corners[0], 2);
    await nextTick();
    expect(state.cssCode).toBe('border-radius: 2px 10px 10px 10px;');
  });
});

describe('SVG placeholder text', () => {
  it('lays out exactly the chosen words on every line, within the width', () => {
    for (const [words, lines] of [[1, 3], [12, 1], [20, 1], [20, 10], [8, 3]]) {
      const layout = layoutPlaceholderLines({ words, lines, maxWidth: 600, wordSpacing: 8 });
      expect(layout).toHaveLength(lines);
      layout.forEach((line) => {
        expect(line).toHaveLength(words);
        expect(lineWidth(line, 8)).toBeLessThanOrEqual(600);
      });
    }
  });

  it('the preview and the copied SVG draw the same rects', async () => {
    const { state } = await mount(SVGPlaceholderTextGenerator);
    state.words = 1;
    state.lines = 3;
    await nextTick();
    expect(state.layout.map((l) => l.length)).toEqual([1, 1, 1]);
    const svg = state.generateSVGString();
    expect((svg.match(/<rect /g) || []).length).toBe(state.svgModel.rects.length);
  });
});

describe('Image compressor helpers', () => {
  it('keeps PNG lossless unless a lossy format is chosen, and never writes GIF', () => {
    expect(resolveOutputType('image/png', 'original')).toBe('image/png');
    expect(resolveOutputType('image/jpeg', 'original')).toBe('image/jpeg');
    expect(resolveOutputType('image/gif', 'original')).toBe('image/png');
    expect(resolveOutputType('image/png', 'image/webp')).toBe('image/webp');
    expect(isLossyType('image/png')).toBe(false);
    expect(isLossyType('image/jpeg')).toBe(true);
  });

  it('counts GIF frames so the dropped animation can be reported', () => {
    const frame = [0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0x02, 0x02, 0x44, 0x01, 0x00];
    const gce = [0x21, 0xf9, 0x04, 0, 0, 0, 0, 0x00];
    const header = [...'GIF89a'].map((c) => c.charCodeAt(0));
    const lsd = [1, 0, 1, 0, 0x80, 0, 0]; // global colour table of 2 entries
    const gct = [0, 0, 0, 255, 255, 255];
    const gif = (n) => new Uint8Array([...header, ...lsd, ...gct, ...Array.from({ length: n }, () => [...gce, ...frame]).flat(), 0x3b]);
    expect(countGifFrames(gif(1))).toBe(1);
    expect(countGifFrames(gif(3))).toBe(3);
    expect(countGifFrames(new Uint8Array([1, 2, 3]))).toBe(0);
  });
});

describe('CSS converter: Sass/Less values', () => {
  it('evaluates arithmetic between compatible units', () => {
    expect(evaluateValue('4px * 2').value).toBe('8px');
    expect(evaluateValue('10px + 6px').value).toBe('16px');
    expect(evaluateValue('(30px / 2)').value).toBe('15px');
    expect(evaluateValue('2 * (3px + 1px)').value).toBe('8px');
    expect(evaluateValue('10px - 2px 0 -3px').value).toBe('8px 0 -3px');
  });

  it('leaves CSS syntax alone', () => {
    for (const v of ['12px/1.5 Arial', '1 / 2', 'calc(100% - 10px)', 'translate(-50%, -50%)', 'url(a;b-1+2.png)', '"a + 1"', 'saturate(150%)', 'rgba(0, 0, 0, .5)']) {
      expect(evaluateValue(v)).toEqual({ value: v, warnings: [] });
    }
  });

  it('warns about incompatible units and Sass/Less functions', () => {
    expect(evaluateValue('10px + 2em').warnings[0]).toMatch(/incompatible units/);
    expect(evaluateValue('darken(red, 10%)').warnings[0]).toMatch(/darken\(\) is a Sass\/Less function/);
    expect(evaluateValue('rgba(#ff0000, 0.5)').warnings[0]).toMatch(/rgba\(\)/);
    expect(evaluateValue('percentage(0.5)').warnings).toHaveLength(1);
    expect(evaluateValue('math.div(10px, 2)').warnings).toHaveLength(1);
  });

  it('converts SCSS with maths and reports unevaluated functions', async () => {
    const { state } = await mount(CssConverter);
    state.selectedMode = 'scss-to-css';
    state.cssInput = '$pad: 4px;\n$c: red;\n.a { padding: $pad * 2; color: darken($c, 10%); }';
    state.convertCss();
    expect(state.convertedOutput).toContain('padding: 8px;');
    expect(state.convertedOutput).toContain('color: darken(red, 10%);');
    await new Promise((r) => setTimeout(r, 600));
    expect(state.notice?.message ?? JSON.stringify(state.notice)).toMatch(/darken\(\)/);
  });

  it('converts Less arithmetic', async () => {
    const { state } = await mount(CssConverter);
    state.selectedMode = 'less-to-css';
    state.cssInput = '@w: 10px;\n.a { width: @w + 6px; }';
    state.convertCss();
    expect(state.convertedOutput).toContain('width: 16px;');
  });
});

describe('PX converter percentages', () => {
  it('uses the parent size for width/height percentages in both directions', async () => {
    const { state } = await mount(PxConverter);
    state.selectedMode = 'px-to-percent';
    await nextTick();
    state.percentageContext = 'dimension';
    state.parentSize = 400;
    await nextTick();
    state.pxValue = 100;
    state.convertPxToPercent();
    expect(state.percentValue).toBe(25);
    state.percentValue = 50;
    state.convertPercentToPx();
    expect(state.pxValue).toBe(200);
  });
});

describe('SEO tagging generator', () => {
  it('JSON-LD includes image and site name; twitter card follows the image', async () => {
    const { state } = await mount(SEOTaggingGenerator);
    state.formData.title = 'T';
    state.formData.siteName = 'My Site';
    state.generate();
    expect(state.output).toContain('<meta name="twitter:card" content="summary">');
    expect(state.output).toContain('"isPartOf"');
    expect(state.output).toContain('"name": "My Site"');
    state.formData.image = 'https://example.com/a.jpg';
    state.generate();
    expect(state.output).toContain('content="summary_large_image"');
    expect(state.output).toContain('"image": "https://example.com/a.jpg"');
  });
});

describe('HTML escaper', () => {
  it('decodes every HTML named entity, and keeps unknown ones', async () => {
    expect(decodeNamedEntity('hearts')).toBe('♥');
    expect(decodeNamedEntity('Alpha')).toBe('Α');
    expect(decodeNamedEntity('notanentity')).toBeNull();
    expect(decodeNamedEntity('notit')).toBeNull(); // legacy prefix match
    expect(decodeNamedEntity('<img')).toBeNull();
    const { state } = await mount(HTMLEscaper);
    state.conversionMode = 'unescape';
    state.inputText = '&hearts; &rarr; &zeta; &bogus; &amp;lt; &#x41;';
    await nextTick();
    expect(state.outputText).toBe('♥ → ζ &bogus; &lt; A');
  });
});

describe('Box shadow generator', () => {
  it('shows errors for a cleared opacity or invalid colour and keeps the last valid values', async () => {
    const { state } = await mount(BoxShadowGenerator);
    const shadow = state.shadows[0];
    expect(state.cssCode).toContain('rgba(0, 0, 0, 0.05)');
    shadow.opacity = '';
    shadow.color = 'nope';
    await nextTick();
    expect(state.opacityError(shadow)).toMatch(/0 to 1/);
    expect(state.colorError(shadow)).toMatch(/hex colour/);
    expect(state.cssCode).toContain('rgba(0, 0, 0, 0.05)');
    shadow.opacity = 1.5;
    expect(state.opacityError(shadow)).not.toBe('');
    shadow.color = '#f00';
    shadow.opacity = 0.5;
    await nextTick();
    expect(state.colorError(shadow)).toBe('');
    expect(state.cssCode).toContain('rgba(255, 0, 0, 0.5)');
  });
});

describe('Font scale', () => {
  it('says when the base size or ratio is clamped', async () => {
    const { state } = await mount(FontScale);
    expect(state.fontSizeError).toBe('');
    state.fontSize = 100;
    await nextTick();
    expect(state.fontSizeError).toMatch(/72px/);
    expect(state.computedTypographyScale.body).toBe(72);
    state.selectedRatio = 'custom';
    state.customRatio = 3;
    await nextTick();
    expect(state.customRatioError).toMatch(/uses 2/);
    state.customRatio = 1.5;
    await nextTick();
    expect(state.customRatioError).toBe('');
  });
});
