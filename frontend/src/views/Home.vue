<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="net" aria-hidden="true" v-html="netField"></div>
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <span class="eyebrow fade-up"><span class="dot"></span>The Agency's design system</span>
          <h1 class="fade-up d1">Unifying the mission; <span class="accent">by design.</span></h1>
          <p class="lede fade-up d2">
            Guidelines, components, tokens, patterns and assets for building digital experiences
            that look, work and feel like one Agency.
          </p>
          <div class="cta fade-up d3">
            <router-link to="/getting-started" class="btn btn-primary">
              <span class="material-symbols-outlined" aria-hidden="true">bolt</span>
              Get started
            </router-link>
            <router-link to="/tokens" class="btn btn-secondary">
              Explore foundations
              <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </router-link>
            <router-link to="/search" class="btn btn-ghost">
              <span class="material-symbols-outlined" aria-hidden="true">search</span>
              Search
            </router-link>
          </div>
          <dl class="meta fade-up d4">
            <div v-for="stat in stats" :key="stat.label" class="m">
              <dd class="n">{{ stat.value }}</dd>
              <dt class="l">
                <span class="material-symbols-outlined" aria-hidden="true">{{ stat.icon }}</span>
                {{ stat.label }}
              </dt>
            </div>
          </dl>
        </div>
        <div class="spot hero-spot fade-up d2" aria-hidden="true" v-html="spot('site/home')"></div>
      </div>
    </section>

    <!-- Foundations -->
    <section class="band">
      <div class="wrap">
        <div class="band-head">
          <div class="band-eyebrow">Foundations</div>
          <h2>Start with the building blocks.</h2>
          <p>Everything every product shares, each documented with the code that ships it.</p>
        </div>
        <div class="grid grid-3">
          <router-link v-for="item in foundations" :key="item.to" :to="item.to" class="tile">
            <div class="spot tile-spot" aria-hidden="true" v-html="spot(item.art)"></div>
            <div class="tile-t">
              {{ item.title }}
              <span class="material-symbols-outlined go" aria-hidden="true">arrow_forward</span>
            </div>
            <p class="tile-d">{{ item.body }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Roles -->
    <section class="band">
      <div class="wrap">
        <div class="band-head">
          <div class="band-eyebrow">For the whole team</div>
          <h2>Something for everyone.</h2>
          <p>One system, three ways in. Whether you compose screens, ship code or study how people work, it meets you where you are.</p>
        </div>
        <div class="grid grid-3">
          <router-link v-for="role in roles" :key="role.to" :to="role.to" class="tile">
            <div class="spot tile-spot" aria-hidden="true" v-html="spot(role.art)"></div>
            <div class="tile-t">
              {{ role.title }}
              <span class="material-symbols-outlined go" aria-hidden="true">arrow_forward</span>
            </div>
            <p class="tile-d">{{ role.body }}</p>
            <div class="tags">
              <span v-for="tag in role.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Live specimens + principles -->
    <section class="band dotted">
      <div class="wrap">
        <div class="band-head">
          <div class="band-eyebrow">Single source of truth</div>
          <h2>What you see is what you build.</h2>
          <p>Every specimen here is styled by the same tokens the apps ship, so the docs can never drift from production. Toggle the theme in the side nav to recolor everything live.</p>
        </div>
        <div class="show">
          <div class="panel">
            <div class="stage">
              <div class="row">
                <button type="button" class="sbtn sbtn-primary">Primary</button>
                <button type="button" class="sbtn sbtn-accent">
                  <span class="material-symbols-outlined" aria-hidden="true">download</span>Accent
                </button>
                <button type="button" class="sbtn sbtn-secondary">Secondary</button>
              </div>
              <div class="row">
                <span class="badge badge-ok">Approved</span>
                <span class="badge badge-warn">Pending</span>
                <span class="badge sens-confidential">
                  <span class="material-symbols-outlined" aria-hidden="true">lock</span>Confidential
                </span>
                <span class="badge type-agent">
                  <span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>Agent
                </span>
              </div>
              <router-link to="/components" class="ec">
                <div class="ec-top">
                  <div class="ec-logo"><span class="material-symbols-outlined" aria-hidden="true">dns</span></div>
                  <div class="min-w-0 flex-1">
                    <div class="ec-title">
                      GitHub
                      <svg class="seal" width="13" height="13" viewBox="0 0 24 24" aria-label="Verified" role="img">
                        <path fill="currentColor" :d="sealPath" />
                        <path d="M8.3 12.2l2.5 2.4 4.8-4.9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                      </svg>
                    </div>
                    <div class="ec-slug-row">
                      <span class="ec-slug">anthropic/github</span>
                      <span class="ec-ver">v2.4.1</span>
                    </div>
                  </div>
                  <span class="badge sens-confidential">
                    <span class="material-symbols-outlined" aria-hidden="true">lock</span>Confidential
                  </span>
                </div>
                <p class="ec-summary">Repositories, issues, pull requests, and code search over the GitHub APIs.</p>
                <div class="row pills">
                  <span class="pill">create_issue</span>
                  <span class="pill">search_code</span>
                  <span class="pill more">+3 tools</span>
                </div>
                <div class="ec-foot">
                  <span class="stat">
                    <span class="material-symbols-outlined" aria-hidden="true">download</span>
                    <b>184k</b> installs
                  </span>
                  <span class="transport">HTTP</span>
                </div>
              </router-link>
            </div>
            <div class="bar">
              <span>Live components</span>
              <span class="mono">tokens</span>
            </div>
          </div>

          <div class="panel">
            <div class="stage">
              <div class="label">The golden rule<span class="ln"></span></div>
              <div class="callout">
                <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
                <div>Color is <b>information, not decoration.</b> One near-black ink, one accent, and semantic signals (status, sensitivity, object type) that each map to a real concept.</div>
              </div>
              <ol class="steps">
                <li><span><b>Load the fonts</b>: one family for prose, a monospace for anything a person or agent would type.</span></li>
                <li><span><b>Include the tokens</b>: link the stylesheet for the full <code>:root</code> set and its dark override.</span></li>
                <li><span><b>Compose the classes</b>: <code>.btn</code>, <code>.badge</code>, <code>.card</code>, <code>.callout</code>, and reference <code>var(--*)</code> for anything new.</span></li>
              </ol>
            </div>
            <div class="bar">
              <span>Principles</span>
              <router-link to="/getting-started/principles" class="bar-link">Read the guide →</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tools -->
    <section class="band">
      <div class="wrap">
        <div class="band-head band-head-split">
          <div>
            <div class="band-eyebrow">Tools</div>
            <h2>Check, generate, convert.</h2>
          </div>
          <router-link to="/tools" class="bar-link">All tools →</router-link>
        </div>
        <div class="tools">
          <router-link v-for="tool in tools" :key="tool.to" :to="tool.to" class="tool">
            <div class="spot tool-spot" aria-hidden="true" v-html="spot(tool.art)"></div>
            <div class="min-w-0">
              <div class="tool-t">{{ tool.title }}</div>
              <div class="tool-d">{{ tool.body }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Go further -->
    <section class="band">
      <div class="wrap">
        <div class="band-head">
          <div class="band-eyebrow">Go further</div>
          <h2>Beyond the basics.</h2>
        </div>
        <div class="grid grid-4">
          <router-link v-for="item in more" :key="item.to" :to="item.to" class="tile tile-sm">
            <div class="spot tile-spot-sm" aria-hidden="true" v-html="spot(item.art)"></div>
            <div class="tile-t">
              {{ item.title }}
              <span class="material-symbols-outlined go" aria-hidden="true">arrow_forward</span>
            </div>
            <p class="tile-d">{{ item.body }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <footer class="wrap foot">
      <span class="foot-name">Design.com</span>
      <span class="foot-spacer"></span>
      <span>Spot illustrations from Trench Coat</span>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

// Trench Coat spot illustrations, inlined so they follow the app's .dark class.
const spots = import.meta.glob('../assets/illustrations/spot/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const spot = (name) => spots[`../assets/illustrations/spot/${name}.svg`] ?? '';

// A seeded scatter of nodes, each joined to its two nearest neighbours.
const makeNetField = ({ w = 1200, h = 560, n = 40, seed = 11 } = {}) => {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const pts = Array.from({ length: n }, () => ({ x: rnd() * w, y: rnd() * h }));
  let edges = '';
  pts.forEach((p, i) => {
    pts
      .map((q, j) => ({ j, d: Math.hypot(q.x - p.x, q.y - p.y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach((o) => {
        if (o.j > i) {
          edges += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${pts[o.j].x.toFixed(1)}" y2="${pts[o.j].y.toFixed(1)}" stroke="var(--ds-net-line)" stroke-width="1"/>`;
        }
      });
  });
  const nodes = pts
    .map((p, i) => {
      const r = i % 5 === 0 ? 4.2 : 2;
      const fill = i % 7 === 0 ? 'var(--ds-accent)' : 'var(--ds-net-node)';
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${fill}"/>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${edges}${nodes}</svg>`;
};

const netField = makeNetField();

// The verified seal: an 11-bump rosette.
const sealPath = (() => {
  const steps = 22;
  let d = '';
  for (let i = 0; i < steps; i++) {
    const a = (Math.PI * 2 * i) / steps - Math.PI / 2;
    const r = i % 2 === 0 ? 11 : 9;
    d += `${i === 0 ? 'M' : 'L'}${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)} `;
  }
  return `${d}Z`;
})();

// Counts come from the router so they stay true as pages are added.
const router = useRouter();
const countUnder = (prefix) =>
  router.getRoutes().filter((r) => r.path.startsWith(prefix) && !r.path.includes(':')).length;

const stats = computed(() => [
  { label: 'Component pages', icon: 'widgets', value: countUnder('/components/') },
  { label: 'Patterns', icon: 'pattern', value: countUnder('/patterns/') },
  { label: 'Tools', icon: 'build', value: countUnder('/tools/') },
  { label: 'Themes', icon: 'contrast', value: 2 },
]);

const foundations = [
  { title: 'Guidelines', to: '/guidelines', art: 'site/guidelines', body: 'Principles and best practices for consistent, accessible interfaces.' },
  { title: 'Components', to: '/components', art: 'foundations/components', body: 'Reusable UI built with accessibility and consistency in mind.' },
  { title: 'Tokens', to: '/tokens', art: 'foundations/tokens', body: 'Color, spacing, type and motion as shared, named decisions.' },
  { title: 'Patterns', to: '/patterns', art: 'foundations/patterns', body: 'Proven solutions for navigation, forms, feedback and data.' },
  { title: 'Fonts', to: '/fonts', art: 'foundations/fonts', body: 'Typefaces, stacks and scales for clear, readable text.' },
  { title: 'Design assets', to: '/design-assets', art: 'foundations/design-assets', body: 'Icons, seals, flags, logos, photos and illustrations.' },
];

const roles = [
  { title: 'For designers', to: '/for-designers', art: 'site/for-designers', tags: ['Color & type', 'Tokens', 'Components'], body: 'The foundations to design with confidence, and components that already match production.' },
  { title: 'For developers', to: '/for-developers', art: 'site/for-developers', tags: ['Components', 'API', 'Testing'], body: 'Components, APIs, snippets and testing tools to build faster with less drift.' },
  { title: 'For researchers', to: '/for-researchers', art: 'research/for-researchers', tags: ['HCD methods', 'Studies', 'Insights'], body: 'HCD methods, studies and insights that inform every design decision.' },
];

const tools = [
  { title: 'Color contrast checker', to: '/tools/color-contrast', art: 'tools/color-contrast-checker', body: 'Check color pairs against WCAG.' },
  { title: 'APCA calculator', to: '/tools/apca-calculator', art: 'tools/apca-calculator', body: 'Perceptual contrast for readability.' },
  { title: 'Color scale generator', to: '/tools/color-scale', art: 'tools/color-scale-generator', body: 'Build even, accessible tonal ramps.' },
  { title: 'Font scale', to: '/tools/font-scale', art: 'tools/font-scale', body: 'Generate a modular type scale.' },
  { title: 'Chart builder', to: '/tools/chart-builder', art: 'tools/chart-builder', body: 'Make on-brand charts from your data.' },
  { title: 'Gradient generator', to: '/tools/gradient-generator', art: 'tools/gradient-generator', body: 'Compose gradients from system colors.' },
];

const more = [
  { title: 'AI', to: '/ai', art: 'ai/artificial-intelligence', body: 'Patterns and components for AI experiences.' },
  { title: 'Laws of UX', to: '/hcd/laws-of-ux', art: 'site/laws-of-ux', body: 'The psychology behind good interfaces.' },
  { title: 'Contribute', to: '/getting-started/contribute', art: 'site/contribute', body: 'Propose, build and improve the system.' },
  { title: 'Roadmap', to: '/roadmap', art: 'site/roadmap-feedback', body: "See what's next and share feedback." },
];
</script>

<style scoped>
.home {
  min-height: 100%;
  background: var(--ds-bg-2);
  color: var(--ds-ink);
}
.wrap {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
}
.spot :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.material-symbols-outlined {
  font-size: 18px;
}

/* hero */
.hero {
  position: relative;
  overflow: hidden;
  background: var(--ds-bg);
  border-bottom: 1px solid var(--ds-line);
}
.net {
  position: absolute;
  inset: 0;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(120% 130% at 88% -6%, #000 0%, #000 32%, rgba(0, 0, 0, .4) 56%, transparent 78%);
  mask-image: radial-gradient(120% 130% at 88% -6%, #000 0%, #000 32%, rgba(0, 0, 0, .4) 56%, transparent 78%);
}
.net :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 40px;
  padding-top: 88px;
  padding-bottom: 92px;
}
.hero-spot {
  width: 300px;
  height: 300px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--ds-accent-ink);
  background: var(--ds-accent-wash);
  border: 1px solid var(--ds-accent-line);
  border-radius: 999px;
  padding: 5px 13px 5px 10px;
}
.eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ds-accent);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ds-accent) 24%, transparent);
}
h1 {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 690;
  letter-spacing: -.04em;
  line-height: 1;
  margin: 22px 0 0;
  max-width: 16ch;
}
h1 .accent {
  color: var(--ds-accent);
}
.lede {
  font-size: clamp(17px, 1.7vw, 20px);
  color: var(--ds-muted);
  margin: 22px 0 0;
  max-width: 56ch;
  line-height: 1.5;
}
.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 560;
  transition: .14s;
  border: 1px solid transparent;
}
.btn-primary {
  background: var(--ds-ink);
  color: var(--ds-on-ink);
}
.btn-primary:hover {
  background: color-mix(in oklch, var(--ds-ink) 86%, var(--ds-accent));
}
.btn-secondary {
  background: var(--ds-paper);
  color: var(--ds-ink);
  border-color: var(--ds-line-strong);
  box-shadow: var(--ds-shadow-sm);
}
.btn-secondary:hover {
  border-color: var(--ds-faint);
}
.btn-ghost {
  color: var(--ds-muted);
}
.btn-ghost:hover {
  background: var(--ds-bg-3);
  color: var(--ds-ink);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  margin: 52px 0 0;
  max-width: 620px;
  border: 1px solid var(--ds-line);
  border-radius: 14px;
  background: color-mix(in oklch, var(--ds-paper) 80%, transparent);
  backdrop-filter: blur(8px);
  overflow: hidden;
}
.meta .m {
  flex: 1;
  min-width: 120px;
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
}
.meta .m + .m {
  border-left: 1px solid var(--ds-line);
}
.meta .n {
  margin: 0;
  font-size: 30px;
  font-weight: 660;
  letter-spacing: -.03em;
}
.meta .l {
  order: 2;
  font-size: 12.5px;
  color: var(--ds-muted);
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.meta .l .material-symbols-outlined {
  font-size: 14px;
  color: var(--ds-accent);
}

/* bands */
.band {
  padding: 76px 0;
  border-bottom: 1px solid var(--ds-line);
}
.band-head {
  max-width: 60ch;
  margin-bottom: 38px;
}
.band-eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--ds-accent-ink);
}
.band-head h2 {
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 660;
  letter-spacing: -.03em;
  line-height: 1.1;
  margin: 10px 0 0;
}
.band-head p {
  font-size: 16px;
  color: var(--ds-muted);
  margin-top: 12px;
  line-height: 1.55;
}

/* tiles */
.grid {
  display: grid;
  gap: 16px;
}
.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}
.tile {
  display: block;
  padding: 26px;
  border: 1px solid var(--ds-line);
  border-radius: 16px;
  background: var(--ds-paper);
  box-shadow: var(--ds-shadow-sm);
  transition: .16s ease;
}
.tile:hover {
  border-color: var(--ds-line-strong);
  box-shadow: var(--ds-shadow-md);
  transform: translateY(-3px);
}
.tile-sm {
  padding: 22px;
}
.tile-spot {
  width: 76px;
  height: 76px;
  margin: -6px 0 10px -6px;
}
.tile-spot-sm {
  width: 60px;
  height: 60px;
  margin: -4px 0 8px -4px;
}
.tile-t {
  font-size: 19px;
  font-weight: 640;
  letter-spacing: -.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tile-sm .tile-t {
  font-size: 17px;
}
.go {
  margin-left: auto;
  color: var(--ds-faint);
  transition: .16s;
}
.tile:hover .go {
  color: var(--ds-accent);
  transform: translateX(3px);
}
.tile-d {
  font-size: 14px;
  color: var(--ds-muted);
  margin-top: 8px;
  line-height: 1.55;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}
.tag {
  font-size: 12px;
  font-weight: 540;
  color: var(--ds-ink-2);
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-line);
  border-radius: 999px;
  padding: 2px 10px;
}

/* showcase panels */
.show {
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 22px;
}
.panel {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ds-line);
  border-radius: 16px;
  background: var(--ds-paper);
  box-shadow: var(--ds-shadow-sm);
  overflow: hidden;
}
.stage {
  flex: 1;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dotted {
  background-image: radial-gradient(var(--ds-grid-node) 1px, transparent 1.4px);
  background-size: 23px 23px;
}
.band-head-split {
  max-width: none;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

/* specimen buttons */
.sbtn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 15px;
  border-radius: 9px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 540;
  letter-spacing: -.01em;
  transition: .13s ease;
}
.sbtn:hover {
  transform: translateY(-1px);
  box-shadow: var(--ds-shadow-md);
}
.sbtn-primary {
  background: var(--ds-ink);
  color: var(--ds-on-ink);
}
.sbtn-accent {
  background: var(--ds-accent);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .16);
}
.sbtn-accent:hover {
  background: var(--ds-accent-ink);
}
.sbtn-secondary {
  background: var(--ds-bg);
  color: var(--ds-ink);
  border-color: var(--ds-line);
  box-shadow: var(--ds-shadow-sm);
}

/* badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--ds-line);
  background: var(--ds-bg);
  color: var(--ds-ink-2);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .01em;
  white-space: nowrap;
}
.badge .material-symbols-outlined {
  font-size: 13px;
}
.badge-ok {
  color: var(--ds-ok);
  background: color-mix(in oklch, var(--ds-ok) 8%, var(--ds-bg));
  border-color: color-mix(in oklch, var(--ds-ok) 24%, var(--ds-bg));
}
.badge-warn {
  color: var(--ds-warn);
  background: color-mix(in oklch, var(--ds-warn) 10%, var(--ds-bg));
  border-color: color-mix(in oklch, var(--ds-warn) 28%, var(--ds-bg));
}
.sens-confidential {
  color: var(--ds-confidential);
  background: color-mix(in oklch, var(--ds-confidential) 8%, var(--ds-bg));
  border-color: color-mix(in oklch, var(--ds-confidential) 26%, var(--ds-bg));
}
.type-agent .material-symbols-outlined {
  color: var(--ds-agent);
}

/* entry card */
.ec {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 17px 18px 15px;
  border: 1px solid var(--ds-line);
  border-radius: 12px;
  background: var(--ds-paper);
  box-shadow: var(--ds-shadow-sm);
  transition: .15s ease;
}
.ec:hover {
  border-color: var(--ds-line-strong);
  box-shadow: var(--ds-shadow-md);
  transform: translateY(-2px);
}
.ec-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.ec-logo {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-line-2);
}
.ec-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -.01em;
}
.seal {
  color: var(--ds-accent);
  flex: none;
}
.ec-slug-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.ec-slug {
  font-family: var(--ds-mono);
  font-size: 12px;
  color: var(--ds-faint);
}
.ec-ver {
  font-family: var(--ds-mono);
  font-size: 10.5px;
  font-weight: 600;
  line-height: 16px;
  color: var(--ds-muted);
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-line-2);
  border-radius: 5px;
  padding: 0 5px;
}
.ec-summary {
  font-size: 13.5px;
  line-height: 1.46;
  color: var(--ds-muted);
}
.pills {
  gap: 6px;
}
.pill {
  font-family: var(--ds-mono);
  font-size: 11.5px;
  color: var(--ds-ink-2);
  background: var(--ds-bg-3);
  padding: 2px 7px;
  border-radius: 5px;
}
.pill.more {
  color: var(--ds-faint);
  background: transparent;
}
.ec-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--ds-line-2);
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--ds-faint);
}
.stat .material-symbols-outlined {
  font-size: 15px;
}
.stat b {
  color: var(--ds-ink-2);
  font-weight: 560;
}
.transport {
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 0 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .04em;
  background: var(--ds-bg-3);
  color: var(--ds-ink-2);
}
.mono {
  font-family: var(--ds-mono);
}

