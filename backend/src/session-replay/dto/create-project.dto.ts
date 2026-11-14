export class CreateProjectDto {
  name: string;
  /** Free-form label; defaults to the workspace id */
  teamId?: string;
  /** Owning workspace (needs the editor role there). Without one, only the creator can use the project. */
  workspaceId?: string | null;
  openreplayApiKey?: string;
  description?: string;
  applicationUrl?: string;
  openreplayProjectKey: string;
  openreplayBaseUrl?: string; // Self-hosted OpenReplay instance URL
  privacySettings?: {
    maskAllInputs?: boolean;
    maskAllText?: boolean;
    maskTextSelector?: string[];
    blockSelector?: string[];
    respectDoNotTrack?: boolean;
  };
  config?: {
    captureConsole?: boolean;
    captureNetwork?: boolean;
    captureIFrames?: boolean;
  };
}

