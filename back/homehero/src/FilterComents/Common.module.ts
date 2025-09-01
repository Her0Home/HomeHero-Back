import { Module } from '@nestjs/common';
import { ProfanityFilterService } from './filterComents.service';

@Module({
  providers: [ProfanityFilterService],
  exports: [ProfanityFilterService],
})
export class CommonModule {}