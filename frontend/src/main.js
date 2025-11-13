// Initialize OpenTelemetry BEFORE importing Vue
// This ensures all modules are instrumented
import { initializeFrontendOpenTelemetry } from './observability/opentelemetry';

// Initialize OpenTelemetry
if (import.meta.env.VITE_OTEL_ENABLED !== 'false') {
  initializeFrontendOpenTelemetry().catch((err) => {
    console.error('Failed to initialize OpenTelemetry:', err);
  });
}

import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import { checkFeatureFlagGuard } from './router/featureFlagGuards';
import { checkRbacGuard } from './router/rbacGuards';

// Initialize dark mode before creating Vuetify
const initDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  let isDark = false;
  
  if (saved !== null) {
    isDark = saved === 'true';
  } else {
    // Check system preference
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return isDark ? 'dark' : 'light';
};

// Initialize user role to design_system_manager for full access
const initUserRole = () => {
  // Allow override via query param, otherwise set to design_system_manager
  const urlParams = new URLSearchParams(window.location.search);
  const overrideRole = urlParams.get('role');
  
  if (overrideRole) {
    localStorage.setItem('userRole', overrideRole);
  } else {
    // Always set to design_system_manager for full access to all pages
    localStorage.setItem('userRole', 'design_system_manager');
  }
  
  // Set userId if not already set (required for RBAC guards)
  if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', 'admin-user');
  }
};

