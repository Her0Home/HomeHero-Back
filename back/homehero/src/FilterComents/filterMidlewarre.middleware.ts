import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProfanityFilterService } from '../FilterComents/filterComents.service';

@Injectable()
export class ProfanityFilterMiddleware implements NestMiddleware {
  constructor(private profanityFilterService: ProfanityFilterService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if ((req.method === 'POST' || req.method === 'PUT') && req.body && req.body.content) {
      const { content } = req.body;
      
      if (this.profanityFilterService.hasProfanity(content)) {
        const badWords = this.profanityFilterService.findProfanityWords(content);
        throw new BadRequestException(
          `Tu comentario contiene lenguaje inapropiado: ${badWords.join(', ')}. Por favor, revísalo.`
        );
      }
    }
    next();
  }
}