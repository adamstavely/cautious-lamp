export class CreateProjectDto {
  name: string;
  teamId: string;
  description?: string;
  argosProjectId: string;
  argosToken: string;
  argosBaseUrl?: string; // Self-hosted Argos instance URL
  argosBranch?: string;
  config?: {
    testDirectories?: string[];
    viewports?: string[];
    browsers?: string[];
    ignorePatterns?: string[];
    screenshotOptions?: {
      fullPage?: boolean;
      waitForSelector?: string;
      waitForTimeout?: number;
    };
  };
}

