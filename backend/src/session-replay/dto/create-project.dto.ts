export class CreateProjectDto {
  name: string;
  teamId: string;
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

