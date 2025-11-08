export class UpdateProjectDto {
  name?: string;
  description?: string;
  applicationUrl?: string;
  openreplayProjectKey?: string;
  openreplayBaseUrl?: string;
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

