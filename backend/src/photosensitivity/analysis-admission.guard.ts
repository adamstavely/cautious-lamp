import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthedRequest } from '../auth/principal';
import type { AdmissionTicket } from '../common/concurrency/admission-pool';
import { AnalysisRejectedException, PhotosensitivityService } from './photosensitivity.service';

export type AdmittedRequest = AuthedRequest & { analysisTicket?: AdmissionTicket };

/** Who an analysis counts against: the signed-in user or the API key */
export function callerKey(req: AuthedRequest): string {
  const principal = req.principal;
  return principal ? `${principal.type}:${principal.id}` : `ip:${req.ip ?? 'unknown'}`;
}

/**
 * Takes a place in the analysis pool before the video is uploaded. Guards run
 * before interceptors, so a refused request (503 PHOTOSENSITIVITY_BUSY or 429
 * PHOTOSENSITIVITY_QUOTA_EXCEEDED, with Retry-After) never stages its upload.
 * The place is given back when the response closes: if the client went away
 * first, a queued analysis is dropped and a running one is killed.
 */
@Injectable()
export class AnalysisAdmissionGuard implements CanActivate {
  constructor(private readonly photosensitivityService: PhotosensitivityService) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<AdmittedRequest>();
    const res = http.getResponse<Response>();
    try {
      const ticket = this.photosensitivityService.admit(callerKey(req));
      req.analysisTicket = ticket;
      res.once('close', () => ticket.cancel());
      return true;
    } catch (error) {
      if (error instanceof AnalysisRejectedException) {
        res.setHeader('Retry-After', String(error.retryAfterSeconds));
      }
      throw error;
    }
  }
}