/* tools */
.tools {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px 16px;
}
.tool {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  transition: .12s;
}
.tool:hover {
  background: var(--ds-bg-3);
}
.tool-spot {
  width: 52px;
  height: 52px;
  flex: none;
}
.tool-t {
  font-size: 15px;
  font-weight: 580;
}
.tool:hover .tool-t {
  color: var(--ds-accent-ink);
}
.tool-d {
  font-size: 13px;
  color: var(--ds-muted);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--ds-line);
  background: var(--ds-bg-2);
  font-size: 12.5px;
  color: var(--ds-muted);
}
.bar-link {
  color: var(--ds-accent-ink);
  font-weight: 540;
}
.bar-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ds-faint);
  display: flex;
  align-items: center;
  gap: 9px;
}
.label .ln {
  flex: 1;
  height: 1px;
  background: var(--ds-line-2);
}
.callout {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--ds-accent-line);
  background: var(--ds-accent-wash);
  color: var(--ds-accent-ink);
  font-size: 13.5px;
  line-height: 1.55;
}
.callout b {
  color: var(--ds-ink);
}
.steps {
  counter-reset: s;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
.steps li {
  counter-increment: s;
  display: flex;
  gap: 13px;
  font-size: 14px;
  color: var(--ds-ink-2);
  line-height: 1.55;
}
.steps code {
  font-family: var(--ds-mono);
  font-size: 12.5px;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-line-2);
  border-radius: 5px;
  padding: 1px 6px;
  color: var(--ds-ink-2);
}
.steps li::before {
  content: counter(s);
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--ds-ink);
  color: var(--ds-on-ink);
  font-family: var(--ds-mono);
  font-size: 12px;
  font-weight: 600;
  display: grid;
  place-items: center;
  margin-top: -2px;
}
.steps b {
  color: var(--ds-ink);
  font-weight: 600;
}

/* footer */
.foot {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 40px;
  padding-bottom: 56px;
  color: var(--ds-muted);
  font-size: 13.5px;
}
.foot-name {
  color: var(--ds-ink);
  font-weight: 560;
}
.foot-spacer {
  flex: 1;
}

@keyframes up {
  from { transform: translateY(16px); }
  to { transform: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .fade-up { animation: up .6s cubic-bezier(.2, .7, .3, 1) both; }
  .fade-up.d1 { animation-delay: .05s; }
  .fade-up.d2 { animation-delay: .1s; }
  .fade-up.d3 { animation-delay: .17s; }
  .fade-up.d4 { animation-delay: .26s; }
}

@media (max-width: 1080px) {
  .tools { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .hero-spot { width: 220px; height: 220px; }
}
@media (max-width: 860px) {
  .wrap { padding: 0 22px; }
  .hero-inner { grid-template-columns: 1fr; padding-top: 60px; padding-bottom: 64px; }
  .hero-spot { display: none; }
  .grid-3, .show, .tools { grid-template-columns: 1fr; }
  .band { padding: 56px 0; }
}
@media (max-width: 560px) {
  .grid-4 { grid-template-columns: 1fr; }
}
</style>
