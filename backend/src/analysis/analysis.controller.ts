import { Controller, Get, Param, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private svc: AnalysisService) {}

  @Post()
  create() {
    return this.svc.startJob();
  }

  @Get(':jobId')
  byId(@Param('jobId') jobId: string) {
    const job = this.svc.getJob(jobId);
    return job ?? { status: 'error' };
  }
}
