import { Injectable } from '@nestjs/common';
import { DesignSystemService, Component } from '../design-system/design-system.service';

export interface ComponentUsage {
  componentId: string;
  componentName: string;
  applicationId: string;
  applicationName: string;
  usageCount: number;
  files: string[];
  firstSeen: Date;
  lastSeen: Date;
}

export interface ComponentUsageSnapshot {
  date: string; // ISO date string
  componentId: string;
  componentName: string;
  totalUsage: number;
  applicationCount: number;
  applications: {
    applicationId: string;
    applicationName: string;
    usageCount: number;
  }[];
}

export interface ComponentPopularity {
  componentId: string;
  componentName: string;
  totalUsage: number;
  applicationCount: number;
  adoptionRate: number; // Percentage of applications using this component
  trend: 'up' | 'down' | 'stable';
  trendChange: number; // Percentage change
}

export interface ApplicationAdoption {
  applicationId: string;
  applicationName: string;
  totalComponents: number;
  designSystemComponents: number;
  adoptionRate: number; // Percentage of design system components used
  lastScanned?: Date;
}

export interface UsageTrend {
  date: string;
  totalUsage: number;
  uniqueComponents: number;
  uniqueApplications: number;
}

export interface DesignDebtMetrics {
  deprecatedComponentsInUse: number;
  customComponentCount: number;
  technicalDebtScore: number; // 0-100, higher = more debt
  recommendations: string[];
}

export interface CrossApplicationComparison {
  applicationId: string;
  applicationName: string;
  componentsUsed: string[];
  uniqueComponents: number;
  sharedComponents: string[];
  adoptionRate: number;
}

@Injectable()
export class AnalyticsService {
  private componentUsage: Map<string, ComponentUsage[]> = new Map(); // componentId -> usage records
  private usageHistory: ComponentUsageSnapshot[] = [];
  private readonly MAX_HISTORY_DAYS = 365; // Keep 1 year of history

  constructor(
    private readonly designSystemService: DesignSystemService,
  ) {
    // Initialize with some mock historical data for demonstration
    this.initializeMockHistory();
  }

  /**
   * Track component usage from a scan
   */
  trackComponentUsage(
    applicationId: string,
    applicationName: string,
    detectedComponents: { componentId: string; componentName: string; files: string[] }[],
  ): void {
    const now = new Date();

    detectedComponents.forEach(({ componentId, componentName, files }) => {
      if (!this.componentUsage.has(componentId)) {
        this.componentUsage.set(componentId, []);
      }

      const usageRecords = this.componentUsage.get(componentId)!;
      const existingRecord = usageRecords.find(r => r.applicationId === applicationId);

      if (existingRecord) {
        // Update existing record
        existingRecord.usageCount = files.length;
        existingRecord.files = files;
        existingRecord.lastSeen = now;
      } else {
        // Create new record
        usageRecords.push({
          componentId,
          componentName,
          applicationId,
          applicationName,
          usageCount: files.length,
          files,
          firstSeen: now,
          lastSeen: now,
        });
      }
    });

    // Create a snapshot for historical tracking
    this.createUsageSnapshot();
  }

  /**
   * Get component popularity rankings
   */
  getComponentPopularity(timeframe: '7d' | '30d' | '90d' | 'all' = 'all'): ComponentPopularity[] {
    const cutoffDate = this.getCutoffDate(timeframe);
    const allComponents = this.designSystemService.getAllComponents();
    const allApplications = Array.from(this.designSystemService.getAllApplications({}).applications);
    const totalApplications = allApplications.length;

    const popularity: ComponentPopularity[] = [];

    allComponents.forEach(component => {
      const usageRecords = this.componentUsage.get(component.id) || [];
      const filteredRecords = usageRecords.filter(r => 
        timeframe === 'all' || new Date(r.lastSeen) >= cutoffDate
      );

      const totalUsage = filteredRecords.reduce((sum, r) => sum + r.usageCount, 0);
      const applicationCount = filteredRecords.length;
      const adoptionRate = totalApplications > 0 ? (applicationCount / totalApplications) * 100 : 0;

      // Calculate trend
      const trend = this.calculateTrend(component.id, timeframe);
      
      popularity.push({
        componentId: component.id,
        componentName: component.name,
        totalUsage,
        applicationCount,
        adoptionRate: parseFloat(adoptionRate.toFixed(1)),
        trend: trend.direction,
        trendChange: trend.change,
      });
    });

    return popularity.sort((a, b) => b.totalUsage - a.totalUsage);
  }

