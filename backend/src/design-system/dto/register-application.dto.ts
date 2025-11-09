export class RegisterApplicationDto {
  name: string;
  description?: string;
  repository?: string;
  version?: string;
  applicationUrl?: string;
  teamId?: string;
  workspaceId?: string; // Workspace/team this application belongs to
  capabilities?: {
    governance?: {
      enabled: boolean;
      rules?: string[];
      scanSchedule?: 'manual' | 'daily' | 'weekly' | 'on-commit';
    };
    visualRegression?: {
      enabled: boolean;
      argosProjectId?: string;
      argosBaseUrl?: string;
      argosBranch?: string;
    };
    sessionReplay?: {
      enabled: boolean;
      openreplayProjectKey?: string;
      openreplayBaseUrl?: string;
      privacySettings?: {
        maskAllInputs?: boolean;
        maskAllText?: boolean;
        respectDoNotTrack?: boolean;
      };
    };
  };
  metadata?: {
    environment?: 'development' | 'staging' | 'production';
    framework?: string;
    language?: string;
    tags?: string[];
  };
}

