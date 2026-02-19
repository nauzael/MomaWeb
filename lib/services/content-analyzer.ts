import type { ContentAnalysis, Heading, ImageAsset } from '@/lib/types/social';

const SPANISH_STOP_WORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'con',
  'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'sí',
  'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay',
  'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
  'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos',
  'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada',
  'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi',
  'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os',
  'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos',
  'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros',
  'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'esté',
  'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás', 'estará', 'estaremos', 'estaréis',
  'estarán', 'estaría', 'estarías', 'estaríamos', 'estaríais', 'estarían', 'estaba', 'estabas',
  'estábamos', 'estabais', 'estaban', 'estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis',
  'estuvieron', 'estuviera', 'estuvieras', 'estuviéramos', 'estuvierais', 'estuvieran',
  'estuviese', 'estuvieses', 'estuviésemos', 'estuvieseis', 'estuviesen', 'estando', 'estado',
  'estada', 'estados', 'estadas', 'estad', 'he', 'has', 'ha', 'hemos', 'habéis', 'han', 'haya',
  'hayas', 'hayamos', 'hayáis', 'hayan', 'habré', 'habrás', 'habrá', 'habremos', 'habréis',
  'habrán', 'habría', 'habrías', 'habríamos', 'habríais', 'habrían', 'había', 'habías',
  'habíamos', 'habíais', 'habían', 'hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron',
  'hubiera', 'hubieras', 'hubiéramos', 'hubierais', 'hubieran', 'hubiese', 'hubieses',
  'hubiésemos', 'hubieseis', 'hubiesen', 'habiendo', 'habido', 'habida', 'habidos', 'habidas',
  'soy', 'eres', 'es', 'somos', 'sois', 'son', 'sea', 'seas', 'seamos', 'seáis', 'sean', 'seré',
  'serás', 'será', 'seremos', 'seréis', 'serán', 'sería', 'serías', 'seríamos', 'seríais',
  'serían', 'era', 'eras', 'éramos', 'erais', 'eran', 'fui', 'fuiste', 'fue', 'fuimos',
  'fuisteis', 'fueron', 'fuera', 'fueras', 'fuéramos', 'fuerais', 'fueran', 'fuese', 'fueses',
  'fuésemos', 'fueseis', 'fuesen', 'siendo', 'sido', 'tengo', 'tienes', 'tiene', 'tenemos',
  'tenéis', 'tienen', 'tenga', 'tengas', 'tengamos', 'tengáis', 'tengan', 'tendré', 'tendrás',
  'tendrá', 'tendremos', 'tendréis', 'tendrán', 'tendría', 'tendrías', 'tendríamos', 'tendríais',
  'tendrían', 'tenía', 'tenías', 'teníamos', 'teníais', 'tenían', 'tuve', 'tuviste', 'tuvo',
  'tuvimos', 'tuvisteis', 'tuvieron', 'tuviera', 'tuvieras', 'tuviéramos', 'tuvierais',
  'tuvieran', 'tuviese', 'tuvieses', 'tuviésemos', 'tuvieseis', 'tuviesen', 'teniendo',
  'tenido', 'tenida', 'tenidos', 'tenidas', 'tened'
]);

const TOURISM_KEYWORDS = [
  'turismo', 'viaje', 'aventura', 'experiencia', 'tour', 'excursión', 'destino',
  'naturaleza', 'playa', 'montaña', 'cultura', 'gastronomía', 'tradición',
  'comunidad', 'historia', 'paisaje', 'eco', 'sostenible', 'aventura', 'deporte',
  'relax', 'bienestar', 'explorar', 'descubrir', 'vivir', 'disfrutar'
];

