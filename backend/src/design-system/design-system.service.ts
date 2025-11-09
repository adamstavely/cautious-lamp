import { Injectable, UnauthorizedException, Optional, Inject, forwardRef } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ComplianceScannerService, ScannerContext } from './compliance-scanner.service';
import { ApplicationScannerService, ApplicationScanContext } from './application-scanner.service';
import { VisualRegressionService } from '../visual-regression/visual-regression.service';
import { SessionReplayService } from '../session-replay/session-replay.service';
import { AnalyticsService } from '../analytics/analytics.service';

export interface Token {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
}

export interface ComponentVariant {
  name: string;
  description?: string;
  properties: {
    backgroundColor?: string; // Token reference or color value
    textColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    hover?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    active?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    disabled?: {
      backgroundColor?: string;
      textColor?: string;
      opacity?: string;
    };
  };
  generatedCode?: {
    vue?: string;
    react?: string;
    html?: string;
  };
}

export interface Component {
  id: string;
  name: string;
  description: string;
  status: 'production' | 'in-progress' | 'planned' | 'deprecated';
  props: ComponentProp[];
  code: {
    vue: string;
    react: string;
    html?: string;
  };
  dependencies?: string[];
  examples?: string[];
  accessibility?: {
    wcag: string;
    notes?: string;
  };
  variants?: ComponentVariant[]; // Custom variants created via builder
  workspaceId?: string; // Workspace/team this component belongs to
  sharedWith?: string[]; // Workspace IDs this component is shared with
  isGlobal?: boolean; // If true, available to all workspaces
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface ApplicationCapabilities {
  governance?: {
    enabled: boolean;
    rules?: string[]; // Specific rules to run (empty = all enabled rules)
    scanSchedule?: 'manual' | 'daily' | 'weekly' | 'on-commit';
    lastScan?: Date;
  };
  visualRegression?: {
    enabled: boolean;
    projectId?: string; // Link to visual regression project
    argosProjectId?: string;
    argosBaseUrl?: string;
    argosBranch?: string;
    lastRun?: Date;
  };
  sessionReplay?: {
    enabled: boolean;
    projectId?: string; // Link to session replay project
    openreplayProjectKey?: string;
    openreplayBaseUrl?: string;
    privacySettings?: {
      maskAllInputs?: boolean;
      maskAllText?: boolean;
      respectDoNotTrack?: boolean;
    };
  };
}

export interface ApplicationMetadata {
  environment?: 'development' | 'staging' | 'production';
  framework?: string;
  language?: string;
  tags?: string[];
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  repository?: string;
  version?: string;
  designSystemVersion?: string; // Design system version this application is using
  applicationUrl?: string;
  teamId?: string;
  workspaceId?: string; // Workspace/team this application belongs to
  registeredAt: Date;
  updatedAt: Date;
  lastScanned?: Date;
  capabilities?: ApplicationCapabilities;
  metadata?: ApplicationMetadata;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  addedAt: Date;
  addedBy: string;
}

export interface WorkspaceFont {
  id: string;
  name: string;
  family: string;
  weights: string[];
  styles: string[];
  source: 'google' | 'custom' | 'system';
  url?: string; // For custom fonts
  fallback?: string;
  workspaceId: string;
  sharedWith?: string[]; // Workspace IDs this font is shared with
  isGlobal?: boolean; // If true, available to all workspaces
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceAsset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'illustration' | 'logo' | 'other';
  url: string;
  thumbnailUrl?: string;
  size?: number; // File size in bytes
  format?: string; // e.g., 'svg', 'png', 'jpg'
  workspaceId: string;
  sharedWith?: string[]; // Workspace IDs this asset is shared with
  isGlobal?: boolean; // If true, available to all workspaces
  tags?: string[];
  description?: string;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceToken {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[]; // Workspace IDs this token is shared with
  isGlobal?: boolean; // If true, available to all workspaces
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceReview {
  id: string;
  title: string;
  description?: string;
  status?: 'pending' | 'in-review' | 'approved' | 'rejected';
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceSessionReplay {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  sessionId?: string;
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceJourneyMap {
  id: string;
  title: string;
  description?: string;
  persona?: string;
  stages?: Array<{ name: string; description?: string }>;
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceHcdReport {
  id: string;
  title: string;
  description?: string;
  reportType?: 'usability' | 'accessibility' | 'heuristic' | 'user-research' | 'other';
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceUserPersona {
  id: string;
  name: string;
  description?: string;
  demographics?: Record<string, any>;
  goals?: string[];
  painPoints?: string[];
  behaviors?: string[];
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceResearchArtifact {
  id: string;
  title: string;
  description?: string;
  artifactType?: 'interview' | 'survey' | 'observation' | 'workshop' | 'other';
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceInsight {
  id: string;
  title: string;
  description?: string;
  category?: 'user-need' | 'pain-point' | 'opportunity' | 'finding' | 'other';
  priority?: 'high' | 'medium' | 'low';
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspacePattern {
  id: string;
  name: string;
  description?: string;
  category?: string;
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceIcon {
  id: string;
  name: string;
  description?: string;
  iconSet?: string;
  svg?: string;
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceInteractive {
  id: string;
  name: string;
  description?: string;
  type?: 'prototype' | 'demo' | 'sandbox' | 'other';
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceStockPhoto {
  id: string;
  name: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  photographer?: string;
  license?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceIllustration {
  id: string;
  name: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  style?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceCapabilityLogo {
  id: string;
  name: string;
  description?: string;
  capability?: string;
  url: string;
  thumbnailUrl?: string;
  format?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceStyleDictionary {
  id: string;
  name: string;
  description?: string;
  format?: 'json' | 'css' | 'scss' | 'less' | 'js' | 'ts';
  tokens?: Record<string, any>;
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkspaceGuideline {
  id: string;
  title: string;
  description?: string;
  category?: 'design' | 'accessibility' | 'content' | 'interaction' | 'visual' | 'technical' | 'other';
  content?: string; // Markdown or HTML content
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string; // URL-friendly identifier
  createdAt: Date;
  updatedAt: Date;
  ownerId: string; // User ID of workspace owner
  members: WorkspaceMember[];
  settings?: {
    allowExternalSharing?: boolean;
    requireApprovalForSharing?: boolean;
    defaultComponentStatus?: 'production' | 'in-progress' | 'planned';
  };
  metadata?: {
    teamSize?: number;
    industry?: string;
    tags?: string[];
  };
}

export interface ComplianceCheck {
  id: string;
  rule: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
  element?: string;
  impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
}

@Injectable()
export class DesignSystemService {
  private apiKeys = new Map<string, { name: string; createdAt: Date }>();
  private applications = new Map<string, Application>();
  private workspaces = new Map<string, Workspace>();
  private workspaceFonts = new Map<string, WorkspaceFont>();
  private workspaceAssets = new Map<string, WorkspaceAsset>();
  private workspaceTokens = new Map<string, WorkspaceToken>();
  private workspaceReviews = new Map<string, WorkspaceReview>();
  private workspaceSessionReplays = new Map<string, WorkspaceSessionReplay>();
  private workspaceJourneyMaps = new Map<string, WorkspaceJourneyMap>();
  private workspaceHcdReports = new Map<string, WorkspaceHcdReport>();
  private workspaceUserPersonas = new Map<string, WorkspaceUserPersona>();
  private workspaceResearchArtifacts = new Map<string, WorkspaceResearchArtifact>();
  private workspaceInsights = new Map<string, WorkspaceInsight>();
  private workspacePatterns = new Map<string, WorkspacePattern>();
  private workspaceIcons = new Map<string, WorkspaceIcon>();
  private workspaceInteractives = new Map<string, WorkspaceInteractive>();
  private workspaceStockPhotos = new Map<string, WorkspaceStockPhoto>();
  private workspaceIllustrations = new Map<string, WorkspaceIllustration>();
  private workspaceCapabilityLogos = new Map<string, WorkspaceCapabilityLogo>();
  private workspaceStyleDictionaries = new Map<string, WorkspaceStyleDictionary>();
  private workspaceGuidelines = new Map<string, WorkspaceGuideline>();
  private scannerService: ComplianceScannerService;
  private applicationScanner: ApplicationScannerService;
  
  // Initialize with a default API key for testing
  private analyticsService?: AnalyticsService;

  constructor(
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
    @Optional() @Inject(forwardRef(() => VisualRegressionService)) private readonly visualRegressionService?: VisualRegressionService,
    @Optional() @Inject(forwardRef(() => SessionReplayService)) private readonly sessionReplayService?: SessionReplayService,
  ) {
    this.scannerService = new ComplianceScannerService();
    this.applicationScanner = new ApplicationScannerService();
    this.apiKeys.set('test-api-key-123', { name: 'Default Test Key', createdAt: new Date() });
    this.apiKeys.set('dev-key', { name: 'Development Key', createdAt: new Date() });
  }

  // Set analytics service (called by module to avoid circular dependency)
  setAnalyticsService(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
    
    // Initialize with sample applications (for demonstration)
    this.applications.set('app-1', {
      id: 'app-1',
      name: 'Marketing Site',
      repository: 'https://github.com/company/marketing-site',
      version: '2.1.0',
      designSystemVersion: '2.0.0', // Using older design system version
      registeredAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      lastScanned: new Date('2024-01-20')
    });
    this.applications.set('app-2', {
      id: 'app-2',
      name: 'Admin Dashboard',
      repository: 'https://github.com/company/admin-dashboard',
      version: '1.5.3',
      designSystemVersion: '2.1.0', // Using latest design system version
      registeredAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      lastScanned: new Date('2024-01-18')
    });
    this.applications.set('app-3', {
      id: 'app-3',
      name: 'Mobile App',
      repository: 'https://github.com/company/mobile-app',
      version: '3.0.1',
      designSystemVersion: '1.5.0', // Using older design system version
      applicationUrl: 'https://mobile.example.com',
      registeredAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      lastScanned: new Date('2024-01-19'),
      capabilities: {
        governance: {
          enabled: true,
          rules: [],
          scanSchedule: 'manual',
          lastScan: new Date('2024-01-19')
        },
        visualRegression: {
          enabled: true,
          argosProjectId: 'argos-project-789',
          argosBaseUrl: 'https://app.argos-ci.com',
          argosBranch: 'develop'
        },
        sessionReplay: {
          enabled: true,
          openreplayProjectKey: 'project-key-789',
          openreplayBaseUrl: 'https://api.openreplay.com'
        }
      },
      metadata: {
        environment: 'production',
        framework: 'React Native',
        language: 'TypeScript',
        tags: ['mobile', 'ios', 'android']
      }
    });
  }

  validateApiKey(apiKey: string): boolean {
    return this.apiKeys.has(apiKey);
  }

  createApiKey(name: string): string {
    const apiKey = `ds_${this.generateRandomString(32)}`;
    this.apiKeys.set(apiKey, { name, createdAt: new Date() });
    return apiKey;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private tokens: Token[] = [
    { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors', description: 'Primary brand color', tags: ['brand', 'primary'] },
    { name: 'color.primary.500', value: '{color.primary}', type: 'color', category: 'colors', description: 'Primary color at 500 scale', tags: ['brand', 'primary', 'scale'] },
    { name: 'color.button.primary', value: '{color.primary.500}', type: 'color', category: 'colors', description: 'Primary button color', tags: ['button', 'primary'] },
    { name: 'color.secondary', value: '#6366f1', type: 'color', category: 'colors', description: 'Secondary brand color', tags: ['brand', 'secondary'] },
    { name: 'color.success', value: '#10b981', type: 'color', category: 'colors', description: 'Success state color', tags: ['semantic', 'success'] },
    { name: 'color.error', value: '#ef4444', type: 'color', category: 'colors', description: 'Error state color', tags: ['semantic', 'error'] },
    { name: 'color.warning', value: '#f59e0b', type: 'color', category: 'colors', description: 'Warning state color', tags: ['semantic', 'warning'] },
    { name: 'color.info', value: '#3b82f6', type: 'color', category: 'colors', description: 'Info state color', tags: ['semantic', 'info'] },
    { name: 'color.neutral.50', value: '#f9fafb', type: 'color', category: 'colors', description: 'Neutral color scale 50', tags: ['neutral', 'scale'] },
    { name: 'color.neutral.100', value: '#f3f4f6', type: 'color', category: 'colors', description: 'Neutral color scale 100', tags: ['neutral', 'scale'] },
    { name: 'color.neutral.500', value: '#6b7280', type: 'color', category: 'colors', description: 'Neutral color scale 500', tags: ['neutral', 'scale'] },
    { name: 'color.neutral.900', value: '#111827', type: 'color', category: 'colors', description: 'Neutral color scale 900', tags: ['neutral', 'scale'] },
    { name: 'spacing.xs', value: '0.25rem', type: 'dimension', category: 'spacing', description: 'Extra small spacing', tags: ['spacing', 'xs'] },
    { name: 'spacing.sm', value: '0.5rem', type: 'dimension', category: 'spacing', description: 'Small spacing', tags: ['spacing', 'sm'] },
    { name: 'spacing.md', value: '1rem', type: 'dimension', category: 'spacing', description: 'Medium spacing', tags: ['spacing', 'md'] },
    { name: 'spacing.lg', value: '1.5rem', type: 'dimension', category: 'spacing', description: 'Large spacing', tags: ['spacing', 'lg'] },
    { name: 'spacing.xl', value: '2rem', type: 'dimension', category: 'spacing', description: 'Extra large spacing', tags: ['spacing', 'xl'] },
    { name: 'spacing.2xl', value: '3rem', type: 'dimension', category: 'spacing', description: '2X large spacing', tags: ['spacing', '2xl'] },
    { name: 'typography.fontFamily.primary', value: 'Inter, sans-serif', type: 'fontFamily', category: 'typography', description: 'Primary font family', tags: ['font', 'primary'] },
    { name: 'typography.fontFamily.secondary', value: 'Georgia, serif', type: 'fontFamily', category: 'typography', description: 'Secondary font family', tags: ['font', 'secondary'] },
    { name: 'typography.fontSize.xs', value: '0.75rem', type: 'fontSize', category: 'typography', description: 'Extra small font size', tags: ['font-size', 'xs'] },
    { name: 'typography.fontSize.sm', value: '0.875rem', type: 'fontSize', category: 'typography', description: 'Small font size', tags: ['font-size', 'sm'] },
    { name: 'typography.fontSize.md', value: '1rem', type: 'fontSize', category: 'typography', description: 'Medium font size', tags: ['font-size', 'md'] },
    { name: 'typography.fontSize.lg', value: '1.25rem', type: 'fontSize', category: 'typography', description: 'Large font size', tags: ['font-size', 'lg'] },
    { name: 'typography.fontSize.xl', value: '1.5rem', type: 'fontSize', category: 'typography', description: 'Extra large font size', tags: ['font-size', 'xl'] },
    { name: 'typography.fontWeight.normal', value: '400', type: 'fontWeight', category: 'typography', description: 'Normal font weight', tags: ['font-weight'] },
    { name: 'typography.fontWeight.medium', value: '500', type: 'fontWeight', category: 'typography', description: 'Medium font weight', tags: ['font-weight'] },
    { name: 'typography.fontWeight.bold', value: '700', type: 'fontWeight', category: 'typography', description: 'Bold font weight', tags: ['font-weight'] },
    { name: 'shadow.sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', type: 'shadow', category: 'shadows', description: 'Small shadow', tags: ['shadow', 'sm'] },
    { name: 'shadow.md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows', description: 'Medium shadow', tags: ['shadow', 'md'] },
    { name: 'shadow.lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows', description: 'Large shadow', tags: ['shadow', 'lg'] },
    { name: 'shadow.xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows', description: 'Extra large shadow', tags: ['shadow', 'xl'] },
    { name: 'border.radius.sm', value: '0.25rem', type: 'dimension', category: 'borders', description: 'Small border radius', tags: ['border', 'radius'] },
    { name: 'border.radius.md', value: '0.5rem', type: 'dimension', category: 'borders', description: 'Medium border radius', tags: ['border', 'radius'] },
    { name: 'border.radius.lg', value: '0.75rem', type: 'dimension', category: 'borders', description: 'Large border radius', tags: ['border', 'radius'] },
    { name: 'border.width.thin', value: '1px', type: 'dimension', category: 'borders', description: 'Thin border width', tags: ['border', 'width'] },
    { name: 'border.width.medium', value: '2px', type: 'dimension', category: 'borders', description: 'Medium border width', tags: ['border', 'width'] },
  ];

  private components: Component[] = [
    {
      id: 'button',
      name: 'Button',
      description: 'Primary action component with multiple variants and sizes',
      status: 'production',
      props: [
        { name: 'variant', type: 'string', default: 'primary', options: ['primary', 'secondary', 'tertiary'], description: 'Button style variant', required: false },
        { name: 'size', type: 'string', default: 'md', options: ['sm', 'md', 'lg'], description: 'Button size', required: false },
        { name: 'disabled', type: 'boolean', default: false, description: 'Whether the button is disabled', required: false },
        { name: 'loading', type: 'boolean', default: false, description: 'Whether the button is in loading state', required: false },
      ],
      code: {
        vue: `<template>
  <button
    :class="[
      'px-4 py-2 rounded-lg font-medium transition-colors',
      variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : '',
      variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : '',
      variant === 'tertiary' ? 'text-indigo-600 hover:bg-indigo-50' : '',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled || loading"
  >
    <slot v-if="!loading" />
    <span v-else>Loading...</span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});
</script>`,
        react: `import React from 'react';

export const Button = ({ variant = 'primary', size = 'md', disabled = false, loading = false, children }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    tertiary: 'text-indigo-600 hover:bg-indigo-50'
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}\`}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};`,
      },
      dependencies: [],
      examples: ['<Button variant="primary">Click me</Button>'],
      accessibility: {
        wcag: 'AA',
        notes: 'Button has proper focus states and keyboard navigation support',
      },
    },
    {
      id: 'card',
      name: 'Card',
      description: 'Container component for displaying content',
      status: 'production',
      props: [
        { name: 'padding', type: 'string', default: 'md', options: ['sm', 'md', 'lg'], description: 'Card padding size', required: false },
        { name: 'shadow', type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'none'], description: 'Card shadow level', required: false },
        { name: 'border', type: 'boolean', default: true, description: 'Whether to show border', required: false },
      ],
      code: {
        vue: `<template>
  <div :class="[
    'rounded-lg bg-white',
    border ? 'border' : '',
    \`p-\${padding === 'sm' ? '4' : padding === 'lg' ? '8' : '6'}\`,
    shadow !== 'none' ? \`shadow-\${shadow}\` : ''
  ]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  padding: { type: String, default: 'md' },
  shadow: { type: String, default: 'md' },
  border: { type: Boolean, default: true }
});
</script>`,
        react: `import React from 'react';

export const Card = ({ padding = 'md', shadow = 'md', border = true, children }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={\`rounded-lg bg-white \${border ? 'border' : ''} \${paddingClasses[padding]} \${shadow !== 'none' ? \`shadow-\${shadow}\` : ''}\`}>
      {children}
    </div>
  );
};`,
      },
      dependencies: [],
      examples: ['<Card padding="lg">Card content</Card>'],
      accessibility: {
        wcag: 'AA',
        notes: 'Card uses semantic HTML and proper ARIA attributes when interactive',
      },
    },
    {
      id: 'input',
      name: 'Input',
      description: 'Text input field component',
      status: 'production',
      props: [
        { name: 'type', type: 'string', default: 'text', options: ['text', 'email', 'password', 'number'], description: 'Input type', required: false },
        { name: 'placeholder', type: 'string', default: '', description: 'Placeholder text', required: false },
        { name: 'disabled', type: 'boolean', default: false, description: 'Whether input is disabled', required: false },
        { name: 'error', type: 'boolean', default: false, description: 'Whether input has error state', required: false },
        { name: 'label', type: 'string', default: '', description: 'Input label', required: false },
      ],
      code: {
        vue: `<template>
  <div>
    <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        error ? 'border-red-500' : 'border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    />
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  label: { type: String, default: '' }
});
</script>`,
        react: `import React from 'react';

export const Input = ({ type = 'text', placeholder = '', disabled = false, error = false, label = '' }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={\`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 \${error ? 'border-red-500' : 'border-gray-300'} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      />
    </div>
  );
};`,
      },
      dependencies: [],
      examples: ['<Input label="Email" type="email" placeholder="Enter your email" />'],
      accessibility: {
        wcag: 'AA',
        notes: 'Input has proper label association and error announcements',
      },
    },
    {
      id: 'select',
      name: 'Select',
      description: 'Dropdown select component',
      status: 'production',
      props: [
        { name: 'options', type: 'array', default: [], description: 'Select options', required: true },
        { name: 'placeholder', type: 'string', default: 'Select an option', description: 'Placeholder text', required: false },
        { name: 'disabled', type: 'boolean', default: false, description: 'Whether select is disabled', required: false },
        { name: 'label', type: 'string', default: '', description: 'Select label', required: false },
      ],
      code: {
        vue: `<template>
  <div>
    <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
    <select
      :disabled="disabled"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select an option' },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' }
});
</script>`,
        react: `import React from 'react';

export const Select = ({ options = [], placeholder = 'Select an option', disabled = false, label = '' }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};`,
      },
      dependencies: ['input'],
      examples: ['<Select label="Country" :options="[{value: \'us\', label: \'United States\'}]" />'],
      accessibility: {
        wcag: 'AA',
        notes: 'Select has proper label association and keyboard navigation',
      },
    },
    {
      id: 'modal',
      name: 'Modal',
      description: 'Modal dialog component',
      status: 'production',
      props: [
        { name: 'open', type: 'boolean', default: false, description: 'Whether modal is open', required: true },
        { name: 'title', type: 'string', default: '', description: 'Modal title', required: false },
        { name: 'closeOnBackdrop', type: 'boolean', default: true, description: 'Close on backdrop click', required: false },
      ],
      code: {
        vue: `<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="closeOnBackdrop && $emit('close')">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <div class="flex items-center justify-between mb-4">
        <h2 v-if="title" class="text-xl font-bold">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">×</button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: true }
});

defineEmits(['close']);
</script>`,
        react: `import React from 'react';

export const Modal = ({ open = false, title = '', closeOnBackdrop = true, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeOnBackdrop ? onClose : undefined}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};`,
      },
      dependencies: ['button', 'card'],
      examples: ['<Modal :open="true" title="Confirm" @close="handleClose">Are you sure?</Modal>'],
      accessibility: {
        wcag: 'AA',
        notes: 'Modal traps focus and has proper ARIA attributes',
      },
    },
    {
      id: 'color-picker',
      name: 'Color Picker',
      description: 'Comprehensive color picker component with gradient selector, hue slider, and multiple color format support (RGB, HSL, CMYK, Hex)',
      status: 'production',
      props: [
        { name: 'show', type: 'boolean', default: false, description: 'Whether color picker is visible', required: true },
        { name: 'initialColor', type: 'string', default: '#000000', description: 'Initial color value in hex format', required: false },
        { name: 'position', type: 'object', default: '{ left: 0, top: 0 }', description: 'Position of the color picker', required: false },
        { name: 'previewDarkMode', type: 'boolean', default: false, description: 'Whether to use dark mode styling', required: false },
      ],
      code: {
        vue: `<template>
  <div
    v-if="show"
    ref="colorPickerContainerRef"
    role="dialog"
    aria-modal="true"
    :class="[
      'fixed z-50 rounded-lg shadow-xl border p-4',
      isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'
    ]"
    :style="safePickerStyle"
    @click.stop
    @keydown.esc="cancel"
    tabindex="-1"
  >
    <div class="w-64">
      <h2 id="color-picker-title" class="sr-only">Color Picker</h2>
      <!-- Gradient/Hue Selector -->
      <div class="relative mb-4">
        <canvas
          ref="gradientCanvas"
          width="256"
          height="200"
          role="img"
          :class="[
            'w-full h-48 rounded-lg cursor-crosshair border focus:outline-none focus:ring-2 focus:ring-indigo-500',
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          ]"
          @mousedown="startGradientDrag"
          @click="handleGradientClick"
          @keydown="handleGradientKeydown"
          tabindex="0"
        ></canvas>
        <div
          class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
          :style="selectorStyle"
        ></div>
      </div>
      
      <!-- Hue Slider -->
      <div class="mb-4">
        <label for="hue-canvas" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Hue</label>
        <div class="relative h-8">
          <canvas
            ref="hueCanvas"
            width="256"
            height="32"
            role="slider"
            :class="[
              'w-full h-8 rounded cursor-pointer border focus:outline-none focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            ]"
            @click="handleHueClick"
            @keydown="handleHueKeydown"
            tabindex="0"
          ></canvas>
        </div>
      </div>

      <!-- RGB Inputs -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label for="rgb-r-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">R</label>
          <input
            id="rgb-r-input"
            v-model.number="rgbValues.r"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="rgb-g-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">G</label>
          <input
            id="rgb-g-input"
            v-model.number="rgbValues.g"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="rgb-b-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">B</label>
          <input
            id="rgb-b-input"
            v-model.number="rgbValues.b"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
      </div>

      <!-- Hex Input -->
      <div class="mb-4">
        <label for="hex-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Hex</label>
        <input
          id="hex-input"
          v-model="hexInput"
          @input="updateFromHex"
          type="text"
          pattern="^#[0-9A-Fa-f]{6}$"
          :class="[
            'w-full px-2 py-1 text-sm border rounded font-mono focus:ring-2 focus:ring-indigo-500',
            isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
          ]"
          placeholder="#000000"
        />
      </div>

      <!-- CMYK Inputs -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <div>
          <label for="cmyk-c-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">C</label>
          <input
            id="cmyk-c-input"
            v-model.number="cmykValues.c"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-m-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">M</label>
          <input
            id="cmyk-m-input"
            v-model.number="cmykValues.m"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-y-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Y</label>
          <input
            id="cmyk-y-input"
            v-model.number="cmykValues.y"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-k-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">K</label>
          <input
            id="cmyk-k-input"
            v-model.number="cmykValues.k"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
      </div>

      <!-- Color Preview -->
      <div class="mb-4 flex items-center gap-3" role="region" aria-label="Color preview">
        <div
          :class="[
            'w-16 h-16 rounded-lg border-2',
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          ]"
          :style="{ backgroundColor: currentHex }"
        ></div>
        <div class="flex-1">
          <div :class="['text-sm font-mono font-semibold', isDarkMode ? 'text-white' : 'text-gray-900']">{{ currentHex }}</div>
          <div :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-500']">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          @click="applyColor"
          class="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply
        </button>
        <button
          @click="cancel"
          :class="[
            'flex-1 px-4 py-2 text-sm rounded-lg transition-colors',
            isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  initialColor: { type: String, default: '#000000' },
  position: { type: Object, default: () => ({ left: 0, top: 0 }) },
  previewDarkMode: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show', 'apply', 'cancel']);

const isDarkMode = computed(() => props.previewDarkMode);
const colorPickerContainerRef = ref(null);
const gradientCanvas = ref(null);
const hueCanvas = ref(null);
const currentHex = ref('#000000');
const hexInput = ref('#000000');
const rgbValues = ref({ r: 0, g: 0, b: 0 });
const cmykValues = ref({ c: 0, m: 0, y: 0, k: 100 });
const currentHue = ref(0);
const currentSaturation = ref(100);
const currentLightness = ref(50);
const huePosition = ref(0);
const selectorStyle = ref({ left: '0%', top: '0%' });
const isDragging = ref(false);

// Color conversion utilities and canvas drawing functions would be here
// (hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb, drawGradientCanvas, drawHueCanvas, etc.)

const applyColor = () => {
  emit('apply', currentHex.value);
  emit('update:show', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:show', false);
};
</script>`,
        react: `import React, { useState, useEffect, useRef } from 'react';

export const ColorPicker = ({ show = false, initialColor = '#000000', position = { left: 0, top: 0 }, previewDarkMode = false, onApply, onCancel }) => {
  const [currentHex, setCurrentHex] = useState(initialColor);
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [cmykValues, setCmykValues] = useState({ c: 0, m: 0, y: 0, k: 100 });
  const [currentHue, setCurrentHue] = useState(0);
  const [currentSaturation, setCurrentSaturation] = useState(100);
  const [currentLightness, setCurrentLightness] = useState(50);
  const gradientCanvasRef = useRef(null);
  const hueCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Color conversion utilities and canvas drawing functions would be here
  // (hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb, drawGradientCanvas, drawHueCanvas, etc.)

  const handleApply = () => {
    if (onApply) onApply(currentHex);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className={\`fixed z-50 rounded-lg shadow-xl border p-4 \${previewDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'}\`}
      style={{ left: \`\${position.left}px\`, top: \`\${position.top}px\` }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
      tabIndex={-1}
    >
      <div className="w-64">
        <h2 id="color-picker-title" className="sr-only">Color Picker</h2>
        {/* Gradient/Hue Selector, RGB/Hex/CMYK inputs, Color Preview, Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleCancel}
            className={\`flex-1 px-4 py-2 text-sm rounded-lg transition-colors \${previewDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};`,
      },
      dependencies: [],
      examples: ['<ColorPicker :show="true" :initial-color="#4f46e5" @apply="handleColorApply" />'],
      accessibility: {
        wcag: 'AA',
        notes: 'Fully WCAG 2.1 AA compliant with keyboard navigation, ARIA labels, and focus management',
      },
    },
  ];

  getAllTokens(category?: string, type?: string, tag?: string): Token[] {
    let filtered = [...this.tokens];
    
    if (category) {
      filtered = filtered.filter(token => token.category === category);
    }
    
    if (type) {
      filtered = filtered.filter(token => token.type === type);
    }
    
    if (tag) {
      filtered = filtered.filter(token => token.tags?.includes(tag));
    }
    
    return filtered;
  }

  getTokenByName(name: string): Token | undefined {
    return this.tokens.find(token => token.name === name);
  }

  getTokensByCategory(category: string): Token[] {
    return this.tokens.filter(token => token.category === category);
  }

  /**
   * Get token relationships - analyzes references, aliases, semantic relationships, and dependencies
   */
  getTokenRelationships(tokenName?: string): {
    nodes: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      value: string;
      isBase: boolean;
      isAlias: boolean;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: 'reference' | 'semantic' | 'category' | 'scale';
      strength: number;
    }>;
    relationships: {
      references: Record<string, string[]>;
      referencedBy: Record<string, string[]>;
      semantic: Record<string, string[]>;
      category: Record<string, string[]>;
      scale: Record<string, string[]>;
    };
  } {
    const allTokens = this.getAllTokens();
    const nodes: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      value: string;
      isBase: boolean;
      isAlias: boolean;
    }> = [];
    const edges: Array<{
      from: string;
      to: string;
      type: 'reference' | 'semantic' | 'category' | 'scale';
      strength: number;
    }> = [];
    const references: Record<string, string[]> = {};
    const referencedBy: Record<string, string[]> = {};
    const semantic: Record<string, string[]> = {};
    const category: Record<string, string[]> = {};
    const scale: Record<string, string[]> = {};

    // Build nodes
    allTokens.forEach(token => {
      const isAlias = this.isTokenReference(token.value);
      const isBase = !isAlias;
      
      nodes.push({
        id: token.name,
        name: token.name,
        category: token.category,
        type: token.type,
        value: token.value,
        isBase,
        isAlias,
      });

      // Initialize relationship maps
      references[token.name] = [];
      referencedBy[token.name] = [];
      semantic[token.name] = [];
      category[token.name] = [];
      scale[token.name] = [];
    });

    // Analyze references/aliases
    allTokens.forEach(token => {
      const referencedTokens = this.extractTokenReferences(token.value);
      referencedTokens.forEach(refTokenName => {
        if (allTokens.find(t => t.name === refTokenName)) {
          references[token.name].push(refTokenName);
          if (!referencedBy[refTokenName]) {
            referencedBy[refTokenName] = [];
          }
          referencedBy[refTokenName].push(token.name);
          
          edges.push({
            from: token.name,
            to: refTokenName,
            type: 'reference',
            strength: 1.0,
          });
        }
      });
    });

    // Analyze semantic relationships (same semantic meaning across categories)
    const semanticGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      const semanticKey = this.extractSemanticKey(token.name);
      if (semanticKey) {
        if (!semanticGroups[semanticKey]) {
          semanticGroups[semanticKey] = [];
        }
        semanticGroups[semanticKey].push(token.name);
      }
    });

    Object.values(semanticGroups).forEach(group => {
      if (group.length > 1) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            semantic[group[i]].push(group[j]);
            semantic[group[j]].push(group[i]);
            
            edges.push({
              from: group[i],
              to: group[j],
              type: 'semantic',
              strength: 0.5,
            });
          }
        }
      }
    });

    // Analyze category relationships (same category)
    const categoryGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      if (!categoryGroups[token.category]) {
        categoryGroups[token.category] = [];
      }
      categoryGroups[token.category].push(token.name);
    });

    Object.entries(categoryGroups).forEach(([cat, tokens]) => {
      if (tokens.length > 1) {
        for (let i = 0; i < tokens.length; i++) {
          for (let j = i + 1; j < tokens.length; j++) {
            category[tokens[i]].push(tokens[j]);
            category[tokens[j]].push(tokens[i]);
            
            edges.push({
              from: tokens[i],
              to: tokens[j],
              type: 'category',
              strength: 0.3,
            });
          }
        }
      }
    });

    // Analyze scale relationships (same scale progression)
    const scaleGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      const scaleKey = this.extractScaleKey(token.name);
      if (scaleKey) {
        if (!scaleGroups[scaleKey]) {
          scaleGroups[scaleKey] = [];
        }
        scaleGroups[scaleKey].push(token.name);
      }
    });

    Object.values(scaleGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by scale value if possible
        const sorted = group.sort((a, b) => {
          const aValue = this.extractScaleValue(a);
          const bValue = this.extractScaleValue(b);
          if (aValue !== null && bValue !== null) {
            return aValue - bValue;
          }
          return a.localeCompare(b);
        });

        for (let i = 0; i < sorted.length - 1; i++) {
          scale[sorted[i]].push(sorted[i + 1]);
          scale[sorted[i + 1]].push(sorted[i]);
          
          edges.push({
            from: sorted[i],
            to: sorted[i + 1],
            type: 'scale',
            strength: 0.4,
          });
        }
      }
    });

    // Filter by tokenName if provided
    if (tokenName) {
      const relatedTokens = new Set<string>();
      relatedTokens.add(tokenName);
      
      // Add all related tokens
      [references, referencedBy, semantic, category, scale].forEach(relMap => {
        if (relMap[tokenName]) {
          relMap[tokenName].forEach(t => relatedTokens.add(t));
        }
      });

      const filteredNodes = nodes.filter(n => relatedTokens.has(n.id));
      const filteredEdges = edges.filter(e => 
        relatedTokens.has(e.from) && relatedTokens.has(e.to)
      );

      return {
        nodes: filteredNodes,
        edges: filteredEdges,
        relationships: {
          references,
          referencedBy,
          semantic,
          category,
          scale,
        },
      };
    }

    return {
      nodes,
      edges,
      relationships: {
        references,
        referencedBy,
        semantic,
        category,
        scale,
      },
    };
  }

  /**
   * Get impact analysis for a token - what tokens/components would be affected if this token changes
   */
  getTokenImpactAnalysis(tokenName: string): {
    token: Token | null;
    directlyAffected: string[];
    indirectlyAffected: string[];
    affectedComponents: string[];
    totalImpact: number;
  } {
    const token = this.tokens.find(t => t.name === tokenName);
    if (!token) {
      return {
        token: null,
        directlyAffected: [],
        indirectlyAffected: [],
        affectedComponents: [],
        totalImpact: 0,
      };
    }

    const relationships = this.getTokenRelationships();
    const directlyAffected = relationships.relationships.referencedBy[tokenName] || [];
    
    // Get indirectly affected (tokens that reference the directly affected tokens)
    const indirectlyAffected = new Set<string>();
    directlyAffected.forEach(affectedToken => {
      const subAffected = relationships.relationships.referencedBy[affectedToken] || [];
      subAffected.forEach(t => indirectlyAffected.add(t));
    });

    // Find components that use this token (simplified - in real system would scan component code)
    const affectedComponents: string[] = [];
    this.components.forEach(component => {
      const code = component.code.vue || component.code.react || '';
      if (code.includes(tokenName) || code.includes(`{${tokenName}}`)) {
        affectedComponents.push(component.name);
      }
    });

    return {
      token,
      directlyAffected,
      indirectlyAffected: Array.from(indirectlyAffected),
      affectedComponents,
      totalImpact: directlyAffected.length + indirectlyAffected.size + affectedComponents.length,
    };
  }

  /**
   * Helper: Check if a value is a token reference
   */
  private isTokenReference(value: string): boolean {
    return value.startsWith('{') && value.endsWith('}');
  }

  /**
   * Helper: Extract token references from a value
   */
  private extractTokenReferences(value: string): string[] {
    const references: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
      references.push(match[1]);
    }
    return references;
  }

  /**
   * Helper: Extract semantic key from token name (e.g., "primary", "secondary")
   */
  private extractSemanticKey(tokenName: string): string | null {
    const parts = tokenName.split('.');
    const semanticKeywords = ['primary', 'secondary', 'tertiary', 'success', 'error', 'warning', 'info', 'neutral'];
    for (const part of parts) {
      if (semanticKeywords.includes(part.toLowerCase())) {
        return part.toLowerCase();
      }
    }
    return null;
  }

  /**
   * Helper: Extract scale key from token name (e.g., "color.neutral" from "color.neutral.500")
   */
  private extractScaleKey(tokenName: string): string | null {
    const parts = tokenName.split('.');
    if (parts.length >= 3) {
      // Check if last part is a scale value (number or size like xs, sm, md, lg)
      const lastPart = parts[parts.length - 1];
      const scaleValues = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      if (scaleValues.includes(lastPart.toLowerCase()) || /^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('.');
      }
    }
    return null;
  }

  /**
   * Helper: Extract scale value for sorting
   */
  private extractScaleValue(tokenName: string): number | null {
    const parts = tokenName.split('.');
    const lastPart = parts[parts.length - 1];
    const scaleMap: Record<string, number> = {
      'xs': 1, 'sm': 2, 'md': 3, 'lg': 4, 'xl': 5, '2xl': 6,
      '50': 50, '100': 100, '200': 200, '300': 300, '400': 400,
      '500': 500, '600': 600, '700': 700, '800': 800, '900': 900,
    };
    if (scaleMap[lastPart.toLowerCase()]) {
      return scaleMap[lastPart.toLowerCase()];
    }
    const numMatch = lastPart.match(/^\d+$/);
    if (numMatch) {
      return parseInt(numMatch[0], 10);
    }
    return null;
  }

  getAllComponents(status?: string, workspaceId?: string): Component[] {
    let filtered = this.components;

    // Filter by workspace if provided
    if (workspaceId) {
      filtered = this.getComponentsForWorkspace(workspaceId);
    }

    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(component => component.status === status);
    }

    return filtered;
  }

  /**
   * Get component variants (both built-in and custom)
   */
  getComponentVariants(componentId: string): ComponentVariant[] {
    const component = this.getComponentById(componentId);
    if (!component) {
      return [];
    }
    
    // Extract built-in variants from props
    const variantProp = component.props.find(p => p.name === 'variant');
    const builtInVariants: ComponentVariant[] = [];
    
    if (variantProp && variantProp.options) {
      variantProp.options.forEach(option => {
        builtInVariants.push({
          name: option,
          description: `Built-in ${option} variant`,
          properties: {}, // Will be generated from code
        });
      });
    }
    
    // Merge with custom variants
    const customVariants = component.variants || [];
    
    return [...builtInVariants, ...customVariants];
  }

  /**
   * Add or update a component variant
   */
  saveComponentVariant(componentId: string, variant: ComponentVariant): ComponentVariant {
    const component = this.getComponentById(componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }
    
    if (!component.variants) {
      component.variants = [];
    }
    
    // Generate code for the variant
    variant.generatedCode = this.generateVariantCode(component, variant);
    
    // Update or add variant
    const existingIndex = component.variants.findIndex(v => v.name === variant.name);
    if (existingIndex >= 0) {
      component.variants[existingIndex] = variant;
    } else {
      component.variants.push(variant);
    }
    
    // Update variant prop options if needed
    const variantProp = component.props.find(p => p.name === 'variant');
    if (variantProp && !variantProp.options?.includes(variant.name)) {
      if (!variantProp.options) {
        variantProp.options = [];
      }
      variantProp.options.push(variant.name);
    }
    
    return variant;
  }

  /**
   * Delete a component variant
   */
  deleteComponentVariant(componentId: string, variantName: string): boolean {
    const component = this.getComponentById(componentId);
    if (!component || !component.variants) {
      return false;
    }
    
    const index = component.variants.findIndex(v => v.name === variantName);
    if (index >= 0) {
      component.variants.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Generate code for a variant
   */
  private generateVariantCode(component: Component, variant: ComponentVariant): {
    vue?: string;
    react?: string;
    html?: string;
  } {
    const props = variant.properties;
    const classes: string[] = [];
    
    // Build Tailwind classes from properties
    if (props.backgroundColor) {
      if (props.backgroundColor.startsWith('{')) {
        // Token reference - would need to resolve
        classes.push(`bg-[var(--${props.backgroundColor.slice(1, -1).replace(/\./g, '-')})]`);
      } else {
        classes.push(`bg-${props.backgroundColor}`);
      }
    }
    
    if (props.textColor) {
      if (props.textColor.startsWith('{')) {
        classes.push(`text-[var(--${props.textColor.slice(1, -1).replace(/\./g, '-')})]`);
      } else {
        classes.push(`text-${props.textColor}`);
      }
    }
    
    if (props.borderColor) {
      classes.push(`border-${props.borderColor}`);
    }
    
    if (props.borderWidth) {
      classes.push(`border-${props.borderWidth}`);
    }
    
    if (props.borderRadius) {
      classes.push(`rounded-${props.borderRadius}`);
    }
    
    if (props.padding) {
      classes.push(`p-${props.padding}`);
    }
    
    if (props.fontSize) {
      classes.push(`text-${props.fontSize}`);
    }
    
    if (props.fontWeight) {
      classes.push(`font-${props.fontWeight}`);
    }
    
    // Hover states
    if (props.hover) {
      if (props.hover.backgroundColor) {
        classes.push(`hover:bg-${props.hover.backgroundColor}`);
      }
      if (props.hover.textColor) {
        classes.push(`hover:text-${props.hover.textColor}`);
      }
    }
    
    const classString = classes.join(' ');
    
    return {
      vue: `<button class="${classString}">${variant.name}</button>`,
      react: `<button className="${classString}">${variant.name}</button>`,
      html: `<button class="${classString}">${variant.name}</button>`,
    };
  }

  getComponentById(id: string): Component | undefined {
    return this.components.find(component => component.id === id);
  }

  getComponentsByStatus(status: string): Component[] {
    return this.components.filter(component => component.status === status);
  }

  /**
   * Calculate test coverage for a component based on its props and test generation
   */
  calculateTestCoverage(componentId: string): {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
    lastUpdated?: string;
  } {
    const component = this.getComponentById(componentId);
    if (!component) {
      // Return default coverage if component not found
      return {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      };
    }

    const props = component.props || [];
    if (props.length === 0) {
      // No props means basic coverage
      return {
        statements: 45,
        branches: 30,
        functions: 50,
        lines: 45,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Calculate coverage based on props
    // Each prop adds potential test coverage
    let totalTestableItems = 0;
    let coveredItems = 0;

    props.forEach(prop => {
      // Statements: Each prop can generate multiple test statements
      if (prop.options && prop.options.length > 0) {
        // Enum prop: each option is a test case
        totalTestableItems += prop.options.length * 2; // 2 statements per option (mount + assertion)
        coveredItems += prop.options.length * 2; // All enum values are tested
      } else if (prop.type === 'boolean') {
        // Boolean: true and false states
        totalTestableItems += 4; // 2 states × 2 statements
        coveredItems += 4;
      } else {
        // Other types: at least one test
        totalTestableItems += 2;
        coveredItems += 2;
      }

      // Branches: Each prop creates conditional branches
      if (prop.required) {
        totalTestableItems += 2; // required vs optional branch
        coveredItems += 2;
      }
      if (prop.options && prop.options.length > 0) {
        totalTestableItems += prop.options.length; // Each option is a branch
        coveredItems += prop.options.length;
      }
    });

    // Functions: Each prop that's a function prop
    const functionProps = props.filter(p => 
      p.type === 'function' || 
      p.name.toLowerCase().includes('on') || 
      p.name.toLowerCase().includes('handle')
    );
    totalTestableItems += functionProps.length * 3; // Each function prop has 3 test functions
    coveredItems += functionProps.length * 3;

    // Base coverage for component structure
    const baseStatements = 10;
    const baseBranches = 5;
    const baseFunctions = 8;
    const baseLines = 10;

    // Calculate percentages (cap at 100%)
    const statements = Math.min(95, Math.round(
      baseStatements + (coveredItems / Math.max(totalTestableItems, 1)) * 70
    ));
    const branches = Math.min(90, Math.round(
      baseBranches + (props.length * 15) + (functionProps.length * 10)
    ));
    const functions = Math.min(95, Math.round(
      baseFunctions + (functionProps.length * 20) + (props.length * 5)
    ));
    const lines = Math.min(92, Math.round(
      baseLines + (coveredItems / Math.max(totalTestableItems, 1)) * 65
    ));

    return {
      statements,
      branches,
      functions,
      lines,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Create a new component and auto-link to matching requests
   */
  createComponent(data: {
    id: string;
    name: string;
    description: string;
    status?: 'production' | 'in-progress' | 'planned' | 'deprecated';
    props?: ComponentProp[];
    code?: { vue?: string; react?: string; html?: string };
    dependencies?: string[];
    examples?: string[];
    accessibility?: { wcag: string; notes?: string };
    linkedRequestId?: string; // Optional: explicitly link to a specific request
    workspaceId?: string; // Optional: workspace this component belongs to
    isGlobal?: boolean; // Optional: make component available to all workspaces
  }): Component {
    const component: Component = {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status || 'in-progress',
      props: data.props || [],
      code: data.code ? {
        vue: data.code.vue || '',
        react: data.code.react || '',
        html: data.code.html,
      } : { vue: '', react: '' },
      dependencies: data.dependencies || [],
      examples: data.examples || [],
      accessibility: data.accessibility,
      workspaceId: data.workspaceId,
      isGlobal: data.isGlobal || false,
    };

    this.components.push(component);

    // Auto-link to matching component requests
    // This will be called via ComponentRequestsService if available
    // We'll use a callback pattern to avoid circular dependency
    if (typeof (this as any).onComponentCreatedCallback === 'function') {
      (this as any).onComponentCreatedCallback(component.id, component.name, data.linkedRequestId);
    }

    return component;
  }

  /**
   * Set callback for component creation (called from ComponentRequestsService)
   */
  setComponentCreatedCallback(callback: (componentId: string, componentName: string, linkedRequestId?: string) => void) {
    (this as any).onComponentCreatedCallback = callback;
  }

  async registerApplication(
    name: string,
    options?: {
      description?: string;
      repository?: string;
      version?: string;
      applicationUrl?: string;
      teamId?: string;
      workspaceId?: string; // Workspace/team this application belongs to
      capabilities?: ApplicationCapabilities;
      metadata?: ApplicationMetadata;
    }
  ): Promise<Application> {
    const id = `app-${Date.now()}`;
    const now = new Date();
    const teamId = options?.teamId || 'default-team';
    const workspaceId = options?.workspaceId;
    
    // Initialize capabilities
    const capabilities = options?.capabilities || {
      governance: { enabled: false },
      visualRegression: { enabled: false },
      sessionReplay: { enabled: false }
    };
    
    // Create visual regression project if enabled
    if (capabilities.visualRegression?.enabled && capabilities.visualRegression?.argosProjectId) {
      try {
        if (this.visualRegressionService) {
          const argosBaseUrl = capabilities.visualRegression.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
          const vrProject = await this.visualRegressionService.createProject(teamId, {
            name: `${name} - Visual Regression`,
            description: `Visual regression testing for ${name}`,
            argosProjectId: capabilities.visualRegression.argosProjectId,
            argosBaseUrl: argosBaseUrl,
            argosBranch: 'develop',
          });
          capabilities.visualRegression.projectId = vrProject.id;
          capabilities.visualRegression.argosBaseUrl = argosBaseUrl;
          capabilities.visualRegression.argosBranch = 'develop';
        }
      } catch (error: any) {
        console.warn(`Failed to create visual regression project: ${error.message}`);
        // Continue with registration even if VR project creation fails
      }
    }
    
    // Create session replay project if enabled
    if (capabilities.sessionReplay?.enabled && capabilities.sessionReplay?.openreplayProjectKey) {
      try {
        if (this.sessionReplayService) {
          const srProject = await this.sessionReplayService.createProject(teamId, {
            name: `${name} - Session Replay`,
            description: `Session replay for ${name}`,
            applicationUrl: options?.applicationUrl,
            openreplayProjectKey: capabilities.sessionReplay.openreplayProjectKey,
            openreplayBaseUrl: capabilities.sessionReplay.openreplayBaseUrl,
            privacySettings: capabilities.sessionReplay.privacySettings,
          });
          capabilities.sessionReplay.projectId = srProject.id;
        }
      } catch (error: any) {
        console.warn(`Failed to create session replay project: ${error.message}`);
        // Continue with registration even if SR project creation fails
      }
    }
    
    const application: Application = {
      id,
      name,
      description: options?.description,
      repository: options?.repository,
      version: options?.version,
      applicationUrl: options?.applicationUrl,
      teamId,
      workspaceId,
      registeredAt: now,
      updatedAt: now,
      capabilities,
      metadata: options?.metadata
    };
    this.applications.set(id, application);
    return application;
  }

  updateApplication(id: string, updates: Partial<Application>): Application {
    const application = this.applications.get(id);
    if (!application) {
      throw new Error(`Application ${id} not found`);
    }
    const updated = {
      ...application,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date()
    };
    this.applications.set(id, updated);
    return updated;
  }

  async updateApplicationCapabilities(id: string, capabilities: Partial<ApplicationCapabilities>): Promise<Application> {
    const application = this.applications.get(id);
    if (!application) {
      throw new Error(`Application ${id} not found`);
    }
    const currentCapabilities = application.capabilities || {
      governance: { enabled: false },
      visualRegression: { enabled: false },
      sessionReplay: { enabled: false }
    };
    
    const teamId = application.teamId || 'default-team';
    
    // Handle visual regression capability changes
    if (capabilities.visualRegression) {
      const vrCap = capabilities.visualRegression;
      const currentVr = currentCapabilities.visualRegression || { enabled: false };
      
      // If enabling and project doesn't exist, create it
      if (vrCap.enabled && !currentVr.enabled && vrCap.argosProjectId) {
        try {
          if (this.visualRegressionService) {
            const argosBaseUrl = vrCap.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
            const vrProject = await this.visualRegressionService.createProject(teamId, {
              name: `${application.name} - Visual Regression`,
              description: `Visual regression testing for ${application.name}`,
              argosProjectId: vrCap.argosProjectId,
              argosBaseUrl: argosBaseUrl,
              argosBranch: 'develop',
            });
            vrCap.projectId = vrProject.id;
            vrCap.argosBaseUrl = argosBaseUrl;
            vrCap.argosBranch = 'develop';
          }
        } catch (error: any) {
          console.warn(`Failed to create visual regression project: ${error.message}`);
        }
      }
    }
    
    // Handle session replay capability changes
    if (capabilities.sessionReplay) {
      const srCap = capabilities.sessionReplay;
      const currentSr = currentCapabilities.sessionReplay || { enabled: false };
      
      // If enabling and project doesn't exist, create it
      if (srCap.enabled && !currentSr.enabled && srCap.openreplayProjectKey) {
        try {
          if (this.sessionReplayService) {
            const srProject = await this.sessionReplayService.createProject(teamId, {
              name: `${application.name} - Session Replay`,
              description: `Session replay for ${application.name}`,
              applicationUrl: application.applicationUrl,
              openreplayProjectKey: srCap.openreplayProjectKey,
              openreplayBaseUrl: srCap.openreplayBaseUrl,
              privacySettings: srCap.privacySettings,
            });
            srCap.projectId = srProject.id;
          }
        } catch (error: any) {
          console.warn(`Failed to create session replay project: ${error.message}`);
        }
      }
    }
    
    // Deep merge capabilities
    const updatedCapabilities: ApplicationCapabilities = {
      governance: capabilities.governance 
        ? { ...currentCapabilities.governance, ...capabilities.governance }
        : currentCapabilities.governance,
      visualRegression: capabilities.visualRegression
        ? { ...currentCapabilities.visualRegression, ...capabilities.visualRegression }
        : currentCapabilities.visualRegression,
      sessionReplay: capabilities.sessionReplay
        ? { ...currentCapabilities.sessionReplay, ...capabilities.sessionReplay }
        : currentCapabilities.sessionReplay,
    };
    
    const updated = {
      ...application,
      capabilities: updatedCapabilities,
      updatedAt: new Date()
    };
    this.applications.set(id, updated);
    return updated;
  }

  deleteApplication(id: string): boolean {
    return this.applications.delete(id);
  }

  getApplication(id: string): Application | undefined {
    return this.applications.get(id);
  }

  /**
   * Get current design system version (latest from release notes)
   */
  getCurrentDesignSystemVersion(): string {
    // In a real system, this would come from release notes or package.json
    // For now, return the latest version from sample data
    return '2.1.0';
  }

  /**
   * Update application's design system version
   */
  updateApplicationDesignSystemVersion(applicationId: string, version: string): Application {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }
    
    const updated = {
      ...application,
      designSystemVersion: version,
      updatedAt: new Date(),
    };
    
    this.applications.set(applicationId, updated);
    return updated;
  }

  /**
   * Get applications that need to upgrade their design system version
   */
  getApplicationsNeedingUpgrade(currentVersion?: string): {
    applications: Application[];
    currentVersion: string;
    upgradeRequired: number;
  } {
    const latestVersion = currentVersion || this.getCurrentDesignSystemVersion();
    const allApps = Array.from(this.applications.values());
    
    const needingUpgrade = allApps.filter(app => {
      if (!app.designSystemVersion) return true; // Apps without version need upgrade
      return this.compareVersions(app.designSystemVersion, latestVersion) < 0;
    });

    return {
      applications: needingUpgrade,
      currentVersion: latestVersion,
      upgradeRequired: needingUpgrade.length,
    };
  }

  /**
   * Get applications affected by breaking changes in a specific version
   */
  getApplicationsAffectedByBreakingChanges(targetVersion: string): {
    applications: Application[];
    affectedCount: number;
    breakingChanges: string[];
  } {
    const allApps = Array.from(this.applications.values());
    const currentVersion = this.getCurrentDesignSystemVersion();
    
    // Apps using versions before the target version are affected
    const affected = allApps.filter(app => {
      if (!app.designSystemVersion) return true;
      const appVersion = app.designSystemVersion;
      // If target version has breaking changes and app is on older version
      return this.compareVersions(appVersion, targetVersion) < 0;
    });

    // Mock breaking changes - in real system, this would come from release notes
    const breakingChanges = this.getBreakingChangesForVersion(targetVersion);

    return {
      applications: affected,
      affectedCount: affected.length,
      breakingChanges,
    };
  }

  /**
   * Compare two semantic versions
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  /**
   * Get breaking changes for a specific version
   * In a real system, this would query release notes
   */
  private getBreakingChangesForVersion(version: string): string[] {
    // Mock breaking changes based on version
    if (version.startsWith('2.0')) {
      return [
        'Button component: "type" prop renamed to "variant"',
        'Card component: Removed "outline" variant',
        'Token naming: Updated color token structure',
      ];
    }
    if (version.startsWith('3.0')) {
      return [
        'Major API changes across all components',
        'New token system implementation',
      ];
    }
    return [];
  }

  /**
   * Get migration planning data
   */
  getMigrationPlanningData(): {
    currentVersion: string;
    applicationsByVersion: Record<string, Application[]>;
    upgradeSummary: {
      total: number;
      upToDate: number;
      needsUpgrade: number;
      needsMajorUpgrade: number;
    };
    recommendedActions: Array<{
      applicationId: string;
      applicationName: string;
      currentVersion: string;
      targetVersion: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
    }>;
  } {
    const currentVersion = this.getCurrentDesignSystemVersion();
    const allApps = Array.from(this.applications.values());
    
    // Group applications by version
    const byVersion: Record<string, Application[]> = {};
    allApps.forEach(app => {
      const version = app.designSystemVersion || 'unknown';
      if (!byVersion[version]) {
        byVersion[version] = [];
      }
      byVersion[version].push(app);
    });

    // Calculate upgrade summary
    const upToDate = allApps.filter(app => 
      app.designSystemVersion === currentVersion
    ).length;
    
    const needsUpgrade = allApps.filter(app => {
      if (!app.designSystemVersion) return true;
      return this.compareVersions(app.designSystemVersion, currentVersion) < 0;
    }).length;

    // Apps that need major version upgrade (more than 1 major version behind)
    const needsMajorUpgrade = allApps.filter(app => {
      if (!app.designSystemVersion) return true;
      const appMajor = parseInt(app.designSystemVersion.split('.')[0]);
      const currentMajor = parseInt(currentVersion.split('.')[0]);
      return currentMajor - appMajor >= 1;
    }).length;

    // Generate recommended actions
    const recommendedActions = allApps
      .filter(app => {
        if (!app.designSystemVersion) return true;
        return this.compareVersions(app.designSystemVersion, currentVersion) < 0;
      })
      .map(app => {
        const appVersion = app.designSystemVersion || '0.0.0';
        const appMajor = parseInt(appVersion.split('.')[0]);
        const currentMajor = parseInt(currentVersion.split('.')[0]);
        
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let reason = '';

        if (currentMajor - appMajor >= 1) {
          priority = 'high';
          reason = `Major version upgrade required (${appVersion} → ${currentVersion}). Breaking changes may affect this application.`;
        } else if (this.compareVersions(appVersion, currentVersion) < 0) {
          priority = 'medium';
          reason = `Minor/patch update available (${appVersion} → ${currentVersion}).`;
        }

        return {
          applicationId: app.id,
          applicationName: app.name,
          currentVersion: appVersion,
          targetVersion: currentVersion,
          priority,
          reason,
        };
      })
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    return {
      currentVersion,
      applicationsByVersion: byVersion,
      upgradeSummary: {
        total: allApps.length,
        upToDate,
        needsUpgrade,
        needsMajorUpgrade,
      },
      recommendedActions,
    };
  }

  getAllApplications(filters?: {
    teamId?: string;
    capability?: 'governance' | 'visualRegression' | 'sessionReplay';
  }): { applications: Application[]; count: number } {
    let applications = Array.from(this.applications.values());
    
    if (filters?.teamId) {
      applications = applications.filter(app => app.teamId === filters.teamId);
    }
    
    if (filters?.capability) {
      applications = applications.filter(app => {
        const cap = app.capabilities?.[filters.capability];
        return cap?.enabled === true;
      });
    }
    
    return {
      applications,
      count: applications.length
    };
  }

  scanCompliance(scope: 'design-system' | 'applications', applicationId?: string, rules?: Array<{ name: string; scannerCode?: string }> | string[], codebase?: any, categories?: string[]): {
    scope: string;
    passed: number;
    warnings: number;
    failed: number;
    checks: ComplianceCheck[];
  } {
    // Handle both old format (string[]) and new format (Array<{name, scannerCode}>)
    let rulesToScan: string[];
    let customScanners: Map<string, string> = new Map();
    
    if (rules && rules.length > 0) {
      if (typeof rules[0] === 'string') {
        // Old format
        rulesToScan = rules as string[];
      } else {
        // New format with scanner code
        const ruleObjects = rules as Array<{ name: string; scannerCode?: string }>;
        rulesToScan = ruleObjects.map(r => r.name);
        ruleObjects.forEach(r => {
          if (r.scannerCode) {
            customScanners.set(r.name, r.scannerCode);
          }
        });
      }
    } else if (categories && categories.length > 0 && scope === 'applications') {
      // Filter by categories for application scans
      const allRules = this.getAllAvailableRules();
      rulesToScan = allRules
        .filter(rule => categories.includes(rule.category))
        .map(rule => rule.name);
    } else {
      // Default rules
      rulesToScan = ['Color Contrast WCAG AA', 'Spacing Consistency', 'Typography Scale', 'Component Naming', 'Accessibility Attributes', 'Token Usage'];
    }

    if (scope === 'design-system') {
      // Scan design system itself
      const context: ScannerContext = {
        components: this.components,
        tokens: this.tokens
      };

      // Use custom scanners if provided, otherwise use default scanner service
      let allChecks: ComplianceCheck[] = [];
      
      rulesToScan.forEach(ruleName => {
        if (customScanners.has(ruleName)) {
          // Execute custom scanner code
          try {
            const scannerCode = customScanners.get(ruleName)!;
            const scannerFunction = new Function('context', scannerCode);
            const checks = scannerFunction(context);
            if (Array.isArray(checks)) {
              allChecks.push(...checks);
            }
          } catch (error) {
            allChecks.push({
              id: `error-${ruleName}`,
              rule: ruleName,
              status: 'error',
              message: `Error executing custom scanner: ${error.message}`
            });
          }
        } else {
          // Use default scanner
          const checks = this.scannerService.scan([ruleName], context);
          allChecks.push(...checks);
        }
      });

      return {
        scope: 'design-system',
        passed: allChecks.filter(c => c.status === 'pass').length,
        warnings: allChecks.filter(c => c.status === 'warning').length,
        failed: allChecks.filter(c => c.status === 'error').length,
        checks: allChecks
      };
    } else {
      // Scan applications using ApplicationScannerService
      const application = applicationId ? this.applications.get(applicationId) : null;
      const allChecks: ComplianceCheck[] = [];
      
      // Create scan context from codebase parameter or empty
      const scanContext: ApplicationScanContext = {
        html: codebase?.html || '',
        css: codebase?.css || '',
        javascript: codebase?.javascript || '',
        components: codebase?.components || [],
        tokens: this.tokens,
        applicationName: application?.name || 'Unknown',
        file: codebase?.file
      };
      
      // Determine which rules to run based on categories or provided rules
      const allRules = this.getAllAvailableRules();
      let rulesToRun: Array<{ name: string; category: string; scannerCode?: string }> = [];
      
      if (rules && rules.length > 0) {
        // If specific rules provided, use them (for backward compatibility)
        if (typeof rules[0] === 'string') {
          rulesToRun = allRules.filter(rule => (rules as string[]).includes(rule.name));
        } else {
          const ruleObjects = rules as Array<{ name: string; scannerCode?: string }>;
          rulesToRun = allRules.filter(rule => ruleObjects.some(r => r.name === rule.name));
          ruleObjects.forEach(r => {
            const existingRule = rulesToRun.find(rt => rt.name === r.name);
            if (existingRule && r.scannerCode) {
              existingRule.scannerCode = r.scannerCode;
            }
          });
        }
      } else if (categories && categories.length > 0) {
        // Filter by categories
        rulesToRun = allRules.filter(rule => categories.includes(rule.category));
      } else {
        // Run all enabled rules
        rulesToRun = allRules.filter(rule => rule.enabled !== false);
      }
      
      rulesToRun.forEach((rule: any) => {
        const ruleName = rule.name;
        const scannerCode = rule.scannerCode || null;
        
        try {
          if (scannerCode) {
            // Execute custom scanner code
            const scannerFunction = new Function('context', scannerCode);
            const checks = scannerFunction(scanContext);
            if (Array.isArray(checks)) {
              allChecks.push(...checks);
            }
          } else {
            // Use ApplicationScannerService methods for default rules
            switch (ruleName) {
              case 'Design System Component Usage':
                allChecks.push(...this.applicationScanner.scanDesignSystemComponentUsage(scanContext));
                break;
              case 'Hardcoded Design Tokens':
                // Note: scanHardcodedTokens method needs to be implemented in ApplicationScannerService
                // For now, skip this check
                break;
              case 'Design System Version':
                allChecks.push(...this.applicationScanner.scanDesignSystemVersion(scanContext));
                break;
              case 'Form Label Requirements':
                allChecks.push(...this.applicationScanner.scanFormLabels(scanContext));
                break;
              case 'Error Message Handling':
                allChecks.push(...this.applicationScanner.scanErrorHandling(scanContext));
                break;
              case 'Loading State Indicators':
                allChecks.push(...this.applicationScanner.scanLoadingStates(scanContext));
                break;
              case 'Empty State Handling':
                allChecks.push(...this.applicationScanner.scanEmptyStates(scanContext));
                break;
              case 'Destructive Action Confirmation':
                allChecks.push(...this.applicationScanner.scanDestructiveActions(scanContext));
                break;
              case 'Accessibility Scan (Comprehensive)':
                // This will be handled asynchronously in scanApplicationCodebase
                break;
              case 'Image Alt Text':
              case 'Heading Hierarchy':
                allChecks.push(...this.applicationScanner.basicAccessibilityScan(scanContext));
                break;
            }
          }
        } catch (error) {
          allChecks.push({
            id: `error-${ruleName}`,
            rule: ruleName,
            status: 'error',
            message: `Error executing scanner for rule "${ruleName}": ${error.message}`,
            application: application?.name
          });
        }
      });

      return {
        scope: 'applications',
        passed: allChecks.filter(c => c.status === 'pass').length,
        warnings: allChecks.filter(c => c.status === 'warning').length,
        failed: allChecks.filter(c => c.status === 'error').length,
        checks: allChecks
      };
    }
  }

  async scanApplicationCodebase(applicationId: string, codebase?: any, categories?: string[]): Promise<{
    applicationId: string;
    scannedAt: Date;
    checks: ComplianceCheck[];
  }> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // Update last scanned time
    application.lastScanned = new Date();
    this.applications.set(applicationId, application);

    // Create scan context from codebase
    const scanContext: ApplicationScanContext = {
      html: codebase?.html || '',
      css: codebase?.css || '',
      javascript: codebase?.javascript || '',
      components: codebase?.components || [],
      tokens: this.tokens,
      applicationName: application.name,
      file: codebase?.file
    };

    // Track component usage for analytics
    if (this.analyticsService && codebase?.javascript) {
      const framework = application.metadata?.framework?.toLowerCase().includes('react') ? 'react' : 'vue';
      const detectedComponents = this.analyticsService.extractComponentUsage(codebase.javascript, framework);
      
      // Group by component and collect files
      const componentFiles = new Map<string, string[]>();
      detectedComponents.forEach(({ componentId, componentName }) => {
        if (!componentFiles.has(componentId)) {
          componentFiles.set(componentId, []);
        }
        const files = componentFiles.get(componentId)!;
        if (codebase?.file && !files.includes(codebase.file)) {
          files.push(codebase.file);
        }
      });

      // Track usage
      const usageData = Array.from(componentFiles.entries()).map(([componentId, files]) => {
        const component = detectedComponents.find(c => c.componentId === componentId);
        return {
          componentId,
          componentName: component?.componentName || componentId,
          files,
        };
      });

      if (usageData.length > 0) {
        this.analyticsService.trackComponentUsage(applicationId, application.name, usageData);
      }
    }

    // Determine which rules to run based on categories
    const allRules = this.getAllAvailableRules();
    let rulesToRun: Array<{ name: string; category: string; scannerCode?: string }> = [];
    
    if (categories && categories.length > 0) {
      // Filter by categories
      rulesToRun = allRules.filter(rule => categories.includes(rule.category));
    } else {
      // Run all enabled rules if no categories specified
      rulesToRun = allRules.filter(rule => rule.enabled !== false);
    }

    // Run all application scans
    const allChecks: ComplianceCheck[] = [];
    
    rulesToRun.forEach(rule => {
      try {
        if (rule.scannerCode) {
          // Execute custom scanner code
          const scannerFunction = new Function('context', rule.scannerCode);
          const checks = scannerFunction(scanContext);
          if (Array.isArray(checks)) {
            allChecks.push(...checks);
          }
        } else {
          // Use ApplicationScannerService methods for default rules
          switch (rule.name) {
            case 'Design System Component Usage':
              allChecks.push(...this.applicationScanner.scanDesignSystemComponentUsage(scanContext));
              break;
            case 'Hardcoded Design Tokens':
              // Note: scanHardcodedTokens method needs to be implemented in ApplicationScannerService
              // For now, skip this check
              break;
            case 'Design System Version':
              allChecks.push(...this.applicationScanner.scanDesignSystemVersion(scanContext));
              break;
            case 'Form Label Requirements':
              allChecks.push(...this.applicationScanner.scanFormLabels(scanContext));
              break;
            case 'Error Message Handling':
              allChecks.push(...this.applicationScanner.scanErrorHandling(scanContext));
              break;
            case 'Loading State Indicators':
              allChecks.push(...this.applicationScanner.scanLoadingStates(scanContext));
              break;
            case 'Empty State Handling':
              allChecks.push(...this.applicationScanner.scanEmptyStates(scanContext));
              break;
            case 'Destructive Action Confirmation':
              allChecks.push(...this.applicationScanner.scanDestructiveActions(scanContext));
              break;
            case 'Touch Target Sizes':
              allChecks.push(...this.applicationScanner.scanTouchTargetSizes(scanContext));
              break;
            case 'Success State Indicators':
              allChecks.push(...this.applicationScanner.scanSuccessStates(scanContext));
              break;
            case 'Navigation Consistency':
              allChecks.push(...this.applicationScanner.scanNavigationConsistency(scanContext));
              break;
            case 'Help Text and Tooltips':
              allChecks.push(...this.applicationScanner.scanHelpText(scanContext));
              break;
            case 'Border Radius Consistency':
              allChecks.push(...this.applicationScanner.scanBorderRadiusConsistency(scanContext));
              break;
            case 'Shadow/Elevation Consistency':
              allChecks.push(...this.applicationScanner.scanShadowConsistency(scanContext));
              break;
            case 'Z-index Layer Management':
              allChecks.push(...this.applicationScanner.scanZIndexManagement(scanContext));
              break;
            case 'Icon Usage Consistency':
              allChecks.push(...this.applicationScanner.scanIconUsage(scanContext));
              break;
            case 'Responsive Breakpoint Usage':
              allChecks.push(...this.applicationScanner.scanResponsiveBreakpoints(scanContext));
              break;
            case 'Animation/Transition Consistency':
              allChecks.push(...this.applicationScanner.scanAnimationConsistency(scanContext));
              break;
            case 'Component Variant Usage':
              allChecks.push(...this.applicationScanner.scanComponentVariantUsage(scanContext));
              break;
            case 'Search Functionality':
              allChecks.push(...this.applicationScanner.scanSearchFunctionality(scanContext));
              break;
            case 'Consistent Modal/Dialog Patterns':
              allChecks.push(...this.applicationScanner.scanModalConsistency(scanContext));
              break;
            case 'Consistent Toast/Notification Patterns':
              allChecks.push(...this.applicationScanner.scanToastConsistency(scanContext));
              break;
            case 'Page Load Performance Indicators':
              allChecks.push(...this.applicationScanner.scanPerformanceIndicators(scanContext));
              break;
            case 'Offline State Handling':
              allChecks.push(...this.applicationScanner.scanOfflineStateHandling(scanContext));
              break;
            case 'Content Hierarchy':
              allChecks.push(...this.applicationScanner.scanContentHierarchy(scanContext));
              break;
            case 'Accessibility Scan (Comprehensive)':
              // This will be handled asynchronously - for now use basic scan
              allChecks.push(...this.applicationScanner.basicAccessibilityScan(scanContext));
              break;
            case 'Image Alt Text':
            case 'Heading Hierarchy':
              allChecks.push(...this.applicationScanner.basicAccessibilityScan(scanContext));
              break;
            case 'Photosensitivity Analysis (IRIS)':
              // IRIS analysis is handled separately via video upload
              // This rule just checks for video content presence
              allChecks.push(...this.applicationScanner.scanForVideoContent(scanContext));
              break;
          }
        }
      } catch (error: any) {
        allChecks.push({
          id: `error-${rule.name}`,
          rule: rule.name,
          status: 'error',
          message: `Error executing scanner for rule "${rule.name}": ${error.message}`,
          application: application.name
        });
      }
    });

    // Run comprehensive accessibility scan if accessibility category is included
    const hasAccessibilityCategory = !categories || categories.includes('accessibility');
    const hasAccessibilityRule = rulesToRun.some(rule => rule.category === 'accessibility');
    
    if (hasAccessibilityCategory && hasAccessibilityRule) {
      try {
        const accessibilityChecks = await this.applicationScanner.scanAccessibility(scanContext);
        // Filter out duplicates from basic scan
        const existingIds = new Set(allChecks.map(c => c.id));
        accessibilityChecks.forEach(check => {
          if (!existingIds.has(check.id)) {
            allChecks.push(check);
          }
        });
      } catch (error) {
        // Already handled by basic scan above
      }
    }

    return {
      applicationId,
      scannedAt: new Date(),
      checks: allChecks
    };
  }

  // Get all available rules (for filtering by category)
  getAllAvailableRules(): Array<{ name: string; category: string; enabled: boolean; scannerCode?: string }> {
    // Return list of all available rules with their categories
    // In a real implementation, this would come from a database or configuration
    return [
      // Design System Compliance Rules
      { name: 'Design System Component Usage', category: 'design-system', enabled: true },
      { name: 'Hardcoded Design Tokens', category: 'design-system', enabled: true },
      { name: 'Design System Version', category: 'design-system', enabled: true },
      { name: 'Color Contrast WCAG AA', category: 'design-system', enabled: true },
      { name: 'Spacing Consistency', category: 'design-system', enabled: true },
      { name: 'Typography Scale', category: 'design-system', enabled: true },
      { name: 'Component Naming', category: 'design-system', enabled: true },
      { name: 'Border Radius Consistency', category: 'design-system', enabled: true },
      { name: 'Shadow/Elevation Consistency', category: 'design-system', enabled: true },
      { name: 'Z-index Layer Management', category: 'design-system', enabled: true },
      { name: 'Icon Usage Consistency', category: 'design-system', enabled: true },
      { name: 'Responsive Breakpoint Usage', category: 'design-system', enabled: true },
      { name: 'Animation/Transition Consistency', category: 'design-system', enabled: true },
      { name: 'Component Variant Usage', category: 'design-system', enabled: true },
      
      // UX / HCD Best Practices Rules
      { name: 'Form Label Requirements', category: 'ux-hcd', enabled: true },
      { name: 'Error Message Handling', category: 'ux-hcd', enabled: true },
      { name: 'Loading State Indicators', category: 'ux-hcd', enabled: true },
      { name: 'Empty State Handling', category: 'ux-hcd', enabled: true },
      { name: 'Destructive Action Confirmation', category: 'ux-hcd', enabled: true },
      { name: 'Touch Target Sizes', category: 'ux-hcd', enabled: true },
      { name: 'Success State Indicators', category: 'ux-hcd', enabled: true },
      { name: 'Navigation Consistency', category: 'ux-hcd', enabled: true },
      { name: 'Help Text and Tooltips', category: 'ux-hcd', enabled: true },
      { name: 'Search Functionality', category: 'ux-hcd', enabled: true },
      { name: 'Consistent Modal/Dialog Patterns', category: 'ux-hcd', enabled: true },
      { name: 'Consistent Toast/Notification Patterns', category: 'ux-hcd', enabled: true },
      { name: 'Page Load Performance Indicators', category: 'ux-hcd', enabled: true },
      { name: 'Offline State Handling', category: 'ux-hcd', enabled: true },
      { name: 'Content Hierarchy', category: 'ux-hcd', enabled: true },
      
      // Accessibility Rules
      { name: 'Accessibility Scan (Comprehensive)', category: 'accessibility', enabled: true },
      { name: 'Image Alt Text', category: 'accessibility', enabled: true },
      { name: 'Heading Hierarchy', category: 'accessibility', enabled: true },
      { name: 'Accessibility Attributes', category: 'accessibility', enabled: true }
    ];
  }

  // AI Assistant for Design System Questions
  async chatWithAI(message: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<{
    response: string;
    suggestions?: string[];
    relatedComponents?: string[];
    relatedTokens?: string[];
  }> {
    // Get design system context
    const components = this.components;
    const tokens = this.tokens;
    const rules = this.getAllAvailableRules();
    
    // Build context about the design system
    const componentNames = components.map(c => c.name).join(', ');
    const tokenCategories = [...new Set(tokens.map(t => t.category))].join(', ');
    const ruleCategories = [...new Set(rules.map(r => r.category))].join(', ');
    
    // Analyze the user's question to provide relevant context
    const lowerMessage = message.toLowerCase();
    
    // Check if question is about components
    const componentMatches = components.filter(c => 
      lowerMessage.includes(c.name.toLowerCase()) || 
      lowerMessage.includes(c.id.toLowerCase())
    );
    
    // Check if question is about tokens
    const tokenMatches = tokens.filter(t => 
      lowerMessage.includes(t.name.toLowerCase()) ||
      lowerMessage.includes(t.category.toLowerCase()) ||
      lowerMessage.includes(t.type.toLowerCase())
    );
    
    // Check if question is about rules/compliance
    const ruleMatches = rules.filter(r => 
      lowerMessage.includes(r.name.toLowerCase()) ||
      lowerMessage.includes(r.category.toLowerCase())
    );
    
    // Generate intelligent response based on context
    let response = '';
    const suggestions: string[] = [];
    const relatedComponents: string[] = [];
    const relatedTokens: string[] = [];
    
    // Component-related questions
    if (componentMatches.length > 0 || lowerMessage.includes('component')) {
      if (componentMatches.length > 0) {
        const component = componentMatches[0];
        response = `I found information about the **${component.name}** component.\n\n`;
        response += `**Description**: ${component.description}\n`;
        response += `**Status**: ${component.status}\n`;
        response += `**Props**: ${component.props.map(p => `${p.name} (${p.type})`).join(', ')}\n\n`;
        
        if (component.accessibility) {
          response += `**Accessibility**: ${component.accessibility.wcag}\n`;
        }
        
        relatedComponents.push(component.id);
        suggestions.push(`Show me the ${component.name} component code`);
        suggestions.push(`What are the props for ${component.name}?`);
      } else {
        response = `I can help you with components! Our design system has ${components.length} components including: ${componentNames}.\n\n`;
        response += `What would you like to know about components?`;
        suggestions.push('List all components');
        suggestions.push('How do I use the Button component?');
        suggestions.push('What components are available?');
      }
    }
    // Token-related questions
    else if (tokenMatches.length > 0 || lowerMessage.includes('token') || lowerMessage.includes('color') || lowerMessage.includes('spacing') || lowerMessage.includes('typography')) {
      if (tokenMatches.length > 0) {
        const token = tokenMatches[0];
        response = `I found the **${token.name}** token.\n\n`;
        response += `**Value**: ${token.value}\n`;
        response += `**Type**: ${token.type}\n`;
        response += `**Category**: ${token.category}\n`;
        if (token.description) {
          response += `**Description**: ${token.description}\n`;
        }
        
        relatedTokens.push(token.name);
        suggestions.push(`Show me all ${token.category} tokens`);
        suggestions.push(`How do I use ${token.name}?`);
      } else {
        response = `I can help you with design tokens! Our design system has tokens in these categories: ${tokenCategories}.\n\n`;
        response += `What would you like to know about tokens?`;
        suggestions.push('Show me all color tokens');
        suggestions.push('What spacing tokens are available?');
        suggestions.push('How do I use design tokens?');
      }
    }
    // Compliance/rules questions
    else if (ruleMatches.length > 0 || lowerMessage.includes('rule') || lowerMessage.includes('compliance') || lowerMessage.includes('governance')) {
      if (ruleMatches.length > 0) {
        const rule = ruleMatches[0];
        response = `I found information about the **${rule.name}** rule.\n\n`;
        response += `**Category**: ${rule.category === 'design-system' ? 'Design System' : rule.category === 'ux-hcd' ? 'UX/HCD Best Practices' : 'Accessibility'}\n`;
        response += `**Status**: ${rule.enabled ? 'Enabled' : 'Disabled'}\n\n`;
        response += `This rule checks for compliance with design system standards. Would you like to know more about how to use it or scan your application?`;
        
        suggestions.push(`How do I use the ${rule.name} rule?`);
        suggestions.push(`Scan my application for ${rule.category} compliance`);
      } else {
        response = `I can help you with compliance and governance! Our design system has ${rules.length} rules across these categories: ${ruleCategories}.\n\n`;
        response += `What would you like to know about compliance?`;
        suggestions.push('What rules are available?');
        suggestions.push('How do I scan my application?');
        suggestions.push('What is design system governance?');
      }
    }
    // General questions
    else {
      response = `Hi! I'm Eero, your Design System AI Assistant. I can help you with:\n\n`;
      response += `• **Components** - Find and learn about design system components\n`;
      response += `• **Design Tokens** - Discover colors, spacing, typography, and more\n`;
      response += `• **Compliance** - Understand rules and scan applications\n`;
      response += `• **Best Practices** - Get guidance on UX/HCD and accessibility\n\n`;
      response += `What would you like to know?`;
      
      suggestions.push('What components are available?');
      suggestions.push('Show me color tokens');
      suggestions.push('How do I use the Button component?');
      suggestions.push('What is design system governance?');
    }
    
    // Add general suggestions if none provided
    if (suggestions.length === 0) {
      suggestions.push('What components are available?');
      suggestions.push('Show me design tokens');
      suggestions.push('How do I use the design system?');
    }
    
    return {
      response,
      suggestions: suggestions.slice(0, 4), // Limit to 4 suggestions
      relatedComponents: relatedComponents.slice(0, 3),
      relatedTokens: relatedTokens.slice(0, 3)
    };
  }

  // Performance Budgets
  private performanceBudgets = new Map<string, {
    id: string;
    name: string;
    metric: string;
    threshold: number;
    unit: string;
    alertThreshold?: number;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>();

  getPerformanceBudgets() {
    return Array.from(this.performanceBudgets.values());
  }

  createPerformanceBudget(name: string, metric: string, threshold: number, unit: string, alertThreshold?: number) {
    const id = `budget_${Date.now()}`;
    const budget = {
      id,
      name,
      metric,
      threshold,
      unit,
      alertThreshold,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.performanceBudgets.set(id, budget);
    return budget;
  }

  updatePerformanceBudget(id: string, updates: { name?: string; threshold?: number; alertThreshold?: number; enabled?: boolean }) {
    const budget = this.performanceBudgets.get(id);
    if (!budget) {
      throw new Error(`Performance budget ${id} not found`);
    }
    Object.assign(budget, updates, { updatedAt: new Date() });
    this.performanceBudgets.set(id, budget);
    return budget;
  }

  deletePerformanceBudget(id: string) {
    return this.performanceBudgets.delete(id);
  }

  // Bundle Size Analysis
  getBundleAnalysis() {
    // Analyze all components with actual dependency sizes
    const analysis = this.components.map(component => {
      const vueCode = component.code.vue || '';
      const reactCode = component.code.react || '';
      const vueSize = Buffer.byteLength(vueCode, 'utf8');
      const reactSize = Buffer.byteLength(reactCode, 'utf8');
      const totalSize = vueSize + reactSize;
      
      // Calculate actual dependencies size
      let dependenciesSize = 0;
      const dependencies = component.dependencies || [];
      const analyzedDeps: string[] = [];
      
      dependencies.forEach(depId => {
        const dep = this.components.find(c => c.id === depId);
        if (dep) {
          const depVueSize = Buffer.byteLength(dep.code.vue || '', 'utf8');
          const depReactSize = Buffer.byteLength(dep.code.react || '', 'utf8');
          dependenciesSize += depVueSize + depReactSize;
          analyzedDeps.push(depId);
        }
      });
      
      return {
        componentId: component.id,
        componentName: component.name,
        vueSize,
        reactSize,
        totalSize,
        dependenciesSize,
        totalWithDeps: totalSize + dependenciesSize,
        dependencies: analyzedDeps,
        gzippedSize: Math.round(totalSize * 0.3), // Estimate (actual gzip would require compression)
        status: totalSize > 50000 ? 'warning' : totalSize > 100000 ? 'error' : 'pass'
      };
    });
    
    return {
      components: analysis,
      summary: {
        totalComponents: analysis.length,
        totalSize: analysis.reduce((sum, a) => sum + a.totalSize, 0),
        averageSize: analysis.length > 0 ? Math.round(analysis.reduce((sum, a) => sum + a.totalSize, 0) / analysis.length) : 0,
        largestComponent: analysis.length > 0 ? analysis.reduce((max, a) => a.totalSize > max.totalSize ? a : max, analysis[0]) : null,
        smallestComponent: analysis.length > 0 ? analysis.reduce((min, a) => a.totalSize < min.totalSize ? a : min, analysis[0]) : null
      }
    };
  }

  analyzeBundle(componentId?: string, includeDependencies: boolean = true) {
    if (componentId) {
      const component = this.components.find(c => c.id === componentId);
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      const vueCode = component.code.vue || '';
      const reactCode = component.code.react || '';
      const vueSize = Buffer.byteLength(vueCode, 'utf8');
      const reactSize = Buffer.byteLength(reactCode, 'utf8');
      const totalSize = vueSize + reactSize;
      
      let dependenciesSize = 0;
      const analyzedDeps: string[] = [];
      
      if (includeDependencies && component.dependencies) {
        component.dependencies.forEach(depId => {
          const dep = this.components.find(c => c.id === depId);
          if (dep) {
            const depVueSize = Buffer.byteLength(dep.code.vue || '', 'utf8');
            const depReactSize = Buffer.byteLength(dep.code.react || '', 'utf8');
            dependenciesSize += depVueSize + depReactSize;
            analyzedDeps.push(depId);
          }
        });
      }
      
      return {
        componentId: component.id,
        componentName: component.name,
        vueSize,
        reactSize,
        totalSize,
        dependenciesSize,
        totalWithDeps: totalSize + dependenciesSize,
        dependencies: analyzedDeps,
        gzippedSize: Math.round(totalSize * 0.3),
        status: totalSize > 50000 ? 'warning' : totalSize > 100000 ? 'error' : 'pass'
      };
    }
    
    return this.getBundleAnalysis();
  }

  // Roadmap
  private roadmapItems = new Map<string, {
    id: string;
    title: string;
    description: string;
    category: 'feature' | 'improvement' | 'bug-fix' | 'deprecation' | 'integration';
    priority: 'high' | 'medium' | 'low';
    status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
    targetDate?: string;
    createdAt: Date;
    updatedAt: Date;
    votes?: number;
  }>();

  getRoadmap() {
    const items = Array.from(this.roadmapItems.values());
    
    // Initialize with some default items if empty
    if (items.length === 0) {
      const defaultItems = [
        {
          id: 'roadmap_1',
          title: 'Dark Mode Support',
          description: 'Add comprehensive dark mode support across all components',
          category: 'feature' as const,
          priority: 'high' as const,
          status: 'in-progress' as const,
          targetDate: '2024-03-01',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          votes: 42
        },
        {
          id: 'roadmap_2',
          title: 'Component Composition Tool',
          description: 'Build a visual tool for composing complex components from primitives',
          category: 'feature' as const,
          priority: 'high' as const,
          status: 'planned' as const,
          targetDate: '2024-04-15',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          votes: 38
        },
        {
          id: 'roadmap_3',
          title: 'Figma Integration',
          description: 'Sync design tokens and components with Figma',
          category: 'integration' as const,
          priority: 'medium' as const,
          status: 'planned' as const,
          targetDate: '2024-05-01',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          votes: 35
        },
        {
          id: 'roadmap_4',
          title: 'Performance Optimization',
          description: 'Reduce bundle size and improve load times',
          category: 'improvement' as const,
          priority: 'high' as const,
          status: 'in-progress' as const,
          targetDate: '2024-02-15',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          votes: 28
        },
        {
          id: 'roadmap_5',
          title: 'Accessibility Enhancements',
          description: 'Improve WCAG compliance and add more accessibility features',
          category: 'improvement' as const,
          priority: 'high' as const,
          status: 'planned' as const,
          targetDate: '2024-03-15',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
          votes: 31
        }
      ];
      
      defaultItems.forEach(item => {
        this.roadmapItems.set(item.id, item);
      });
      
      return Array.from(this.roadmapItems.values());
    }
    
    return items;
  }

  createRoadmapItem(data: { title: string; description: string; category: string; priority: string; targetDate?: string; status?: string }) {
    const id = `roadmap_${Date.now()}`;
    const item = {
      id,
      title: data.title,
      description: data.description,
      category: data.category as any,
      priority: data.priority as any,
      status: (data.status || 'planned') as any,
      targetDate: data.targetDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0
    };
    this.roadmapItems.set(id, item);
    return item;
  }

  updateRoadmapItem(id: string, updates: { title?: string; description?: string; category?: string; priority?: string; targetDate?: string; status?: string }) {
    const item = this.roadmapItems.get(id);
    if (!item) {
      throw new Error(`Roadmap item ${id} not found`);
    }
    Object.assign(item, updates, { updatedAt: new Date() });
    this.roadmapItems.set(id, item);
    return item;
  }

  deleteRoadmapItem(id: string) {
    return this.roadmapItems.delete(id);
  }

  // Export rules for ESLint/Prettier integration
  exportRulesForLinter(format: 'eslint' | 'prettier' | 'json' = 'json') {
    const allRules = this.getAllAvailableRules();
    
    if (format === 'json') {
      return {
        rules: allRules.map(rule => ({
          name: rule.name,
          category: rule.category,
          enabled: rule.enabled,
          description: `Rule: ${rule.name} (${rule.category})`
        })),
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      };
    }
    
    if (format === 'eslint') {
      // Convert rules to ESLint-compatible format
      return {
        rules: allRules
          .filter(rule => rule.enabled)
          .map(rule => ({
            name: rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            category: rule.category,
            severity: rule.category === 'accessibility' ? 'error' : 'warn',
            description: rule.name,
            // Note: Full ESLint rule implementation would require AST parsing
            // This is a simplified export format
            scannerCode: rule.scannerCode || null
          })),
        meta: {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          note: 'Import this into eslint-plugin-design-system for full functionality'
        }
      };
    }
    
    if (format === 'prettier') {
      // Convert formatting-related rules to Prettier config
      const formattingRules = allRules.filter(rule => 
        rule.category === 'design-system' && 
        (rule.name.includes('Spacing') || rule.name.includes('Typography'))
      );
      
      return {
        config: {
          // Prettier config would be generated based on spacing/typography rules
          tabWidth: 2,
          useTabs: false,
          // Additional formatting rules based on design system tokens
        },
        rules: formattingRules.map(rule => ({
          name: rule.name,
          category: rule.category
        })),
        meta: {
          version: '1.0.0',
          exportedAt: new Date().toISOString()
        }
      };
    }
    
    // Default return (should not reach here, but TypeScript needs it)
    return {
      rules: [],
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
  }

  // Info Banners
  private infoBanners = new Map<string, {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
  }>();

  getAllBanners() {
    return Array.from(this.infoBanners.values());
  }

  getActiveBanners() {
    const now = new Date();
    return Array.from(this.infoBanners.values()).filter(banner => {
      if (!banner.isActive) return false;
      if (banner.expiresAt && banner.expiresAt < now) return false;
      return true;
    });
  }

  getBanner(id: string) {
    return this.infoBanners.get(id);
  }

  createBanner(data: { title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; expiresAt?: string }) {
    const id = `banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const banner = {
      id,
      title: data.title,
      message: data.message,
      type: data.type,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    };
    this.infoBanners.set(id, banner);
    return banner;
  }

  updateBanner(id: string, updates: { title?: string; message?: string; type?: 'info' | 'warning' | 'error' | 'success'; isActive?: boolean; expiresAt?: string }) {
    const banner = this.infoBanners.get(id);
    if (!banner) {
      throw new Error(`Banner ${id} not found`);
    }
    const updatedBanner = {
      ...banner,
      ...updates,
      updatedAt: new Date(),
      expiresAt: updates.expiresAt !== undefined ? (updates.expiresAt ? new Date(updates.expiresAt) : undefined) : banner.expiresAt
    };
    this.infoBanners.set(id, updatedBanner);
    return updatedBanner;
  }

  deleteBanner(id: string) {
    return this.infoBanners.delete(id);
  }

  // NASA-TLX (NASA Task Load Index)
  async submitNASATLX(data: {
    systemName: string;
    task: string;
    mentalDemand: number;
    physicalDemand: number;
    temporalDemand: number;
    performance: number;
    effort: number;
    frustration: number;
    user: string;
  }) {
    const document = {
      systemName: data.systemName,
      task: data.task,
      mentalDemand: data.mentalDemand,
      physicalDemand: data.physicalDemand,
      temporalDemand: data.temporalDemand,
      performance: data.performance,
      effort: data.effort,
      frustration: data.frustration,
      user: data.user,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.elasticsearchService) {
      // Return mock response if Elasticsearch is not available
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'nasa-tlx',
        document,
      });

      return {
        id: result._id,
        ...document,
      };
    } catch (error) {
      // Return mock response if Elasticsearch fails
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }
  }

  // System Usability Scale (SUS)
  async submitSUS(data: {
    systemName: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
    q6: number;
    q7: number;
    q8: number;
    q9: number;
    q10: number;
    user: string;
  }) {
    // Calculate SUS score (0-100)
    // Odd questions: score - 1
    // Even questions: 5 - score
    let score = 0;
    score += (data.q1 - 1) + (5 - data.q2) + (data.q3 - 1) + (5 - data.q4) + (data.q5 - 1);
    score += (5 - data.q6) + (data.q7 - 1) + (5 - data.q8) + (data.q9 - 1) + (5 - data.q10);
    score *= 2.5; // Convert to 0-100 scale

    const document = {
      systemName: data.systemName,
      q1: data.q1,
      q2: data.q2,
      q3: data.q3,
      q4: data.q4,
      q5: data.q5,
      q6: data.q6,
      q7: data.q7,
      q8: data.q8,
      q9: data.q9,
      q10: data.q10,
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      user: data.user,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.elasticsearchService) {
      // Return mock response if Elasticsearch is not available
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'sus-scores',
        document,
      });

      return {
        id: result._id,
        ...document,
      };
    } catch (error) {
      // Return mock response if Elasticsearch fails
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }
  }

  // Heuristic Evaluation
  async submitHeuristicEvaluation(data: {
    systemName: string;
    evaluator: string;
    heuristics: Array<{ heuristic: string; issues: string; severity: number }>;
    overallAssessment: string;
    timestamp: string;
  }) {
    // Calculate scores
    const totalIssues = data.heuristics.filter(h => h.issues.trim().length > 0).length;
    const criticalIssues = data.heuristics.filter(h => h.severity === 4).length;
    const severities = data.heuristics.map(h => h.severity);
    const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
    const overallScore = Math.max(0, Math.min(10, 10 - avgSeverity));

    const document = {
      systemName: data.systemName,
      evaluator: data.evaluator,
      heuristics: data.heuristics,
      overallAssessment: data.overallAssessment,
      totalIssues,
      criticalIssues,
      overallScore: Math.round(overallScore * 10) / 10,
      timestamp: data.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.elasticsearchService) {
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'heuristic-evaluations',
        document,
      });

      return {
        id: result._id,
        ...document,
      };
    } catch (error) {
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }
  }

  // Component metadata for Loupe Tool
  getComponentMetadata() {
    const metadata: Record<string, any> = {};
    
    // Icon mapping for components
    const iconMap: Record<string, string> = {
      'button': 'smart_button',
      'card': 'view_module',
      'input': 'input',
      'select': 'arrow_drop_down',
      'dropdown': 'arrow_drop_down',
      'navigation': 'navigation',
      'sidebar': 'menu',
      'topnav': 'menu',
      'breadcrumbs': 'navigate_next',
      'table': 'table_chart',
      'modal': 'fullscreen',
      'tooltip': 'info',
      'drawer': 'left_panel_close',
    };
    
    this.components.forEach((component) => {
      metadata[component.id] = {
        name: component.name,
        path: `@design-system/components/${component.id}`,
        icon: iconMap[component.id] || 'widgets',
        links: {
          docs: `/components/${component.id === 'button' ? 'buttons' : component.id === 'card' ? 'cards' : component.id === 'input' || component.id === 'select' ? 'forms' : component.id === 'navigation' || component.id === 'sidebar' || component.id === 'topnav' || component.id === 'breadcrumbs' ? 'navigation' : component.id === 'table' ? 'data-display' : 'overlays'}`,
          github: `https://github.com/your-org/design-system/tree/main/packages/components/src/${component.name}`,
          figma: `https://www.figma.com/file/your-design-system/components#${component.id}`,
        },
      };
    });
    
    return metadata;
  }

  // ==================== Workspace Management ====================

  /**
   * Create a new workspace
   */
  createWorkspace(data: {
    name: string;
    description?: string;
    ownerId: string;
    ownerEmail: string;
    settings?: Workspace['settings'];
    metadata?: Workspace['metadata'];
  }): Workspace {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const workspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: data.name,
      description: data.description,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: data.ownerId,
      members: [{
        userId: data.ownerId,
        email: data.ownerEmail,
        role: 'owner',
        addedAt: new Date(),
        addedBy: data.ownerId,
      }],
      settings: data.settings || {
        allowExternalSharing: true,
        requireApprovalForSharing: false,
        defaultComponentStatus: 'in-progress',
      },
      metadata: data.metadata,
    };

    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  /**
   * Get all workspaces
   */
  getAllWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values());
  }

  /**
   * Get workspace by ID
   */
  getWorkspaceById(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  /**
   * Get workspace by slug
   */
  getWorkspaceBySlug(slug: string): Workspace | undefined {
    return Array.from(this.workspaces.values()).find(w => w.slug === slug);
  }

  /**
   * Update workspace
   */
  updateWorkspace(workspaceId: string, updates: Partial<Pick<Workspace, 'name' | 'description' | 'settings' | 'metadata'>>): Workspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    if (updates.name) {
      workspace.name = updates.name;
      workspace.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (updates.description !== undefined) workspace.description = updates.description;
    if (updates.settings) workspace.settings = { ...workspace.settings, ...updates.settings };
    if (updates.metadata) workspace.metadata = { ...workspace.metadata, ...updates.metadata };
    workspace.updatedAt = new Date();

    this.workspaces.set(workspaceId, workspace);
    return workspace;
  }

  /**
   * Delete workspace
   */
  deleteWorkspace(workspaceId: string): boolean {
    return this.workspaces.delete(workspaceId);
  }

  /**
   * Add member to workspace
   */
  addWorkspaceMember(workspaceId: string, member: {
    userId: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    addedBy: string;
  }): Workspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    // Check if member already exists
    if (workspace.members.some(m => m.userId === member.userId)) {
      return null; // Member already exists
    }

    workspace.members.push({
      ...member,
      addedAt: new Date(),
    });
    workspace.updatedAt = new Date();

    this.workspaces.set(workspaceId, workspace);
    return workspace;
  }

  /**
   * Remove member from workspace
   */
  removeWorkspaceMember(workspaceId: string, userId: string): Workspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    // Don't allow removing the owner
    if (workspace.ownerId === userId) {
      return null;
    }

    workspace.members = workspace.members.filter(m => m.userId !== userId);
    workspace.updatedAt = new Date();

    this.workspaces.set(workspaceId, workspace);
    return workspace;
  }

  /**
   * Update member role
   */
  updateWorkspaceMemberRole(workspaceId: string, userId: string, role: 'admin' | 'editor' | 'viewer'): Workspace | null {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return null;

    // Don't allow changing owner role
    if (workspace.ownerId === userId) {
      return null;
    }

    const member = workspace.members.find(m => m.userId === userId);
    if (!member) return null;

    member.role = role;
    workspace.updatedAt = new Date();

    this.workspaces.set(workspaceId, workspace);
    return workspace;
  }

  /**
   * Check if user has access to workspace
   */
  hasWorkspaceAccess(workspaceId: string, userId: string, requiredRole?: 'owner' | 'admin' | 'editor' | 'viewer'): boolean {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return false;

    // Owner has all access
    if (workspace.ownerId === userId) return true;

    const member = workspace.members.find(m => m.userId === userId);
    if (!member) return false;

    if (!requiredRole) return true;

    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  }

  /**
   * Get workspaces for a user
   */
  getWorkspacesForUser(userId: string): Workspace[] {
    return Array.from(this.workspaces.values()).filter(workspace =>
      workspace.ownerId === userId || workspace.members.some(m => m.userId === userId)
    );
  }

  /**
   * Get components for a workspace (including shared and global components)
   */
  getComponentsForWorkspace(workspaceId: string, userId?: string): Component[] {
    // Check access
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }

    return this.components.filter(component =>
      // Component belongs to this workspace
      component.workspaceId === workspaceId ||
      // Component is global
      component.isGlobal === true ||
      // Component is shared with this workspace
      (component.sharedWith && component.sharedWith.includes(workspaceId))
    );
  }

  /**
   * Share component with workspace(s)
   */
  shareComponentWithWorkspaces(componentId: string, workspaceIds: string[], requestingWorkspaceId: string): Component | null {
    const component = this.getComponentById(componentId);
    if (!component) return null;

    // Verify component belongs to requesting workspace or is global
    if (component.workspaceId !== requestingWorkspaceId && !component.isGlobal) {
      return null; // Can't share components you don't own
    }

    // Add workspace IDs to sharedWith array
    if (!component.sharedWith) {
      component.sharedWith = [];
    }

    workspaceIds.forEach(wsId => {
      if (!component.sharedWith!.includes(wsId)) {
        component.sharedWith!.push(wsId);
      }
    });

    // Update component in array
    const index = this.components.findIndex(c => c.id === componentId);
    if (index !== -1) {
      this.components[index] = component;
    }

    return component;
  }

  /**
   * Unshare component from workspace(s)
   */
  unshareComponentFromWorkspaces(componentId: string, workspaceIds: string[], requestingWorkspaceId: string): Component | null {
    const component = this.getComponentById(componentId);
    if (!component) return null;

    // Verify component belongs to requesting workspace
    if (component.workspaceId !== requestingWorkspaceId && !component.isGlobal) {
      return null;
    }

    if (component.sharedWith) {
      component.sharedWith = component.sharedWith.filter(wsId => !workspaceIds.includes(wsId));
    }

    // Update component in array
    const index = this.components.findIndex(c => c.id === componentId);
    if (index !== -1) {
      this.components[index] = component;
    }

    return component;
  }

  /**
   * Make component global (available to all workspaces)
   */
  makeComponentGlobal(componentId: string, requestingWorkspaceId: string): Component | null {
    const component = this.getComponentById(componentId);
    if (!component) return null;

    // Verify component belongs to requesting workspace and user has admin access
    if (component.workspaceId !== requestingWorkspaceId) {
      return null;
    }

    component.isGlobal = true;
    component.sharedWith = undefined; // No need to track individual shares if global

    // Update component in array
    const index = this.components.findIndex(c => c.id === componentId);
    if (index !== -1) {
      this.components[index] = component;
    }

    return component;
  }

  /**
   * Get workspace analytics with enhanced adoption metrics
   */
  getWorkspaceAnalytics(workspaceId: string): {
    totalComponents: number;
    componentsByStatus: Record<string, number>;
    totalApplications: number;
    adoptionRate: number;
    designDebt: number;
    mostUsedComponents: Array<{ id: string; name: string; usage: number }>;
    healthScore: number;
    adoptionMetrics: {
      componentsAdopted: number;
      componentsAvailable: number;
      adoptionPercentage: number;
      applicationsUsingComponents: number;
      averageComponentsPerApp: number;
      adoptionTrend: 'up' | 'down' | 'stable';
    };
    crossWorkspaceComparison?: {
      totalWorkspaces: number;
      rank: number;
      componentsVsAverage: number;
      adoptionVsAverage: number;
    };
  } {
    const components = this.getComponentsForWorkspace(workspaceId);
    const applications = Array.from(this.applications.values()).filter(app => app.workspaceId === workspaceId);
    const allWorkspaces = Array.from(this.workspaces.values());

    const componentsByStatus: Record<string, number> = {};
    components.forEach(comp => {
      componentsByStatus[comp.status] = (componentsByStatus[comp.status] || 0) + 1;
    });

    // Calculate adoption metrics
    const productionComponents = components.filter(c => c.status === 'production');
    const componentsAvailable = productionComponents.length;
    
    // Get components actually used in applications (would use AnalyticsService in real implementation)
    // For now, estimate based on applications
    const componentsAdopted = Math.min(componentsAvailable, Math.floor(applications.length * 2.5));
    const adoptionPercentage = componentsAvailable > 0 
      ? (componentsAdopted / componentsAvailable) * 100 
      : 0;
    
    const applicationsUsingComponents = applications.filter(app => {
      // In real implementation, check if app uses any workspace components
      return true; // Simplified
    }).length;
    
    const averageComponentsPerApp = applications.length > 0
      ? componentsAdopted / applications.length
      : 0;

    // Calculate adoption rate (percentage of applications using design system components)
    const adoptionRate = applications.length > 0 
      ? (applicationsUsingComponents / applications.length) * 100 
      : 0;

    // Calculate design debt (deprecated components)
    const designDebt = componentsByStatus['deprecated'] || 0;

    // Most used components (would use AnalyticsService in real implementation)
    const mostUsedComponents = productionComponents.slice(0, 5).map(comp => ({
      id: comp.id,
      name: comp.name,
      usage: Math.floor(Math.random() * 100), // Placeholder - would use real usage data
    })).sort((a, b) => b.usage - a.usage);

    // Calculate health score
    const healthScore = Math.min(100, Math.max(0,
      100 - (designDebt * 5) - ((componentsByStatus['in-progress'] || 0) * 2) + (adoptionPercentage * 0.3)
    ));

    // Cross-workspace comparison
    const workspaceComponents = allWorkspaces.map(ws => {
      const wsComponents = this.getComponentsForWorkspace(ws.id);
      const wsApps = Array.from(this.applications.values()).filter(app => app.workspaceId === ws.id);
      const wsProductionComponents = wsComponents.filter(c => c.status === 'production');
      const wsAdoption = wsProductionComponents.length > 0 && wsApps.length > 0
        ? Math.min(wsProductionComponents.length, Math.floor(wsApps.length * 2.5)) / wsProductionComponents.length * 100
        : 0;
      return {
        workspaceId: ws.id,
        componentCount: wsComponents.length,
        adoptionRate: wsAdoption,
      };
    });

    const avgComponents = workspaceComponents.reduce((sum, w) => sum + w.componentCount, 0) / Math.max(workspaceComponents.length, 1);
    const avgAdoption = workspaceComponents.reduce((sum, w) => sum + w.adoptionRate, 0) / Math.max(workspaceComponents.length, 1);

    const rank = workspaceComponents
      .sort((a, b) => b.componentCount - a.componentCount)
      .findIndex(w => w.workspaceId === workspaceId) + 1;

    return {
      totalComponents: components.length,
      componentsByStatus,
      totalApplications: applications.length,
      adoptionRate,
      designDebt,
      mostUsedComponents,
      healthScore,
      adoptionMetrics: {
        componentsAdopted,
        componentsAvailable,
        adoptionPercentage: parseFloat(adoptionPercentage.toFixed(1)),
        applicationsUsingComponents,
        averageComponentsPerApp: parseFloat(averageComponentsPerApp.toFixed(1)),
        adoptionTrend: 'stable', // Would calculate from historical data
      },
      crossWorkspaceComparison: {
        totalWorkspaces: allWorkspaces.length,
        rank,
        componentsVsAverage: parseFloat((components.length - avgComponents).toFixed(1)),
        adoptionVsAverage: parseFloat((adoptionPercentage - avgAdoption).toFixed(1)),
      },
    };
  }

  /**
   * Get cross-workspace comparison analytics
   */
  getCrossWorkspaceComparison(workspaceIds?: string[]): Array<{
    workspaceId: string;
    workspaceName: string;
    totalComponents: number;
    totalApplications: number;
    adoptionRate: number;
    healthScore: number;
  }> {
    const workspacesToCompare = workspaceIds
      ? Array.from(this.workspaces.values()).filter(ws => workspaceIds.includes(ws.id))
      : Array.from(this.workspaces.values());

    return workspacesToCompare.map(workspace => {
      const analytics = this.getWorkspaceAnalytics(workspace.id);
      return {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        totalComponents: analytics.totalComponents,
        totalApplications: analytics.totalApplications,
        adoptionRate: analytics.adoptionRate,
        healthScore: analytics.healthScore,
      };
    }).sort((a, b) => b.healthScore - a.healthScore);
  }

  // ==================== Workspace Fonts ====================

  /**
   * Add font to workspace
   */
  addWorkspaceFont(workspaceId: string, data: {
    name: string;
    family: string;
    weights: string[];
    styles: string[];
    source: 'google' | 'custom' | 'system';
    url?: string;
    fallback?: string;
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceFont {
    const font: WorkspaceFont = {
      id: `font-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
    };

    this.workspaceFonts.set(font.id, font);
    return font;
  }

  /**
   * Get fonts for workspace (including shared and global)
   */
  getWorkspaceFonts(workspaceId: string, userId?: string): WorkspaceFont[] {
    // Check access
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }

    return Array.from(this.workspaceFonts.values()).filter(font =>
      font.workspaceId === workspaceId ||
      font.isGlobal === true ||
      (font.sharedWith && font.sharedWith.includes(workspaceId))
    );
  }

  /**
   * Update workspace font
   */
  updateWorkspaceFont(fontId: string, updates: Partial<Pick<WorkspaceFont, 'name' | 'family' | 'weights' | 'styles' | 'url' | 'fallback'>>): WorkspaceFont | null {
    const font = this.workspaceFonts.get(fontId);
    if (!font) return null;

    Object.assign(font, updates);
    this.workspaceFonts.set(fontId, font);
    return font;
  }

  /**
   * Delete workspace font
   */
  deleteWorkspaceFont(fontId: string): boolean {
    return this.workspaceFonts.delete(fontId);
  }

  /**
   * Share font with workspace(s)
   */
  shareWorkspaceFont(fontId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceFont | null {
    const font = this.workspaceFonts.get(fontId);
    if (!font) return null;

    if (font.workspaceId !== requestingWorkspaceId && !font.isGlobal) {
      return null;
    }

    if (!font.sharedWith) {
      font.sharedWith = [];
    }

    workspaceIds.forEach(wsId => {
      if (!font.sharedWith!.includes(wsId)) {
        font.sharedWith!.push(wsId);
      }
    });

    this.workspaceFonts.set(fontId, font);
    return font;
  }

  /**
   * Make font global
   */
  makeWorkspaceFontGlobal(fontId: string, requestingWorkspaceId: string): WorkspaceFont | null {
    const font = this.workspaceFonts.get(fontId);
    if (!font) return null;

    if (font.workspaceId !== requestingWorkspaceId) {
      return null;
    }

    font.isGlobal = true;
    font.sharedWith = undefined;
    this.workspaceFonts.set(fontId, font);
    return font;
  }

  // ==================== Workspace Assets ====================

  /**
   * Add asset to workspace
   */
  addWorkspaceAsset(workspaceId: string, data: {
    name: string;
    type: 'image' | 'icon' | 'illustration' | 'logo' | 'other';
    url: string;
    thumbnailUrl?: string;
    size?: number;
    format?: string;
    tags?: string[];
    description?: string;
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceAsset {
    const asset: WorkspaceAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };

    this.workspaceAssets.set(asset.id, asset);
    return asset;
  }

  /**
   * Get assets for workspace (including shared and global)
   */
  getWorkspaceAssets(workspaceId: string, userId?: string, type?: string): WorkspaceAsset[] {
    // Check access
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }

    let assets = Array.from(this.workspaceAssets.values()).filter(asset =>
      asset.workspaceId === workspaceId ||
      asset.isGlobal === true ||
      (asset.sharedWith && asset.sharedWith.includes(workspaceId))
    );

    if (type) {
      assets = assets.filter(asset => asset.type === type);
    }

    return assets;
  }

  /**
   * Update workspace asset
   */
  updateWorkspaceAsset(assetId: string, updates: Partial<Pick<WorkspaceAsset, 'name' | 'description' | 'tags'>>): WorkspaceAsset | null {
    const asset = this.workspaceAssets.get(assetId);
    if (!asset) return null;

    Object.assign(asset, updates);
    this.workspaceAssets.set(assetId, asset);
    return asset;
  }

  /**
   * Delete workspace asset
   */
  deleteWorkspaceAsset(assetId: string): boolean {
    return this.workspaceAssets.delete(assetId);
  }

  /**
   * Share asset with workspace(s)
   */
  shareWorkspaceAsset(assetId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceAsset | null {
    const asset = this.workspaceAssets.get(assetId);
    if (!asset) return null;

    if (asset.workspaceId !== requestingWorkspaceId && !asset.isGlobal) {
      return null;
    }

    if (!asset.sharedWith) {
      asset.sharedWith = [];
    }

    workspaceIds.forEach(wsId => {
      if (!asset.sharedWith!.includes(wsId)) {
        asset.sharedWith!.push(wsId);
      }
    });

    this.workspaceAssets.set(assetId, asset);
    return asset;
  }

  /**
   * Make asset global
   */
  makeWorkspaceAssetGlobal(assetId: string, requestingWorkspaceId: string): WorkspaceAsset | null {
    const asset = this.workspaceAssets.get(assetId);
    if (!asset) return null;

    if (asset.workspaceId !== requestingWorkspaceId) {
      return null;
    }

    asset.isGlobal = true;
    asset.sharedWith = undefined;
    this.workspaceAssets.set(assetId, asset);
    return asset;
  }

  // ==================== Workspace Tokens ====================

  /**
   * Add token to workspace
   */
  addWorkspaceToken(workspaceId: string, data: {
    name: string;
    value: string;
    type: string;
    category: string;
    description?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceToken {
    const token: WorkspaceToken = {
      id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };

    this.workspaceTokens.set(token.id, token);
    return token;
  }

  /**
   * Get tokens for workspace (including shared and global)
   */
  getWorkspaceTokens(workspaceId: string, userId?: string, category?: string): WorkspaceToken[] {
    // Check access
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }

    let tokens = Array.from(this.workspaceTokens.values()).filter(token =>
      token.workspaceId === workspaceId ||
      token.isGlobal === true ||
      (token.sharedWith && token.sharedWith.includes(workspaceId))
    );

    if (category) {
      tokens = tokens.filter(token => token.category === category);
    }

    return tokens;
  }

  /**
   * Update workspace token
   */
  updateWorkspaceToken(tokenId: string, updates: Partial<Pick<WorkspaceToken, 'name' | 'value' | 'description' | 'tags'>>): WorkspaceToken | null {
    const token = this.workspaceTokens.get(tokenId);
    if (!token) return null;

    Object.assign(token, updates);
    this.workspaceTokens.set(tokenId, token);
    return token;
  }

  /**
   * Delete workspace token
   */
  deleteWorkspaceToken(tokenId: string): boolean {
    return this.workspaceTokens.delete(tokenId);
  }

  /**
   * Share token with workspace(s)
   */
  shareWorkspaceToken(tokenId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceToken | null {
    const token = this.workspaceTokens.get(tokenId);
    if (!token) return null;

    if (token.workspaceId !== requestingWorkspaceId && !token.isGlobal) {
      return null;
    }

    if (!token.sharedWith) {
      token.sharedWith = [];
    }

    workspaceIds.forEach(wsId => {
      if (!token.sharedWith!.includes(wsId)) {
        token.sharedWith!.push(wsId);
      }
    });

    this.workspaceTokens.set(tokenId, token);
    return token;
  }

  /**
   * Make token global
   */
  makeWorkspaceTokenGlobal(tokenId: string, requestingWorkspaceId: string): WorkspaceToken | null {
    const token = this.workspaceTokens.get(tokenId);
    if (!token) return null;

    if (token.workspaceId !== requestingWorkspaceId) {
      return null;
    }

    token.isGlobal = true;
    token.sharedWith = undefined;
    this.workspaceTokens.set(tokenId, token);
    return token;
  }

  // ==================== Workspace Reviews ====================

  addWorkspaceReview(workspaceId: string, data: {
    title: string;
    description?: string;
    status?: 'pending' | 'in-review' | 'approved' | 'rejected';
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceReview {
    const review: WorkspaceReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceReviews.set(review.id, review);
    return review;
  }

  getWorkspaceReviews(workspaceId: string, userId?: string): WorkspaceReview[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    return Array.from(this.workspaceReviews.values()).filter(review =>
      review.workspaceId === workspaceId ||
      review.isGlobal === true ||
      (review.sharedWith && review.sharedWith.includes(workspaceId))
    );
  }

  updateWorkspaceReview(reviewId: string, updates: Partial<Pick<WorkspaceReview, 'title' | 'description' | 'status' | 'url' | 'tags'>>): WorkspaceReview | null {
    const review = this.workspaceReviews.get(reviewId);
    if (!review) return null;
    Object.assign(review, updates);
    this.workspaceReviews.set(reviewId, review);
    return review;
  }

  deleteWorkspaceReview(reviewId: string): boolean {
    return this.workspaceReviews.delete(reviewId);
  }

  shareWorkspaceReview(reviewId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceReview | null {
    const review = this.workspaceReviews.get(reviewId);
    if (!review) return null;
    if (review.workspaceId !== requestingWorkspaceId && !review.isGlobal) return null;
    if (!review.sharedWith) review.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!review.sharedWith!.includes(wsId)) {
        review.sharedWith!.push(wsId);
      }
    });
    this.workspaceReviews.set(reviewId, review);
    return review;
  }

  makeWorkspaceReviewGlobal(reviewId: string, requestingWorkspaceId: string): WorkspaceReview | null {
    const review = this.workspaceReviews.get(reviewId);
    if (!review || review.workspaceId !== requestingWorkspaceId) return null;
    review.isGlobal = true;
    review.sharedWith = undefined;
    this.workspaceReviews.set(reviewId, review);
    return review;
  }

  // ==================== Workspace Session Replays ====================

  addWorkspaceSessionReplay(workspaceId: string, data: {
    name: string;
    description?: string;
    projectId?: string;
    sessionId?: string;
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceSessionReplay {
    const replay: WorkspaceSessionReplay = {
      id: `session-replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceSessionReplays.set(replay.id, replay);
    return replay;
  }

  getWorkspaceSessionReplays(workspaceId: string, userId?: string): WorkspaceSessionReplay[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    return Array.from(this.workspaceSessionReplays.values()).filter(replay =>
      replay.workspaceId === workspaceId ||
      replay.isGlobal === true ||
      (replay.sharedWith && replay.sharedWith.includes(workspaceId))
    );
  }

  updateWorkspaceSessionReplay(replayId: string, updates: Partial<Pick<WorkspaceSessionReplay, 'name' | 'description' | 'projectId' | 'sessionId' | 'url' | 'tags'>>): WorkspaceSessionReplay | null {
    const replay = this.workspaceSessionReplays.get(replayId);
    if (!replay) return null;
    Object.assign(replay, updates);
    this.workspaceSessionReplays.set(replayId, replay);
    return replay;
  }

  deleteWorkspaceSessionReplay(replayId: string): boolean {
    return this.workspaceSessionReplays.delete(replayId);
  }

  shareWorkspaceSessionReplay(replayId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceSessionReplay | null {
    const replay = this.workspaceSessionReplays.get(replayId);
    if (!replay) return null;
    if (replay.workspaceId !== requestingWorkspaceId && !replay.isGlobal) return null;
    if (!replay.sharedWith) replay.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!replay.sharedWith!.includes(wsId)) {
        replay.sharedWith!.push(wsId);
      }
    });
    this.workspaceSessionReplays.set(replayId, replay);
    return replay;
  }

  makeWorkspaceSessionReplayGlobal(replayId: string, requestingWorkspaceId: string): WorkspaceSessionReplay | null {
    const replay = this.workspaceSessionReplays.get(replayId);
    if (!replay || replay.workspaceId !== requestingWorkspaceId) return null;
    replay.isGlobal = true;
    replay.sharedWith = undefined;
    this.workspaceSessionReplays.set(replayId, replay);
    return replay;
  }

  // ==================== Workspace Journey Maps ====================

  addWorkspaceJourneyMap(workspaceId: string, data: {
    title: string;
    description?: string;
    persona?: string;
    stages?: Array<{ name: string; description?: string }>;
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceJourneyMap {
    const map: WorkspaceJourneyMap = {
      id: `journey-map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceJourneyMaps.set(map.id, map);
    return map;
  }

  getWorkspaceJourneyMaps(workspaceId: string, userId?: string): WorkspaceJourneyMap[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    return Array.from(this.workspaceJourneyMaps.values()).filter(map =>
      map.workspaceId === workspaceId ||
      map.isGlobal === true ||
      (map.sharedWith && map.sharedWith.includes(workspaceId))
    );
  }

  updateWorkspaceJourneyMap(mapId: string, updates: Partial<Pick<WorkspaceJourneyMap, 'title' | 'description' | 'persona' | 'stages' | 'url' | 'tags'>>): WorkspaceJourneyMap | null {
    const map = this.workspaceJourneyMaps.get(mapId);
    if (!map) return null;
    Object.assign(map, updates);
    this.workspaceJourneyMaps.set(mapId, map);
    return map;
  }

  deleteWorkspaceJourneyMap(mapId: string): boolean {
    return this.workspaceJourneyMaps.delete(mapId);
  }

  shareWorkspaceJourneyMap(mapId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceJourneyMap | null {
    const map = this.workspaceJourneyMaps.get(mapId);
    if (!map) return null;
    if (map.workspaceId !== requestingWorkspaceId && !map.isGlobal) return null;
    if (!map.sharedWith) map.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!map.sharedWith!.includes(wsId)) {
        map.sharedWith!.push(wsId);
      }
    });
    this.workspaceJourneyMaps.set(mapId, map);
    return map;
  }

  makeWorkspaceJourneyMapGlobal(mapId: string, requestingWorkspaceId: string): WorkspaceJourneyMap | null {
    const map = this.workspaceJourneyMaps.get(mapId);
    if (!map || map.workspaceId !== requestingWorkspaceId) return null;
    map.isGlobal = true;
    map.sharedWith = undefined;
    this.workspaceJourneyMaps.set(mapId, map);
    return map;
  }

  // ==================== Workspace HCD Reports ====================

  addWorkspaceHcdReport(workspaceId: string, data: {
    title: string;
    description?: string;
    reportType?: 'usability' | 'accessibility' | 'heuristic' | 'user-research' | 'other';
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceHcdReport {
    const report: WorkspaceHcdReport = {
      id: `hcd-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceHcdReports.set(report.id, report);
    return report;
  }

  getWorkspaceHcdReports(workspaceId: string, userId?: string, reportType?: string): WorkspaceHcdReport[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let reports = Array.from(this.workspaceHcdReports.values()).filter(report =>
      report.workspaceId === workspaceId ||
      report.isGlobal === true ||
      (report.sharedWith && report.sharedWith.includes(workspaceId))
    );
    if (reportType) {
      reports = reports.filter(report => report.reportType === reportType);
    }
    return reports;
  }

  updateWorkspaceHcdReport(reportId: string, updates: Partial<Pick<WorkspaceHcdReport, 'title' | 'description' | 'reportType' | 'url' | 'tags'>>): WorkspaceHcdReport | null {
    const report = this.workspaceHcdReports.get(reportId);
    if (!report) return null;
    Object.assign(report, updates);
    this.workspaceHcdReports.set(reportId, report);
    return report;
  }

  deleteWorkspaceHcdReport(reportId: string): boolean {
    return this.workspaceHcdReports.delete(reportId);
  }

  shareWorkspaceHcdReport(reportId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceHcdReport | null {
    const report = this.workspaceHcdReports.get(reportId);
    if (!report) return null;
    if (report.workspaceId !== requestingWorkspaceId && !report.isGlobal) return null;
    if (!report.sharedWith) report.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!report.sharedWith!.includes(wsId)) {
        report.sharedWith!.push(wsId);
      }
    });
    this.workspaceHcdReports.set(reportId, report);
    return report;
  }

  makeWorkspaceHcdReportGlobal(reportId: string, requestingWorkspaceId: string): WorkspaceHcdReport | null {
    const report = this.workspaceHcdReports.get(reportId);
    if (!report || report.workspaceId !== requestingWorkspaceId) return null;
    report.isGlobal = true;
    report.sharedWith = undefined;
    this.workspaceHcdReports.set(reportId, report);
    return report;
  }

  // ==================== Workspace User Personas ====================

  addWorkspaceUserPersona(workspaceId: string, data: {
    name: string;
    description?: string;
    demographics?: Record<string, any>;
    goals?: string[];
    painPoints?: string[];
    behaviors?: string[];
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceUserPersona {
    const persona: WorkspaceUserPersona = {
      id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceUserPersonas.set(persona.id, persona);
    return persona;
  }

  getWorkspaceUserPersonas(workspaceId: string, userId?: string): WorkspaceUserPersona[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    return Array.from(this.workspaceUserPersonas.values()).filter(persona =>
      persona.workspaceId === workspaceId ||
      persona.isGlobal === true ||
      (persona.sharedWith && persona.sharedWith.includes(workspaceId))
    );
  }

  updateWorkspaceUserPersona(personaId: string, updates: Partial<Pick<WorkspaceUserPersona, 'name' | 'description' | 'demographics' | 'goals' | 'painPoints' | 'behaviors' | 'url' | 'tags'>>): WorkspaceUserPersona | null {
    const persona = this.workspaceUserPersonas.get(personaId);
    if (!persona) return null;
    Object.assign(persona, updates);
    this.workspaceUserPersonas.set(personaId, persona);
    return persona;
  }

  deleteWorkspaceUserPersona(personaId: string): boolean {
    return this.workspaceUserPersonas.delete(personaId);
  }

  shareWorkspaceUserPersona(personaId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceUserPersona | null {
    const persona = this.workspaceUserPersonas.get(personaId);
    if (!persona) return null;
    if (persona.workspaceId !== requestingWorkspaceId && !persona.isGlobal) return null;
    if (!persona.sharedWith) persona.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!persona.sharedWith!.includes(wsId)) {
        persona.sharedWith!.push(wsId);
      }
    });
    this.workspaceUserPersonas.set(personaId, persona);
    return persona;
  }

  makeWorkspaceUserPersonaGlobal(personaId: string, requestingWorkspaceId: string): WorkspaceUserPersona | null {
    const persona = this.workspaceUserPersonas.get(personaId);
    if (!persona || persona.workspaceId !== requestingWorkspaceId) return null;
    persona.isGlobal = true;
    persona.sharedWith = undefined;
    this.workspaceUserPersonas.set(personaId, persona);
    return persona;
  }

  // ==================== Workspace Research Artifacts ====================

  addWorkspaceResearchArtifact(workspaceId: string, data: {
    title: string;
    description?: string;
    artifactType?: 'interview' | 'survey' | 'observation' | 'workshop' | 'other';
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceResearchArtifact {
    const artifact: WorkspaceResearchArtifact = {
      id: `research-artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceResearchArtifacts.set(artifact.id, artifact);
    return artifact;
  }

  getWorkspaceResearchArtifacts(workspaceId: string, userId?: string, artifactType?: string): WorkspaceResearchArtifact[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let artifacts = Array.from(this.workspaceResearchArtifacts.values()).filter(artifact =>
      artifact.workspaceId === workspaceId ||
      artifact.isGlobal === true ||
      (artifact.sharedWith && artifact.sharedWith.includes(workspaceId))
    );
    if (artifactType) {
      artifacts = artifacts.filter(artifact => artifact.artifactType === artifactType);
    }
    return artifacts;
  }

  updateWorkspaceResearchArtifact(artifactId: string, updates: Partial<Pick<WorkspaceResearchArtifact, 'title' | 'description' | 'artifactType' | 'url' | 'tags'>>): WorkspaceResearchArtifact | null {
    const artifact = this.workspaceResearchArtifacts.get(artifactId);
    if (!artifact) return null;
    Object.assign(artifact, updates);
    this.workspaceResearchArtifacts.set(artifactId, artifact);
    return artifact;
  }

  deleteWorkspaceResearchArtifact(artifactId: string): boolean {
    return this.workspaceResearchArtifacts.delete(artifactId);
  }

  shareWorkspaceResearchArtifact(artifactId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceResearchArtifact | null {
    const artifact = this.workspaceResearchArtifacts.get(artifactId);
    if (!artifact) return null;
    if (artifact.workspaceId !== requestingWorkspaceId && !artifact.isGlobal) return null;
    if (!artifact.sharedWith) artifact.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!artifact.sharedWith!.includes(wsId)) {
        artifact.sharedWith!.push(wsId);
      }
    });
    this.workspaceResearchArtifacts.set(artifactId, artifact);
    return artifact;
  }

  makeWorkspaceResearchArtifactGlobal(artifactId: string, requestingWorkspaceId: string): WorkspaceResearchArtifact | null {
    const artifact = this.workspaceResearchArtifacts.get(artifactId);
    if (!artifact || artifact.workspaceId !== requestingWorkspaceId) return null;
    artifact.isGlobal = true;
    artifact.sharedWith = undefined;
    this.workspaceResearchArtifacts.set(artifactId, artifact);
    return artifact;
  }

  // ==================== Workspace Insights ====================

  addWorkspaceInsight(workspaceId: string, data: {
    title: string;
    description?: string;
    category?: 'user-need' | 'pain-point' | 'opportunity' | 'finding' | 'other';
    priority?: 'high' | 'medium' | 'low';
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceInsight {
    const insight: WorkspaceInsight = {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceInsights.set(insight.id, insight);
    return insight;
  }

  getWorkspaceInsights(workspaceId: string, userId?: string, category?: string): WorkspaceInsight[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let insights = Array.from(this.workspaceInsights.values()).filter(insight =>
      insight.workspaceId === workspaceId ||
      insight.isGlobal === true ||
      (insight.sharedWith && insight.sharedWith.includes(workspaceId))
    );
    if (category) {
      insights = insights.filter(insight => insight.category === category);
    }
    return insights;
  }

  updateWorkspaceInsight(insightId: string, updates: Partial<Pick<WorkspaceInsight, 'title' | 'description' | 'category' | 'priority' | 'url' | 'tags'>>): WorkspaceInsight | null {
    const insight = this.workspaceInsights.get(insightId);
    if (!insight) return null;
    Object.assign(insight, updates);
    this.workspaceInsights.set(insightId, insight);
    return insight;
  }

  deleteWorkspaceInsight(insightId: string): boolean {
    return this.workspaceInsights.delete(insightId);
  }

  shareWorkspaceInsight(insightId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceInsight | null {
    const insight = this.workspaceInsights.get(insightId);
    if (!insight) return null;
    if (insight.workspaceId !== requestingWorkspaceId && !insight.isGlobal) return null;
    if (!insight.sharedWith) insight.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!insight.sharedWith!.includes(wsId)) {
        insight.sharedWith!.push(wsId);
      }
    });
    this.workspaceInsights.set(insightId, insight);
    return insight;
  }

  makeWorkspaceInsightGlobal(insightId: string, requestingWorkspaceId: string): WorkspaceInsight | null {
    const insight = this.workspaceInsights.get(insightId);
    if (!insight || insight.workspaceId !== requestingWorkspaceId) return null;
    insight.isGlobal = true;
    insight.sharedWith = undefined;
    this.workspaceInsights.set(insightId, insight);
    return insight;
  }

  // ==================== Workspace Patterns ====================

  addWorkspacePattern(workspaceId: string, data: {
    name: string;
    description?: string;
    category?: string;
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspacePattern {
    const pattern: WorkspacePattern = {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspacePatterns.set(pattern.id, pattern);
    return pattern;
  }

  getWorkspacePatterns(workspaceId: string, userId?: string, category?: string): WorkspacePattern[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let patterns = Array.from(this.workspacePatterns.values()).filter(pattern =>
      pattern.workspaceId === workspaceId ||
      pattern.isGlobal === true ||
      (pattern.sharedWith && pattern.sharedWith.includes(workspaceId))
    );
    if (category) {
      patterns = patterns.filter(pattern => pattern.category === category);
    }
    return patterns;
  }

  updateWorkspacePattern(patternId: string, updates: Partial<Pick<WorkspacePattern, 'name' | 'description' | 'category' | 'url' | 'tags'>>): WorkspacePattern | null {
    const pattern = this.workspacePatterns.get(patternId);
    if (!pattern) return null;
    Object.assign(pattern, updates);
    this.workspacePatterns.set(patternId, pattern);
    return pattern;
  }

  deleteWorkspacePattern(patternId: string): boolean {
    return this.workspacePatterns.delete(patternId);
  }

  shareWorkspacePattern(patternId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspacePattern | null {
    const pattern = this.workspacePatterns.get(patternId);
    if (!pattern) return null;
    if (pattern.workspaceId !== requestingWorkspaceId && !pattern.isGlobal) return null;
    if (!pattern.sharedWith) pattern.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!pattern.sharedWith!.includes(wsId)) {
        pattern.sharedWith!.push(wsId);
      }
    });
    this.workspacePatterns.set(patternId, pattern);
    return pattern;
  }

  makeWorkspacePatternGlobal(patternId: string, requestingWorkspaceId: string): WorkspacePattern | null {
    const pattern = this.workspacePatterns.get(patternId);
    if (!pattern || pattern.workspaceId !== requestingWorkspaceId) return null;
    pattern.isGlobal = true;
    pattern.sharedWith = undefined;
    this.workspacePatterns.set(patternId, pattern);
    return pattern;
  }

  // ==================== Workspace Icons ====================

  addWorkspaceIcon(workspaceId: string, data: {
    name: string;
    description?: string;
    iconSet?: string;
    svg?: string;
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceIcon {
    const icon: WorkspaceIcon = {
      id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceIcons.set(icon.id, icon);
    return icon;
  }

  getWorkspaceIcons(workspaceId: string, userId?: string, iconSet?: string): WorkspaceIcon[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let icons = Array.from(this.workspaceIcons.values()).filter(icon =>
      icon.workspaceId === workspaceId ||
      icon.isGlobal === true ||
      (icon.sharedWith && icon.sharedWith.includes(workspaceId))
    );
    if (iconSet) {
      icons = icons.filter(icon => icon.iconSet === iconSet);
    }
    return icons;
  }

  updateWorkspaceIcon(iconId: string, updates: Partial<Pick<WorkspaceIcon, 'name' | 'description' | 'iconSet' | 'svg' | 'url' | 'tags'>>): WorkspaceIcon | null {
    const icon = this.workspaceIcons.get(iconId);
    if (!icon) return null;
    Object.assign(icon, updates);
    this.workspaceIcons.set(iconId, icon);
    return icon;
  }

  deleteWorkspaceIcon(iconId: string): boolean {
    return this.workspaceIcons.delete(iconId);
  }

  shareWorkspaceIcon(iconId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceIcon | null {
    const icon = this.workspaceIcons.get(iconId);
    if (!icon) return null;
    if (icon.workspaceId !== requestingWorkspaceId && !icon.isGlobal) return null;
    if (!icon.sharedWith) icon.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!icon.sharedWith!.includes(wsId)) {
        icon.sharedWith!.push(wsId);
      }
    });
    this.workspaceIcons.set(iconId, icon);
    return icon;
  }

  makeWorkspaceIconGlobal(iconId: string, requestingWorkspaceId: string): WorkspaceIcon | null {
    const icon = this.workspaceIcons.get(iconId);
    if (!icon || icon.workspaceId !== requestingWorkspaceId) return null;
    icon.isGlobal = true;
    icon.sharedWith = undefined;
    this.workspaceIcons.set(iconId, icon);
    return icon;
  }

  // ==================== Workspace Interactives ====================

  addWorkspaceInteractive(workspaceId: string, data: {
    name: string;
    description?: string;
    type?: 'prototype' | 'demo' | 'sandbox' | 'other';
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceInteractive {
    const interactive: WorkspaceInteractive = {
      id: `interactive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceInteractives.set(interactive.id, interactive);
    return interactive;
  }

  getWorkspaceInteractives(workspaceId: string, userId?: string, type?: string): WorkspaceInteractive[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let interactives = Array.from(this.workspaceInteractives.values()).filter(interactive =>
      interactive.workspaceId === workspaceId ||
      interactive.isGlobal === true ||
      (interactive.sharedWith && interactive.sharedWith.includes(workspaceId))
    );
    if (type) {
      interactives = interactives.filter(interactive => interactive.type === type);
    }
    return interactives;
  }

  updateWorkspaceInteractive(interactiveId: string, updates: Partial<Pick<WorkspaceInteractive, 'name' | 'description' | 'type' | 'url' | 'tags'>>): WorkspaceInteractive | null {
    const interactive = this.workspaceInteractives.get(interactiveId);
    if (!interactive) return null;
    Object.assign(interactive, updates);
    this.workspaceInteractives.set(interactiveId, interactive);
    return interactive;
  }

  deleteWorkspaceInteractive(interactiveId: string): boolean {
    return this.workspaceInteractives.delete(interactiveId);
  }

  shareWorkspaceInteractive(interactiveId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceInteractive | null {
    const interactive = this.workspaceInteractives.get(interactiveId);
    if (!interactive) return null;
    if (interactive.workspaceId !== requestingWorkspaceId && !interactive.isGlobal) return null;
    if (!interactive.sharedWith) interactive.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!interactive.sharedWith!.includes(wsId)) {
        interactive.sharedWith!.push(wsId);
      }
    });
    this.workspaceInteractives.set(interactiveId, interactive);
    return interactive;
  }

  makeWorkspaceInteractiveGlobal(interactiveId: string, requestingWorkspaceId: string): WorkspaceInteractive | null {
    const interactive = this.workspaceInteractives.get(interactiveId);
    if (!interactive || interactive.workspaceId !== requestingWorkspaceId) return null;
    interactive.isGlobal = true;
    interactive.sharedWith = undefined;
    this.workspaceInteractives.set(interactiveId, interactive);
    return interactive;
  }

  // ==================== Workspace Stock Photos ====================

  addWorkspaceStockPhoto(workspaceId: string, data: {
    name: string;
    description?: string;
    url: string;
    thumbnailUrl?: string;
    photographer?: string;
    license?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceStockPhoto {
    const photo: WorkspaceStockPhoto = {
      id: `stock-photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceStockPhotos.set(photo.id, photo);
    return photo;
  }

  getWorkspaceStockPhotos(workspaceId: string, userId?: string): WorkspaceStockPhoto[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    return Array.from(this.workspaceStockPhotos.values()).filter(photo =>
      photo.workspaceId === workspaceId ||
      photo.isGlobal === true ||
      (photo.sharedWith && photo.sharedWith.includes(workspaceId))
    );
  }

  updateWorkspaceStockPhoto(photoId: string, updates: Partial<Pick<WorkspaceStockPhoto, 'name' | 'description' | 'photographer' | 'license' | 'tags'>>): WorkspaceStockPhoto | null {
    const photo = this.workspaceStockPhotos.get(photoId);
    if (!photo) return null;
    Object.assign(photo, updates);
    this.workspaceStockPhotos.set(photoId, photo);
    return photo;
  }

  deleteWorkspaceStockPhoto(photoId: string): boolean {
    return this.workspaceStockPhotos.delete(photoId);
  }

  shareWorkspaceStockPhoto(photoId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceStockPhoto | null {
    const photo = this.workspaceStockPhotos.get(photoId);
    if (!photo) return null;
    if (photo.workspaceId !== requestingWorkspaceId && !photo.isGlobal) return null;
    if (!photo.sharedWith) photo.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!photo.sharedWith!.includes(wsId)) {
        photo.sharedWith!.push(wsId);
      }
    });
    this.workspaceStockPhotos.set(photoId, photo);
    return photo;
  }

  makeWorkspaceStockPhotoGlobal(photoId: string, requestingWorkspaceId: string): WorkspaceStockPhoto | null {
    const photo = this.workspaceStockPhotos.get(photoId);
    if (!photo || photo.workspaceId !== requestingWorkspaceId) return null;
    photo.isGlobal = true;
    photo.sharedWith = undefined;
    this.workspaceStockPhotos.set(photoId, photo);
    return photo;
  }

  // ==================== Workspace Illustrations ====================

  addWorkspaceIllustration(workspaceId: string, data: {
    name: string;
    description?: string;
    url: string;
    thumbnailUrl?: string;
    style?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceIllustration {
    const illustration: WorkspaceIllustration = {
      id: `illustration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceIllustrations.set(illustration.id, illustration);
    return illustration;
  }

  getWorkspaceIllustrations(workspaceId: string, userId?: string, style?: string): WorkspaceIllustration[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let illustrations = Array.from(this.workspaceIllustrations.values()).filter(illustration =>
      illustration.workspaceId === workspaceId ||
      illustration.isGlobal === true ||
      (illustration.sharedWith && illustration.sharedWith.includes(workspaceId))
    );
    if (style) {
      illustrations = illustrations.filter(illustration => illustration.style === style);
    }
    return illustrations;
  }

  updateWorkspaceIllustration(illustrationId: string, updates: Partial<Pick<WorkspaceIllustration, 'name' | 'description' | 'style' | 'tags'>>): WorkspaceIllustration | null {
    const illustration = this.workspaceIllustrations.get(illustrationId);
    if (!illustration) return null;
    Object.assign(illustration, updates);
    this.workspaceIllustrations.set(illustrationId, illustration);
    return illustration;
  }

  deleteWorkspaceIllustration(illustrationId: string): boolean {
    return this.workspaceIllustrations.delete(illustrationId);
  }

  shareWorkspaceIllustration(illustrationId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceIllustration | null {
    const illustration = this.workspaceIllustrations.get(illustrationId);
    if (!illustration) return null;
    if (illustration.workspaceId !== requestingWorkspaceId && !illustration.isGlobal) return null;
    if (!illustration.sharedWith) illustration.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!illustration.sharedWith!.includes(wsId)) {
        illustration.sharedWith!.push(wsId);
      }
    });
    this.workspaceIllustrations.set(illustrationId, illustration);
    return illustration;
  }

  makeWorkspaceIllustrationGlobal(illustrationId: string, requestingWorkspaceId: string): WorkspaceIllustration | null {
    const illustration = this.workspaceIllustrations.get(illustrationId);
    if (!illustration || illustration.workspaceId !== requestingWorkspaceId) return null;
    illustration.isGlobal = true;
    illustration.sharedWith = undefined;
    this.workspaceIllustrations.set(illustrationId, illustration);
    return illustration;
  }

  // ==================== Workspace Capability Logos ====================

  addWorkspaceCapabilityLogo(workspaceId: string, data: {
    name: string;
    description?: string;
    capability?: string;
    url: string;
    thumbnailUrl?: string;
    format?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceCapabilityLogo {
    const logo: WorkspaceCapabilityLogo = {
      id: `capability-logo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceCapabilityLogos.set(logo.id, logo);
    return logo;
  }

  getWorkspaceCapabilityLogos(workspaceId: string, userId?: string, capability?: string): WorkspaceCapabilityLogo[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let logos = Array.from(this.workspaceCapabilityLogos.values()).filter(logo =>
      logo.workspaceId === workspaceId ||
      logo.isGlobal === true ||
      (logo.sharedWith && logo.sharedWith.includes(workspaceId))
    );
    if (capability) {
      logos = logos.filter(logo => logo.capability === capability);
    }
    return logos;
  }

  updateWorkspaceCapabilityLogo(logoId: string, updates: Partial<Pick<WorkspaceCapabilityLogo, 'name' | 'description' | 'capability' | 'tags'>>): WorkspaceCapabilityLogo | null {
    const logo = this.workspaceCapabilityLogos.get(logoId);
    if (!logo) return null;
    Object.assign(logo, updates);
    this.workspaceCapabilityLogos.set(logoId, logo);
    return logo;
  }

  deleteWorkspaceCapabilityLogo(logoId: string): boolean {
    return this.workspaceCapabilityLogos.delete(logoId);
  }

  shareWorkspaceCapabilityLogo(logoId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceCapabilityLogo | null {
    const logo = this.workspaceCapabilityLogos.get(logoId);
    if (!logo) return null;
    if (logo.workspaceId !== requestingWorkspaceId && !logo.isGlobal) return null;
    if (!logo.sharedWith) logo.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!logo.sharedWith!.includes(wsId)) {
        logo.sharedWith!.push(wsId);
      }
    });
    this.workspaceCapabilityLogos.set(logoId, logo);
    return logo;
  }

  makeWorkspaceCapabilityLogoGlobal(logoId: string, requestingWorkspaceId: string): WorkspaceCapabilityLogo | null {
    const logo = this.workspaceCapabilityLogos.get(logoId);
    if (!logo || logo.workspaceId !== requestingWorkspaceId) return null;
    logo.isGlobal = true;
    logo.sharedWith = undefined;
    this.workspaceCapabilityLogos.set(logoId, logo);
    return logo;
  }

  // ==================== Workspace Style Dictionaries ====================

  addWorkspaceStyleDictionary(workspaceId: string, data: {
    name: string;
    description?: string;
    format?: 'json' | 'css' | 'scss' | 'less' | 'js' | 'ts';
    tokens?: Record<string, any>;
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceStyleDictionary {
    const dict: WorkspaceStyleDictionary = {
      id: `style-dict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceStyleDictionaries.set(dict.id, dict);
    return dict;
  }

  getWorkspaceStyleDictionaries(workspaceId: string, userId?: string, format?: string): WorkspaceStyleDictionary[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let dicts = Array.from(this.workspaceStyleDictionaries.values()).filter(dict =>
      dict.workspaceId === workspaceId ||
      dict.isGlobal === true ||
      (dict.sharedWith && dict.sharedWith.includes(workspaceId))
    );
    if (format) {
      dicts = dicts.filter(dict => dict.format === format);
    }
    return dicts;
  }

  updateWorkspaceStyleDictionary(dictId: string, updates: Partial<Pick<WorkspaceStyleDictionary, 'name' | 'description' | 'format' | 'tokens' | 'url' | 'tags'>>): WorkspaceStyleDictionary | null {
    const dict = this.workspaceStyleDictionaries.get(dictId);
    if (!dict) return null;
    Object.assign(dict, updates);
    this.workspaceStyleDictionaries.set(dictId, dict);
    return dict;
  }

  deleteWorkspaceStyleDictionary(dictId: string): boolean {
    return this.workspaceStyleDictionaries.delete(dictId);
  }

  shareWorkspaceStyleDictionary(dictId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceStyleDictionary | null {
    const dict = this.workspaceStyleDictionaries.get(dictId);
    if (!dict) return null;
    if (dict.workspaceId !== requestingWorkspaceId && !dict.isGlobal) return null;
    if (!dict.sharedWith) dict.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!dict.sharedWith!.includes(wsId)) {
        dict.sharedWith!.push(wsId);
      }
    });
    this.workspaceStyleDictionaries.set(dictId, dict);
    return dict;
  }

  makeWorkspaceStyleDictionaryGlobal(dictId: string, requestingWorkspaceId: string): WorkspaceStyleDictionary | null {
    const dict = this.workspaceStyleDictionaries.get(dictId);
    if (!dict || dict.workspaceId !== requestingWorkspaceId) return null;
    dict.isGlobal = true;
    dict.sharedWith = undefined;
    this.workspaceStyleDictionaries.set(dictId, dict);
    return dict;
  }

  // ==================== Workspace Guidelines ====================

  addWorkspaceGuideline(workspaceId: string, data: {
    title: string;
    description?: string;
    category?: 'design' | 'accessibility' | 'content' | 'interaction' | 'visual' | 'technical' | 'other';
    content?: string;
    url?: string;
    tags?: string[];
    createdBy: string;
    sharedWith?: string[];
    isGlobal?: boolean;
  }): WorkspaceGuideline {
    const guideline: WorkspaceGuideline = {
      id: `guideline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      workspaceId,
      createdAt: new Date(),
      sharedWith: data.sharedWith || [],
      isGlobal: data.isGlobal || false,
      tags: data.tags || [],
    };
    this.workspaceGuidelines.set(guideline.id, guideline);
    return guideline;
  }

  getWorkspaceGuidelines(workspaceId: string, userId?: string, category?: string): WorkspaceGuideline[] {
    if (userId && !this.hasWorkspaceAccess(workspaceId, userId, 'viewer')) {
      return [];
    }
    let guidelines = Array.from(this.workspaceGuidelines.values()).filter(guideline =>
      guideline.workspaceId === workspaceId ||
      guideline.isGlobal === true ||
      (guideline.sharedWith && guideline.sharedWith.includes(workspaceId))
    );
    if (category) {
      guidelines = guidelines.filter(guideline => guideline.category === category);
    }
    return guidelines;
  }

  updateWorkspaceGuideline(guidelineId: string, updates: Partial<Pick<WorkspaceGuideline, 'title' | 'description' | 'category' | 'content' | 'url' | 'tags'>>): WorkspaceGuideline | null {
    const guideline = this.workspaceGuidelines.get(guidelineId);
    if (!guideline) return null;
    Object.assign(guideline, updates);
    this.workspaceGuidelines.set(guidelineId, guideline);
    return guideline;
  }

  deleteWorkspaceGuideline(guidelineId: string): boolean {
    return this.workspaceGuidelines.delete(guidelineId);
  }

  shareWorkspaceGuideline(guidelineId: string, workspaceIds: string[], requestingWorkspaceId: string): WorkspaceGuideline | null {
    const guideline = this.workspaceGuidelines.get(guidelineId);
    if (!guideline) return null;
    if (guideline.workspaceId !== requestingWorkspaceId && !guideline.isGlobal) return null;
    if (!guideline.sharedWith) guideline.sharedWith = [];
    workspaceIds.forEach(wsId => {
      if (!guideline.sharedWith!.includes(wsId)) {
        guideline.sharedWith!.push(wsId);
      }
    });
    this.workspaceGuidelines.set(guidelineId, guideline);
    return guideline;
  }

  makeWorkspaceGuidelineGlobal(guidelineId: string, requestingWorkspaceId: string): WorkspaceGuideline | null {
    const guideline = this.workspaceGuidelines.get(guidelineId);
    if (!guideline || guideline.workspaceId !== requestingWorkspaceId) return null;
    guideline.isGlobal = true;
    guideline.sharedWith = undefined;
    this.workspaceGuidelines.set(guidelineId, guideline);
    return guideline;
  }

  // ==================== User Management ====================

  /**
   * Get all users with their workspace memberships
   */
  getAllUsersWithWorkspaces(): Array<{
    userId: string;
    email: string;
    workspaces: Array<{
      workspaceId: string;
      workspaceName: string;
      role: 'owner' | 'admin' | 'editor' | 'viewer';
    }>;
  }> {
    const userMap = new Map<string, {
      userId: string;
      email: string;
      workspaces: Array<{
        workspaceId: string;
        workspaceName: string;
        role: 'owner' | 'admin' | 'editor' | 'viewer';
      }>;
    }>();

    // Iterate through all workspaces to collect user memberships
    this.workspaces.forEach(workspace => {
      // Add owner
      if (!userMap.has(workspace.ownerId)) {
        userMap.set(workspace.ownerId, {
          userId: workspace.ownerId,
          email: workspace.members.find(m => m.userId === workspace.ownerId)?.email || `${workspace.ownerId}@example.com`,
          workspaces: [],
        });
      }
      const owner = userMap.get(workspace.ownerId)!;
      owner.workspaces.push({
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        role: 'owner',
      });

      // Add members
      workspace.members.forEach(member => {
        if (!userMap.has(member.userId)) {
          userMap.set(member.userId, {
            userId: member.userId,
            email: member.email,
            workspaces: [],
          });
        }
        const user = userMap.get(member.userId)!;
        // Only add if not already added as owner
        if (!user.workspaces.some(ws => ws.workspaceId === workspace.id)) {
          user.workspaces.push({
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            role: member.role,
          });
        }
      });
    });

    return Array.from(userMap.values());
  }

  /**
   * Get workspaces for a specific user
   */
  getUserWorkspaces(userId: string): Array<{
    workspaceId: string;
    workspaceName: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
  }> {
    const workspaces: Array<{
      workspaceId: string;
      workspaceName: string;
      role: 'owner' | 'admin' | 'editor' | 'viewer';
    }> = [];

    this.workspaces.forEach(workspace => {
      // Check if user is owner
      if (workspace.ownerId === userId) {
        workspaces.push({
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          role: 'owner',
        });
        return;
      }

      // Check if user is a member
      const member = workspace.members.find(m => m.userId === userId);
      if (member) {
        workspaces.push({
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          role: member.role,
        });
      }
    });

    return workspaces;
  }

  /**
   * Add user to workspace (alias for addWorkspaceMember)
   */
  addUserToWorkspace(workspaceId: string, userId: string, email: string, role: 'admin' | 'editor' | 'viewer', addedBy: string): Workspace | null {
    return this.addWorkspaceMember(workspaceId, {
      userId,
      email,
      role,
      addedBy,
    });
  }

  /**
   * Remove user from workspace (alias for removeWorkspaceMember)
   */
  removeUserFromWorkspace(workspaceId: string, userId: string): Workspace | null {
    return this.removeWorkspaceMember(workspaceId, userId);
  }
}
