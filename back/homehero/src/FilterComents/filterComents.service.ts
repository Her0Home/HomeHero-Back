import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfanityFilterService {
  private bannedWords: string[] = [
    // Español
    'gonorrea',
    'puto',
    'malparido',
    // Añadir más palabras según necesites
  ];

  hasProfanity(text: string): boolean {
    if (!text) return false;
    
    const normalizedText = text.toLowerCase();
    return this.bannedWords.some(word => normalizedText.includes(word.toLowerCase()));
  }

  findProfanityWords(text: string): string[] {
    if (!text) return [];
    
    const normalizedText = text.toLowerCase();
    return this.bannedWords.filter(word => 
      normalizedText.includes(word.toLowerCase())
    );
  }

  censorText(text: string): string {
    if (!text) return '';
    
    let censoredText = text;
    this.bannedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      censoredText = censoredText.replace(regex, '*'.repeat(word.length));
    });
    return censoredText;
  }
}