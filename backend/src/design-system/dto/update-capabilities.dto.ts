export class UpdateCapabilitiesDto {
  governance?: {
    enabled?: boolean;
    rules?: string[];
    scanSchedule?: 'manual' | 'daily' | 'weekly' | 'on-commit';
  };
  visualRegression?: {
    enabled?: boolean;
    argosProjectId?: string;
    argosBaseUrl?: string;
    argosBranch?: string;
  };
  sessionReplay?: {
    enabled?: boolean;
    openreplayProjectKey?: string;
    openreplayBaseUrl?: string;
    privacySettings?: {
      maskAllInputs?: boolean;
      maskAllText?: boolean;
      respectDoNotTrack?: boolean;
    };
  };
}

