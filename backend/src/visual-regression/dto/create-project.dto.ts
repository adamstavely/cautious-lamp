export class CreateProjectDto {
  name: string;
  /** Free-form label; defaults to the workspace id */
  teamId?: string;
  /** Owning workspace (needs the editor role there). Without one, only the creator can use the project. */
  workspaceId?: string | null;
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

