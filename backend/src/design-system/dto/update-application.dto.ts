export class UpdateApplicationDto {
  name?: string;
  description?: string;
  repository?: string;
  version?: string;
  applicationUrl?: string;
  teamId?: string;
  metadata?: {
    environment?: 'development' | 'staging' | 'production';
    framework?: string;
    language?: string;
    tags?: string[];
  };
}

