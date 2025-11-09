export class TransitionStatusDto {
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-more-info' | 'in-progress' | 'completed' | 'released';
  userId: string;
  comment?: string;
}

