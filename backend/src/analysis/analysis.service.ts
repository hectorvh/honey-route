import { Injectable } from '@nestjs/common';

type Job = {
  status: 'queued' | 'processing' | 'done' | 'error';
  riskLevel?: 'low' | 'medium' | 'high';
};

@Injectable()
export class AnalysisService {
  private jobs = new Map<string, Job>();

  startJob(): { jobId: string } {
    const jobId = Math.random().toString(36).slice(2, 10);
    this.jobs.set(jobId, { status: 'done', riskLevel: 'medium' }); // mock inmediato
    return { jobId };
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }
}