export class ContentAnalyzerService {
  async analyzeBlogContent(content: string, title: string): Promise<ContentAnalysis> {
    const plainText = this.stripHtml(content);
    
    const headings = this.extractHeadings(content);
    const keyParagraphs = this.extractKeyParagraphs(plainText);
    const images = this.extractImages(content);
    const hashtags = this.generateHashtags(title, plainText);
    const wordCount = this.countWords(plainText);
    const readingTime = this.calculateReadingTimeByWords(wordCount);
    const keywords = this.extractKeywords(title, plainText);
    const mainTopic = this.detectMainTopic(keywords);
    const sentiment = this.analyzeSentiment(plainText);

    return {
      title: title.trim(),
      headings,
      keyParagraphs,
      images,
      hashtags,
      readingTime,
      wordCount,
      mainTopic,
      sentiment,
      keywords
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractHeadings(content: string): Heading[] {
    const headings: Heading[] = [];
    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
    const h3Regex = /<h3[^>]*>([^<]+)<\/h3>/gi;
    const h4Regex = /<h4[^>]*>([^<]+)<\/h4>/gi;

    let match;
    while ((match = h2Regex.exec(content)) !== null) {
      headings.push({ level: 2, text: this.stripHtml(match[1]).trim() });
    }
    while ((match = h3Regex.exec(content)) !== null) {
      headings.push({ level: 3, text: this.stripHtml(match[1]).trim() });
    }
    while ((match = h4Regex.exec(content)) !== null) {
      headings.push({ level: 4, text: this.stripHtml(match[1]).trim() });
    }

    return headings.sort((a, b) => a.level - b.level);
  }

  extractKeyParagraphs(content: string, maxParagraphs: number = 3): string[] {
    const plainText = this.stripHtml(content);
    const paragraphs = plainText.split(/\n+/).filter(p => p.trim().length > 50);
    
    return paragraphs.slice(0, maxParagraphs).map(p => {
      const sentences = p.split(/[.!?]+/);
      if (sentences.length > 1) {
        return sentences[0].trim() + '.';
      }
      return p.substring(0, 150) + (p.length > 150 ? '...' : '');
    });
  }

  extractImages(content: string): ImageAsset[] {
    const images: ImageAsset[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const altRegex = /alt=["']([^"']*)["']/gi;

    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      const url = match[1];
      const altMatch = altRegex.exec(match[0]);
      const alt = altMatch ? altMatch[1] : '';

      images.push({
        url,
        alt,
        width: 1200,
        height: 630
      });
    }

    return images;
  }

  generateHashtags(title: string, content: string): string[] {
    const hashtags = new Set<string>();
    const fullText = `${title} ${content}`.toLowerCase();
    const keywords = this.extractKeywords(title, content);

    keywords.slice(0, 5).forEach(keyword => {
      hashtags.add(`#${keyword.replace(/\s+/g, '')}`);
    });

    hashtags.add('#turismo');
    hashtags.add('#colombia');

    if (fullText.includes('playa') || fullText.includes('mar')) {
      hashtags.add('#playas');
      hashtags.add('#sol');
    }
    if (fullText.includes('montaña') || fullText.includes('senderismo')) {
      hashtags.add('#montaña');
      hashtags.add('#naturaleza');
    }
    if (fullText.includes('cultura') || fullText.includes('historia')) {
      hashtags.add('#cultura');
      hashtags.add('#historia');
    }

    return Array.from(hashtags).slice(0, 10);
  }

  private extractKeywords(title: string, content: string): string[] {
    const fullText = `${title} ${this.stripHtml(content)}`.toLowerCase();
    const words = fullText.split(/[\s.,;:!?()[\]{}'"-]+/);
    
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3 && !SPANISH_STOP_WORDS.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      if (w1.length > 2 && w2.length > 2 && !SPANISH_STOP_WORDS.has(w1) && !SPANISH_STOP_WORDS.has(w2)) {
        const bigram = `${w1} ${w2}`;
        bigrams.push(bigram);
        wordFreq[bigram] = (wordFreq[bigram] || 0) + 0.5;
      }
    }

    const sorted = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    return sorted;
  }

  private detectMainTopic(keywords: string[]): string {
    const topics: Record<string, string[]> = {
      'naturaleza': ['naturaleza', 'montaña', 'playa', 'bosque', 'río', 'cascada', 'eco'],
      'cultura': ['cultura', 'historia', 'tradición', 'mural', 'arquitectura', 'patrimonio'],
      'aventura': ['aventura', 'deporte', 'extremo', 'caminata', 'senderismo', 'rafting'],
      'gastronomía': ['gastronomía', 'comida', 'restaurante', 'cocina', 'sabor', 'gourmet'],
      'relax': ['relax', 'bienestar', 'spa', 'descanso', 'tranquilo', 'paz']
    };

    for (const [topic, topicKeywords] of Object.entries(topics)) {
      if (topicKeywords.some(tk => keywords.includes(tk))) {
        return topic;
      }
    }

    return 'general';
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['maravilloso', 'increíble', 'excelente', 'fantástico', 'hermoso', 'precioso', 'increíble', 'espectacular', 'único', 'especial', 'recomendado', 'imperdible', 'perfecto'];
    const negativeWords = ['terrible', 'horrible', 'pésimo', 'mal', 'problema', 'error', 'fracaso', 'decepción', 'decepcionante'];

    const lowerContent = content.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) positiveCount++;
    });
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  calculateReadingTime(content: string): number {
    const words = this.countWords(content);
    const wordsPerMinute = 200;
    return Math.ceil(words / wordsPerMinute);
  }

  calculateReadingTimeByWords(wordCount: number): number {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}

export const contentAnalyzer = new ContentAnalyzerService();
