# Automated Accessibility Reports

## Overview

The Automated Accessibility Reports feature provides comprehensive WCAG compliance monitoring, trend tracking, and prioritized fix recommendations for applications registered with the design system.

## Features Implemented

### 1. Report Generation
- **On-demand reports**: Generate accessibility reports for any registered application
- **Scheduled reports**: Automatically generate reports on a daily, weekly, or monthly schedule
- **Comprehensive scanning**: Integrates with existing governance rules engine to scan for accessibility issues

### 2. WCAG Compliance Metrics
- **Compliance Score**: 0-100 score based on issue severity
- **WCAG Level**: Automatically determines compliance level (A, AA, AAA, or Non-Compliant)
- **Issue Breakdown**: Categorizes issues by:
  - Critical issues (blocking accessibility)
  - Serious issues (significant impact)
  - Moderate issues (moderate impact)
  - Minor issues (minor concerns)

### 3. WCAG Criteria Mapping
- Maps accessibility checks to specific WCAG 2.1 criteria:
  - **Level A**: 1.1.1, 1.3.1, 2.1.1, 2.4.2, 2.4.4, 3.3.2, 4.1.2
  - **Level AA**: 1.4.3, 1.4.5, 2.4.6, 2.4.7
- Shows pass/fail/warning status for each criterion
- Displays issue count per criterion

### 4. Issue Categorization
Tracks issues by category:
- Color Contrast
- Keyboard Navigation
- ARIA Attributes
- Focus Management
- Alt Text
- Heading Hierarchy
- Form Labels
- Photosensitivity
- Other

### 5. Prioritized Fixes
- **Priority Algorithm**: Calculates priority based on:
  - Severity (critical, serious, moderate, minor)
  - Number of affected elements
  - Estimated effort (low, medium, high)
- **Recommendations**: Provides specific, actionable recommendations for each fix
- **WCAG Reference**: Links each fix to the relevant WCAG criterion

### 6. Trend Tracking
- **Score Changes**: Tracks compliance score changes over time
- **Issue Changes**: Monitors total issue count trends
- **New vs. Fixed**: Identifies new issues and fixed issues between reports
- **Historical Comparison**: Compares current report with previous reports

### 7. Report History
- View all generated reports for an application
- Click to view detailed historical reports
- Compare reports over time

### 8. Scheduled Reports
- **Frequency Options**: Daily, weekly, or monthly
- **Time Configuration**: Set specific time for report generation
- **Day Selection**: Choose day of week (weekly) or day of month (monthly)
- **Enable/Disable**: Toggle schedules on/off
- **Next Run Tracking**: Shows when the next scheduled report will run

## Technical Implementation

### Backend

#### Service (`accessibility-reports.service.ts`)
- `generateReport()`: Generates accessibility report for an application
- `processScanResults()`: Processes scan results into structured report
- `mapToWCAGCriteria()`: Maps checks to WCAG 2.1 criteria
- `prioritizeFixes()`: Calculates priority scores for fixes
- `calculateTrend()`: Compares reports to show trends
- `createSchedule()`: Creates scheduled report generation
- `updateSchedule()`: Updates existing schedules
- `deleteSchedule()`: Removes schedules

#### Controller (`accessibility-reports.controller.ts`)
- `POST /api/v1/accessibility-reports/generate/:applicationId`: Generate report
- `GET /api/v1/accessibility-reports/reports`: Get all reports (optionally filtered by application)
- `GET /api/v1/accessibility-reports/reports/:reportId`: Get specific report
- `GET /api/v1/accessibility-reports/schedules`: Get all schedules
- `POST /api/v1/accessibility-reports/schedules`: Create schedule
- `PUT /api/v1/accessibility-reports/schedules/:scheduleId`: Update schedule
- `DELETE /api/v1/accessibility-reports/schedules/:scheduleId`: Delete schedule

#### Module (`accessibility-reports.module.ts`)
- Integrates with `DesignSystemModule` for application scanning
- Exports `AccessibilityReportsService` for use in other modules

### Frontend

#### Page (`AccessibilityReports.vue`)
- **Dashboard Tab**: 
  - Application selector
  - WCAG compliance overview cards
  - Issues by category breakdown
  - Prioritized fixes list
  - WCAG criteria compliance table
- **Report History Tab**: 
  - List of all generated reports
  - Click to view historical reports
- **Schedules Tab**: 
  - List of scheduled reports
  - Create, enable/disable, and delete schedules

## Data Models

### AccessibilityReport
```typescript
{
  id: string;
  applicationId: string;
  applicationName: string;
  generatedAt: Date;
  scheduled: boolean;
  scheduleId?: string;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-Compliant';
  complianceScore: number; // 0-100
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  wcagCriteria: { [key: string]: WCAGCriterion };
  issuesByCategory: { [category: string]: number };
  prioritizedFixes: PrioritizedFix[];
  checks: ComplianceCheck[];
  trend: {
    scoreChange: number;
    issuesChange: number;
    newIssues: number;
    fixedIssues: number;
  };
}
```

### PrioritizedFix
```typescript
{
  id: string;
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number; // Calculated priority score
  affectedElements: number;
  description: string;
  recommendation: string;
  wcagCriterion: string;
  checks: ComplianceCheck[];
}
```

### ReportSchedule
```typescript
{
  id: string;
  applicationId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  recipients: string[]; // Email addresses
}
```

## Integration Points

### With Existing Features
- **Governance Rules Engine**: Uses existing accessibility rules for scanning
- **Application Management**: Integrates with registered applications
- **Compliance Scanning**: Leverages existing `scanApplicationCodebase` functionality
- **IRIS Photosensitivity**: Includes photosensitivity analysis results

## Usage

### Generating a Report
1. Navigate to Admin > Accessibility Reports
2. Select an application from the dropdown
3. Click "Generate Report" or wait for scheduled report
4. View compliance metrics, prioritized fixes, and WCAG criteria breakdown

### Creating a Schedule
1. Go to the "Schedules" tab
2. Click "Create Schedule"
3. Select application, frequency, time, and day
4. Enable the schedule
5. Reports will be generated automatically

### Viewing Trends
- Reports automatically compare with previous reports
- View score changes, issue counts, and new/fixed issues
- Historical reports available in "Report History" tab

## Future Enhancements

Potential improvements:
- Email notifications for scheduled reports
- PDF export of reports
- Custom WCAG criteria selection
- Team-specific accessibility goals
- Integration with CI/CD pipelines
- Automated fix suggestions with code examples
- Accessibility score badges for applications
- Comparison reports across multiple applications

