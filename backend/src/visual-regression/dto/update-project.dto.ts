export class UpdateProjectDto {
  name?: string;
  description?: string;
  argosProjectId?: string;
  argosToken?: string;
  argosBaseUrl?: string;
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