  /**
   * Get usage analytics for a specific component
   */
  getComponentUsageAnalytics(componentId: string, timeframe: '7d' | '30d' | '90d' | 'all' = 'all') {
    const cutoffDate = this.getCutoffDate(timeframe);
    const usageRecords = this.componentUsage.get(componentId) || [];
    const filteredRecords = usageRecords.filter(r => 
      timeframe === 'all' || new Date(r.lastSeen) >= cutoffDate
    );

    const totalUsage = filteredRecords.reduce((sum, r) => sum + r.usageCount, 0);
    const applications = filteredRecords.map(r => ({
      applicationId: r.applicationId,
      applicationName: r.applicationName,
      usageCount: r.usageCount,
      files: r.files,
      lastSeen: r.lastSeen,
    }));

    return {
      componentId,
      componentName: filteredRecords[0]?.componentName || componentId,
      totalUsage,
      applicationCount: filteredRecords.length,
      applications,
    };
  }

  /**
   * Get application adoption metrics
   */
  getApplicationAdoption(): ApplicationAdoption[] {
    const allApplications = Array.from(this.designSystemService.getAllApplications({}).applications);
    const allComponents = this.designSystemService.getAllComponents();
    const productionComponents = allComponents.filter(c => c.status === 'production');

    return allApplications.map(app => {
      const componentsUsed = new Set<string>();
      
      // Find all components used by this application
      this.componentUsage.forEach((usageRecords, componentId) => {
        const appUsage = usageRecords.find(r => r.applicationId === app.id);
        if (appUsage) {
          componentsUsed.add(componentId);
        }
      });

      const designSystemComponents = Array.from(componentsUsed).filter(id => 
        productionComponents.some(c => c.id === id)
      ).length;

      const adoptionRate = productionComponents.length > 0
        ? (designSystemComponents / productionComponents.length) * 100
        : 0;

      return {
        applicationId: app.id,
        applicationName: app.name,
        totalComponents: componentsUsed.size,
        designSystemComponents,
        adoptionRate: parseFloat(adoptionRate.toFixed(1)),
        lastScanned: app.lastScanned,
      };
    });
  }

