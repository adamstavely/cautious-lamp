export class TransitionStatusDto {
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-more-info' | 'in-progress' | 'completed' | 'released';
  /** Ignored: the caller comes from the signed-in principal (docs/AUTH.md) */
  userId?: string;
  comment?: string;
}

