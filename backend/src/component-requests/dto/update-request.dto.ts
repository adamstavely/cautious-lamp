export class UpdateRequestDto {
  title?: string;
  description?: string;
  useCase?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  attachments?: string[];
  estimatedEffort?: number;
  targetRelease?: string;
  relatedComponents?: string[];
  metadata?: {
    designReview?: boolean;
    technicalReview?: boolean;
    designApproved?: boolean;
    technicalApproved?: boolean;
  };
}