  /**
   * Get usage trends over time
   */
  getUsageTrends(days: number = 30): UsageTrend[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredHistory = this.usageHistory.filter(snapshot => 
      new Date(snapshot.date) >= cutoffDate
    );

    // Group by date
    const trendsByDate = new Map<string, UsageTrend>();

    filteredHistory.forEach(snapshot => {
      const date = snapshot.date.split('T')[0]; // Just the date part
      
      if (!trendsByDate.has(date)) {
        trendsByDate.set(date, {
          date,
          totalUsage: 0,
          uniqueComponents: new Set<string>().size,
          uniqueApplications: new Set<string>().size,
        });
      }

      const trend = trendsByDate.get(date)!;
      trend.totalUsage += snapshot.totalUsage;
      
      // Update unique counts
      const components = new Set<string>();
      const applications = new Set<string>();
      
      snapshot.applications.forEach(app => {
        applications.add(app.applicationId);
      });
      components.add(snapshot.componentId);

      // Merge with existing
      filteredHistory.forEach(s => {
        if (s.date.startsWith(date)) {
          s.applications.forEach(a => applications.add(a.applicationId));
          components.add(s.componentId);
        }
      });

      trend.uniqueComponents = components.size;
      trend.uniqueApplications = applications.size;
    });

    return Array.from(trendsByDate.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Get cross-application comparison
   */
  getCrossApplicationComparison(applicationIds?: string[]): CrossApplicationComparison[] {
    const allApplications = Array.from(this.designSystemService.getAllApplications({}).applications);
    const applicationsToCompare = applicationIds
      ? allApplications.filter(app => applicationIds.includes(app.id))
      : allApplications;

    const allComponents = this.designSystemService.getAllComponents();
    const productionComponents = allComponents.filter(c => c.status === 'production');

    return applicationsToCompare.map(app => {
      const componentsUsed = new Set<string>();
      
      this.componentUsage.forEach((usageRecords, componentId) => {
        const appUsage = usageRecords.find(r => r.applicationId === app.id);
        if (appUsage) {
          componentsUsed.add(componentId);
        }
      });

      const componentsArray = Array.from(componentsUsed);
      const designSystemComponents = componentsArray.filter(id => 
        productionComponents.some(c => c.id === id)
      );

      // Find shared components (used by all compared applications)
      const sharedComponents = productionComponents
        .filter(comp => {
          return applicationsToCompare.every(appToCheck => {
            const usageRecords = this.componentUsage.get(comp.id) || [];
            return usageRecords.some(r => r.applicationId === appToCheck.id);
          });
        })
        .map(comp => comp.name);

      const adoptionRate = productionComponents.length > 0
        ? (designSystemComponents.length / productionComponents.length) * 100
        : 0;

      return {
        applicationId: app.id,
        applicationName: app.name,
        componentsUsed: componentsArray,
        uniqueComponents: componentsArray.length,
        sharedComponents,
        adoptionRate: parseFloat(adoptionRate.toFixed(1)),
      };
    });
  }

  /**
   * Get design debt metrics
   */
  getDesignDebtMetrics(): DesignDebtMetrics {
    const allComponents = this.designSystemService.getAllComponents();
    const deprecatedComponents = allComponents.filter(c => c.status === 'deprecated');
    
    // Find deprecated components still in use
    const deprecatedInUse = deprecatedComponents.filter(comp => {
      const usageRecords = this.componentUsage.get(comp.id) || [];
      return usageRecords.length > 0;
    });

    // Estimate custom components (components used but not in design system)
    const allUsedComponentIds = new Set<string>();
    this.componentUsage.forEach((_, componentId) => {
      allUsedComponentIds.add(componentId);
    });
    
    const knownComponentIds = new Set(allComponents.map(c => c.id));
    const customComponents = Array.from(allUsedComponentIds).filter(id => !knownComponentIds.has(id));

    // Calculate technical debt score (0-100, higher = more debt)
    const deprecatedPenalty = deprecatedInUse.length * 10;
    const customPenalty = customComponents.length * 5;
    const technicalDebtScore = Math.min(100, deprecatedPenalty + customPenalty);

    const recommendations: string[] = [];
    if (deprecatedInUse.length > 0) {
      recommendations.push(`Replace ${deprecatedInUse.length} deprecated component(s) still in use`);
    }
    if (customComponents.length > 0) {
      recommendations.push(`Consider adding ${customComponents.length} custom component(s) to the design system`);
    }
    if (technicalDebtScore < 20) {
      recommendations.push('Design system is in good health with minimal technical debt');
    }

    return {
      deprecatedComponentsInUse: deprecatedInUse.length,
      customComponentCount: customComponents.length,
      technicalDebtScore,
      recommendations,
    };
  }

  /**
   * Extract component names from code
   */
  extractComponentUsage(code: string, framework: 'vue' | 'react' = 'vue'): { componentId: string; componentName: string }[] {
    const allComponents = this.designSystemService.getAllComponents();
    const detected: { componentId: string; componentName: string }[] = [];

    allComponents.forEach(component => {
      // Check for component imports
      const importPatterns = [
        new RegExp(`import.*${component.name}.*from`, 'i'),
        new RegExp(`from.*['"]@designsystem`, 'i'),
        new RegExp(`require.*${component.name}`, 'i'),
      ];

      // Check for component usage in code
      const usagePatterns = [
        new RegExp(`<${component.name}[\\s>]`, 'i'),
        new RegExp(`<${component.name}\\s`, 'i'),
        new RegExp(`${component.name}\\(`, 'i'),
      ];

      const isImported = importPatterns.some(pattern => pattern.test(code));
      const isUsed = usagePatterns.some(pattern => pattern.test(code));

      if (isImported || isUsed) {
        detected.push({
          componentId: component.id,
          componentName: component.name,
        });
      }
    });

    return detected;
  }

  /**
   * Private helper methods
   */
  private createUsageSnapshot(): void {
    const now = new Date().toISOString();
    const allComponents = this.designSystemService.getAllComponents();

    allComponents.forEach(component => {
      const usageRecords = this.componentUsage.get(component.id) || [];
      const totalUsage = usageRecords.reduce((sum, r) => sum + r.usageCount, 0);

      if (totalUsage > 0) {
        this.usageHistory.push({
          date: now,
          componentId: component.id,
          componentName: component.name,
          totalUsage,
          applicationCount: usageRecords.length,
          applications: usageRecords.map(r => ({
            applicationId: r.applicationId,
            applicationName: r.applicationName,
            usageCount: r.usageCount,
          })),
        });
      }
    });

    // Keep only last MAX_HISTORY_DAYS
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_HISTORY_DAYS);
    this.usageHistory = this.usageHistory.filter(snapshot => 
      new Date(snapshot.date) >= cutoffDate
    );
  }

  private getCutoffDate(timeframe: '7d' | '30d' | '90d' | 'all'): Date {
    if (timeframe === 'all') {
      return new Date(0); // Beginning of time
    }

    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff;
  }

  private calculateTrend(componentId: string, timeframe: '7d' | '30d' | '90d' | 'all'): { direction: 'up' | 'down' | 'stable'; change: number } {
    if (timeframe === 'all' || this.usageHistory.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    const cutoffDate = this.getCutoffDate(timeframe);
    const relevantHistory = this.usageHistory
      .filter(s => s.componentId === componentId && new Date(s.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (relevantHistory.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    const first = relevantHistory[0].totalUsage;
    const last = relevantHistory[relevantHistory.length - 1].totalUsage;
    const change = first > 0 ? ((last - first) / first) * 100 : 0;

    if (change > 5) return { direction: 'up', change: parseFloat(change.toFixed(1)) };
    if (change < -5) return { direction: 'down', change: parseFloat(change.toFixed(1)) };
    return { direction: 'stable', change: parseFloat(change.toFixed(1)) };
  }

  private initializeMockHistory(): void {
    if (this.usageHistory.length > 0) return;

    try {
      const allComponents = this.designSystemService.getAllComponents();
      const appsResult = this.designSystemService.getAllApplications({});
      const applications = appsResult && appsResult.applications ? Array.from(appsResult.applications) : [];

      // Generate mock history for last 90 days
      const today = new Date();
      for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString();

        // Randomly assign component usage
        allComponents.forEach(component => {
          if (Math.random() > 0.3) { // 70% chance component is used
            const appCount = Math.floor(Math.random() * applications.length) + 1;
            const selectedApps = applications.slice(0, appCount);
            const totalUsage = Math.floor(Math.random() * 100) + 10;

            this.usageHistory.push({
              date: dateStr,
              componentId: component.id,
              componentName: component.name,
              totalUsage,
              applicationCount: appCount,
              applications: selectedApps.map(app => ({
                applicationId: app.id,
                applicationName: app.name,
                usageCount: Math.floor(totalUsage / appCount),
              })),
            });

            // Also update current usage
            selectedApps.forEach(app => {
              if (!this.componentUsage.has(component.id)) {
                this.componentUsage.set(component.id, []);
              }
              const usageRecords = this.componentUsage.get(component.id)!;
              const existing = usageRecords.find(r => r.applicationId === app.id);
              if (!existing) {
                usageRecords.push({
                  componentId: component.id,
                  componentName: component.name,
                  applicationId: app.id,
                  applicationName: app.name,
                  usageCount: Math.floor(totalUsage / appCount),
                  files: [`src/components/${component.name}.vue`],
                  firstSeen: date,
                  lastSeen: date,
                });
              }
            });
          }
        });
      }
    } catch (error) {
      // Silently fail if initialization fails - will retry later if needed
      console.warn('Failed to initialize mock history:', error);
    }
  }
}