const initialTheme = initDarkMode();
initUserRole();

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        colors: {
          primary: '#4f46e5', // indigo-600
          secondary: '#6366f1', // indigo-500
          background: '#ffffff',
          surface: '#ffffff',
        },
      },
      dark: {
        colors: {
          primary: '#818cf8', // indigo-400 (lighter for dark mode)
          secondary: '#6366f1', // indigo-500
          background: '#0f172a', // slate-900
          surface: '#1e293b', // slate-800
        },
      },
    },
  },
  defaults: {
    global: {
      ripple: false,
    },
    VMain: {
      style: 'background: transparent;',
    },
    VApp: {
      style: 'background: transparent;',
    },
    VSwitch: {
      color: 'primary',
    },
    VCheckbox: {
      color: 'primary',
    },
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue'),
    },
    {
      path: '/fonts',
      component: () => import('./views/Fonts.vue'),
    },
    {
      path: '/fonts/scale',
      redirect: '/tools/font-scale',
    },
    {
      path: '/fonts/stack',
      redirect: '/tools/font-stack',
    },
    {
      path: '/tools/font-subsetting',
      redirect: '/tools/font-stack',
    },
    {
      path: '/fonts/subsetting',
      redirect: '/tools/font-stack',
    },
    {
      path: '/fonts/library',
      redirect: '/design-assets/font-library',
    },
    {
      path: '/font/:fontName',
      component: () => import('./components/font-previewer/FontDetail.vue'),
    },
    {
      path: '/review',
      component: () => import('./views/Review.vue'),
    },
    {
      path: '/review/my-requests',
      component: () => import('./views/ReviewKanban.vue'),
    },
    {
      path: '/review/management',
      component: () => import('./views/AdminDashboard.vue'),
    },
    {
      path: '/review/:id',
      component: () => import('./views/ReviewPage.vue'),
    },
    {
      path: '/review/:id/preview',
      component: () => import('./views/FullScreenPreview.vue'),
    },
    {
      path: '/admin',
      component: () => import('./views/Admin.vue'),
    },
    {
      path: '/ai',
      component: () => import('./views/AI.vue'),
    },
    {
      path: '/ai/overview',
      component: () => import('./views/AIOverview.vue'),
    },
    {
      path: '/ai/patterns',
      component: () => import('./views/AIPatterns.vue'),
    },
    {
      path: '/ai/components',
      component: () => import('./views/AIComponents.vue'),
    },
    {
      path: '/components',
      component: () => import('./views/Components.vue'),
    },
    {
      path: '/components/loupe',
      component: () => import('./views/LoupeTool.vue'),
    },
    {
      path: '/components/status',
      component: () => import('./views/ComponentStatus.vue'),
    },
    {
      path: '/components/buttons',
      component: () => import('./views/ComponentButton.vue'),
    },
    {
      path: '/components/export',
      component: () => import('./views/ComponentLibraryExport.vue'),
    },
    {
      path: '/components/color-picker',
      component: () => import('./views/ComponentColorPicker.vue'),
    },
    {
      path: '/components/testing',
      component: () => import('./views/ComponentTesting.vue'),
    },
    {
      path: '/components/documentation',
      component: () => import('./views/DocumentationGenerator.vue'),
    },
    {
      path: '/review/handoff',
      component: () => import('./views/HandoffTools.vue'),
    },
    {
      path: '/governance',
      redirect: '/admin/governance',
    },
    {
      path: '/notifications',
      component: () => import('./views/ChangeNotifications.vue'),
    },
    {
      path: '/ai-suggestions',
      component: () => import('./views/AISuggestions.vue'),
    },
    {
      path: '/brands',
      component: () => import('./views/MultiBrand.vue'),
    },
    {
      path: '/theme-builder',
      component: () => import('./views/ThemeBuilder.vue'),
    },
    {
      path: '/components/composition',
      component: () => import('./views/ComponentComposition.vue'),
    },
    {
      path: '/components/deprecation',
      component: () => import('./views/DeprecationManager.vue'),
    },
    {
      path: '/components/dependencies',
      redirect: '/admin/dependencies',
    },
    {
      path: '/admin/dependencies',
      component: () => import('./views/ComponentDependencyGraph.vue'),
    },
    {
      path: '/components/feedback',
      redirect: '/feedback',
    },
    {
      path: '/feedback',
      component: () => import('./views/RoadmapFeedback.vue'),
    },
    {
      path: '/roadmap',
      redirect: '/feedback',
    },
    {
      path: '/api',
      component: () => import('./views/DesignSystemAPI.vue'),
    },
    {
      path: '/search',
      redirect: '/',
    },
    {
      path: '/health',
      redirect: '/admin/health',
    },
    {
      path: '/admin',
      component: () => import('./views/Admin.vue'),
    },
    {
      path: '/admin/health',
      component: () => import('./views/SystemHealth.vue'),
    },
    {
      path: '/admin/governance',
      component: () => import('./views/Governance.vue'),
    },
    {
      path: '/admin/audit',
      component: () => import('./views/AuditLogs.vue'),
    },
    {
      path: '/admin/roles',
      component: () => import('./views/RoleManagement.vue'),
    },
    {
      path: '/admin/feature-flags',
      component: () => import('./views/FeatureFlags.vue'),
    },
      {
        path: '/admin/content',
        component: () => import('./views/ContentManagement.vue'),
      },
      {
        path: '/components/scaffold',
        component: () => import('./views/ComponentScaffoldingWizard.vue'),
      },
      {
        path: '/admin/applications',
        component: () => import('./views/ApplicationManagement.vue'),
      },
    {
      path: '/admin/workspaces',
      component: () => import('./views/WorkspaceManagement.vue'),
    },
    {
      path: '/admin/workspaces/:id',
      component: () => import('./views/WorkspaceDetail.vue'),
    },
    {
      path: '/admin/users',
      component: () => import('./views/UserManagement.vue'),
    },
      {
        path: '/admin/applications/register',
        component: () => import('./views/ApplicationRegistration.vue'),
      },
    {
      path: '/tokens',
      component: () => import('./views/Tokens.vue'),
    },
    {
      path: '/tokens/studio',
      component: () => import('./views/TokenStudio.vue'),
    },
    {
      path: '/tokens/library',
      component: () => import('./views/StyleLibrary.vue'),
    },
    {
      path: '/tokens/playground',
      component: () => import('./views/TokenPlayground.vue'),
    },
      {
        path: '/tokens/migration',
        component: () => import('./views/TokenMigration.vue'),
      },
      {
        path: '/tokens/relationships',
        component: () => import('./views/TokenRelationships.vue'),
      },
    {
      path: '/tokens/sync',
      component: () => import('./views/TokenSync.vue'),
    },
    {
      path: '/design-sync',
      component: () => import('./views/DesignSync.vue'),
    },
    {
      path: '/patterns',
      component: () => import('./views/Patterns.vue'),
    },
    {
      path: '/patterns/status',
      component: () => import('./views/PatternStatus.vue'),
    },
    {
      path: '/patterns/navigation',
      component: () => import('./views/PatternNavigation.vue'),
    },
    {
      path: '/patterns/data-display',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/layout',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/forms',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/feedback',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/form-validation',
      component: () => import('./views/PatternCodeSnippet.vue'),
    },
    {
      path: '/patterns/accessible-modal',
      component: () => import('./views/PatternCodeSnippet.vue'),
    },
    {
      path: '/patterns/sortable-data-table',
      component: () => import('./views/PatternCodeSnippet.vue'),
    },
    {
      path: '/patterns/login-form',
      component: () => import('./views/PatternCodeSnippet.vue'),
    },
    {
      path: '/patterns/responsive-navigation',
      component: () => import('./views/PatternCodeSnippet.vue'),
    },
    {
      path: '/patterns/toast-notification',
      component: () => import('./views/PatternCodeSnippet.vue'),
    },
    {
      path: '/tools/gradient-generator',
      component: () => import('./views/GradientGenerator.vue'),
    },
    {
      path: '/tools/lorem-ipsum',
      component: () => import('./views/LoremIpsumGenerator.vue'),
    },
    {
      path: '/tools/seo-tagging',
      component: () => import('./views/SEOTaggingGenerator.vue'),
    },
    {
      path: '/tools/color-scale',
      component: () => import('./views/ColorScaleGenerator.vue'),
    },
    {
      path: '/tools/color-converter',
      component: () => import('./views/ColorConverter.vue'),
    },
    {
      path: '/tools/color-contrast',
      component: () => import('./views/ColorContrastChecker.vue'),
    },
    {
      path: '/tools/nasa-tlx',
      component: () => import('./views/NASA-TLX.vue'),
    },
    {
      path: '/tools/sus',
      component: () => import('./views/SystemUsabilityScale.vue'),
    },
    {
      path: '/tools/png-to-ico',
      component: () => import('./views/PNGToICO.vue'),
    },
    {
      path: '/tools/alt-text-generator',
      component: () => import('./views/AltTextGenerator.vue'),
    },
    {
      path: '/tools/heuristic-evaluation',
      component: () => import('./views/HeuristicEvaluation.vue'),
    },
    {
      path: '/tools/font-scale',
      component: () => import('./views/FontScale.vue'),
    },
    {
      path: '/tools/font-stack',
      component: () => import('./views/FontStack.vue'),
    },
    {
      path: '/tools/visual-regression',
      component: () => import('./views/VisualRegression.vue'),
    },
    {
      path: '/tools/visual-regression/:id',
      component: () => import('./views/VisualRegressionProject.vue'),
    },
    {
      path: '/tools/visual-regression/:id/runs/:runId',
      component: () => import('./views/VisualRegressionResults.vue'),
    },
    {
      path: '/hcd/session-replay/:id/sessions/:sessionId',
      component: () => import('./views/SessionReplayViewer.vue'),
    },
    {
      path: '/hcd/session-replay/:id/sessions',
      component: () => import('./views/SessionReplayProject.vue'),
    },
    {
      path: '/hcd/session-replay/:id',
      component: () => import('./views/SessionReplayProject.vue'),
    },
    {
      path: '/hcd/session-replay',
      component: () => import('./views/SessionReplay.vue'),
    },
    {
      path: '/tools/photosensitivity',
      component: () => import('./views/PhotosensitivityAnalysis.vue'),
    },
    {
      path: '/performance',
      redirect: '/admin/performance',
    },
    {
      path: '/performance/budgets',
      redirect: '/admin/performance',
    },
    {
      path: '/performance/bundle-analysis',
      redirect: '/admin/performance',
    },
    {
      path: '/admin/performance',
      component: () => import('./views/PerformanceAnalysis.vue'),
    },
    {
      path: '/tools',
      component: () => import('./views/Tools.vue'),
    },
    {
      path: '/research',
      component: () => import('./views/ResearchRepo.vue'),
    },
    {
      path: '/research/user-personas',
      component: () => import('./views/UserPersonaGenerator.vue'),
    },
    {
      path: '/research/journey-maps',
      component: () => import('./views/JourneyMaps.vue'),
    },
    {
      path: '/research/hcd-reports',
      component: () => import('./views/HcdReports.vue'),
    },
    {
      path: '/research/user-studies',
      component: () => import('./views/UserStudies.vue'),
    },
    {
      path: '/research/artifacts',
      component: () => import('./views/ResearchArtifacts.vue'),
    },
    {
      path: '/research/insights',
      component: () => import('./views/ResearchInsights.vue'),
    },
    {
      path: '/hcd/principles',
      component: () => import('./views/HcdPrinciples.vue'),
    },
    {
      path: '/hcd/research',
      component: () => import('./views/HcdResearch.vue'),
    },
    {
      path: '/hcd/accessibility',
      component: () => import('./views/HcdAccessibility.vue'),
    },
    {
      path: '/hcd/laws-of-ux',
      component: () => import('./views/LawsOfUX.vue'),
    },
    {
      path: '/hcd/laws-of-ux/:id',
      component: () => import('./views/LawDetail.vue'),
    },
    {
      path: '/hcd/process',
      component: () => import('./views/HcdProcess.vue'),
    },
    {
      path: '/hcd/recruiting-users',
      component: () => import('./views/RecruitingUsers.vue'),
    },
    {
      path: '/hcd/conducting-interviews',
      component: () => import('./views/ConductingInterviews.vue'),
    },
    {
      path: '/hcd/research-reports',
      component: () => import('./views/ResearchReports.vue'),
    },
    {
      path: '/hcd/research-methods',
      component: () => import('./views/ResearchMethods.vue'),
    },
    {
      path: '/design-assets',
      component: () => import('./views/DesignAssets.vue'),
    },
    {
      path: '/design-assets/icons',
      component: () => import('./views/IconLibrary.vue'),
    },
    {
      path: '/design-assets/country-flags',
      component: () => import('./views/CountryFlags.vue'),
    },
    {
      path: '/design-assets/usg-seals',
      component: () => import('./views/USGSeals.vue'),
    },
    {
      path: '/design-assets/internal-seals',
      component: () => import('./views/InternalSeals.vue'),
    },
    {
      path: '/design-assets/interactives',
      component: () => import('./views/Interactives.vue'),
    },
    {
      path: '/design-assets/stock-photos',
      component: () => import('./views/StockPhotos.vue'),
    },
    {
      path: '/design-assets/illustrations',
      component: () => import('./views/Illustrations.vue'),
    },
    {
      path: '/design-assets/capability-logos',
      component: () => import('./views/CapabilityLogos.vue'),
    },
    {
      path: '/design-assets/company-logos',
      component: () => import('./views/CompanyLogos.vue'),
    },
    {
      path: '/design-assets/font-library',
      component: () => import('./views/FontLibrary.vue'),
    },
    {
      path: '/getting-started',
      component: () => import('./views/GettingStarted.vue'),
    },
    {
      path: '/getting-started/why-design-system',
      component: () => import('./views/WhyDesignSystem.vue'),
    },
    {
      path: '/getting-started/principles',
      component: () => import('./views/DesignPrinciples.vue'),
    },
    {
      path: '/getting-started/themes',
      component: () => import('./views/DesignThemes.vue'),
    },
    {
      path: '/getting-started/contribute',
      component: () => import('./views/Contribute.vue'),
    },
    {
      path: '/getting-started/quick-start',
      component: () => import('./views/QuickStart.vue'),
    },
    {
      path: '/getting-started/installation',
      component: () => import('./views/Installation.vue'),
    },
    {
      path: '/getting-started/best-practices',
      component: () => import('./views/BestPractices.vue'),
    },
    {
      path: '/getting-started/resources',
      component: () => import('./views/Resources.vue'),
    },
    {
      path: '/getting-started/support',
      component: () => import('./views/Support.vue'),
    },
    {
      path: '/getting-started/foundations/atomic-design',
      component: () => import('./views/AtomicDesign.vue'),
    },
    {
      path: '/getting-started/foundations/building-trust',
      component: () => import('./views/BuildingTrust.vue'),
    },
    {
      path: '/getting-started/foundations/responsiveness',
      component: () => import('./views/Responsiveness.vue'),
    },
    {
      path: '/getting-started/foundations/usability',
      component: () => import('./views/Usability.vue'),
    },
    {
      path: '/getting-started/foundations/writing-content',
      component: () => import('./views/WritingContent.vue'),
    },
    {
      path: '/getting-started/purpose-and-benefits',
      component: () => import('./views/PurposeAndBenefits.vue'),
    },
    {
      path: '/getting-started/get-in-touch',
      component: () => import('./views/GetInTouch.vue'),
    },
    {
      path: '/getting-started/adopt',
      component: () => import('./views/Adopt.vue'),
    },
    {
      path: '/getting-started/improving-ux-through-acquisition',
      component: () => import('./views/ImprovingUXThroughAcquisition.vue'),
    },
    {
      path: '/guidelines',
      component: () => import('./views/Guidelines.vue'),
    },
    {
      path: '/palette-builder',
      component: () => import('./views/Wizard.vue'),
    },
    {
      path: '/admin/accessibility-reports',
      component: () => import('./views/AccessibilityReports.vue'),
    },
    // Legacy route redirect
    {
      path: '/gradient-generator',
      redirect: '/tools/gradient-generator',
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('./views/NotFound.vue'),
    },
  ],
});

// Add feature flag and RBAC guards to router
router.beforeEach(async (to, from, next) => {
  // First check feature flags
  const featureFlagResult = await checkFeatureFlagGuard(to);
  if (featureFlagResult !== true) {
    next(featureFlagResult);
    return;
  }
  
  // Then check RBAC permissions
  const rbacResult = await checkRbacGuard(to);
  if (rbacResult === true) {
    next();
  } else {
    next(rbacResult);
  }
});

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount('#app');
