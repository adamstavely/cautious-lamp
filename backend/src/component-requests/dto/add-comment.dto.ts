export class AddCommentDto {
  author: string;
  content: string;
  mentions?: string[];
  attachments?: string[];
}

