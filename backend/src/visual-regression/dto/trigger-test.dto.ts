export class TriggerTestDto {
  branch?: string;
  commitSha?: string;
  options?: {
    viewports?: string[];
    browsers?: string[];
    testDirectories?: string[];
  };
}

