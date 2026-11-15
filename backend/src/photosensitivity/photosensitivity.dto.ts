import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/** The form fields sent with the video (multipart, so every value is a string) */
export class AnalyzeVideoDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  enablePatternDetection?: string;

  /** Accepted for older clients and ignored: the response is the same either way */
  @IsOptional()
  @IsString()
  outputJson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  applicationName?: string;
}
