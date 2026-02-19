import type { 
  ContentAnalysis, 
  FacebookPost, 
  FacebookOptions, 
  InstagramPost, 
  InstagramOptions,
  ValidationResult,
  PostTemplate 
} from '@/lib/types/social';

const DEFAULT_FACEBOOK_TEMPLATE: PostTemplate = {
  id: 'default-facebook',
  name: 'Template Facebook',
  description: 'Template por defecto para Facebook',
  platform: 'facebook',
  content: {
    header: '{title}',
    body: '{excerpt}',
    footer: '🔗 Lee más en nuestro blog'
  },
  variables: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'text', required: true },
    { name: 'link', type: 'link', required: true }
  ],
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const DEFAULT_INSTAGRAM_TEMPLATE: PostTemplate = {
  id: 'default-instagram',
  name: 'Template Instagram',
  description: 'Template por defecto para Instagram',
  platform: 'instagram',
  content: {
    body: '{title}\n\n{hashtags}'
  },
  variables: [
    { name: 'title', type: 'text', required: true },
    { name: 'hashtags', type: 'hashtag', required: false, defaultValue: '#turismo #colombia' }
  ],
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export class PostGeneratorService {
  private templates: Map<string, PostTemplate> = new Map();

  constructor() {
    this.registerTemplate(DEFAULT_FACEBOOK_TEMPLATE);
    this.registerTemplate(DEFAULT_INSTAGRAM_TEMPLATE);
  }

  registerTemplate(template: PostTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): PostTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(platform?: 'facebook' | 'instagram'): PostTemplate[] {
    const all = Array.from(this.templates.values());
    if (!platform) return all;
    return all.filter(t => t.platform === platform || t.platform === 'both');
  }

  async generateFacebookPost(
    analysis: ContentAnalysis,
    blogUrl: string,
    options: Partial<FacebookOptions> = {}
  ): Promise<{ post: FacebookPost; validation: ValidationResult }> {
    const opts: FacebookOptions = {
      includeImage: options.includeImage ?? true,
      includeLink: options.includeLink ?? true,
      linkPreview: options.linkPreview ?? true,
      callToAction: options.callToAction ?? 'learn_more',
      templateId: options.templateId
    };

    const template = opts.templateId ? this.templates.get(opts.templateId) : DEFAULT_FACEBOOK_TEMPLATE;
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    const excerpt = analysis.keyParagraphs[0] || '';
    const truncatedExcerpt = excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt;

    let message = '';
    if (template.content.header) {
      message += template.content.header.replace('{title}', analysis.title) + '\n\n';
    }
    if (template.content.body) {
      message += template.content.body.replace('{excerpt}', truncatedExcerpt) + '\n\n';
    }
    if (template.content.footer) {
      message += template.content.footer;
    }

    const post: FacebookPost = {
      message: message.trim(),
      link: opts.includeLink ? blogUrl : undefined,
      imageAttachment: opts.includeImage && analysis.images[0] ? {
        url: analysis.images[0].url,
        caption: analysis.title
      } : undefined,
      scheduledTime: undefined
    };

    const validation = this.validateFacebookPost(post);

    return { post, validation };
  }

  async generateInstagramPost(
    analysis: ContentAnalysis,
    options: Partial<InstagramOptions> = {}
  ): Promise<{ post: InstagramPost; validation: ValidationResult }> {
    const opts: InstagramOptions = {
      format: options.format ?? 'square',
      includeHashtags: options.includeHashtags ?? true,
      hashtagCount: options.hashtagCount ?? 10,
      mentionAccounts: options.mentionAccounts ?? [],
      location: options.location,
      firstComment: options.firstComment ?? true
    };

    const template = DEFAULT_INSTAGRAM_TEMPLATE;
    
    let caption = analysis.title + '\n\n';
    
    if (analysis.keyParagraphs[0]) {
      caption += analysis.keyParagraphs[0].substring(0, 125) + '\n\n';
    }

    const hashtags = opts.includeHashtags 
      ? analysis.hashtags.slice(0, opts.hashtagCount).join(' ')
      : '';

    caption = template.content.body
      .replace('{title}', analysis.title)
      .replace('{hashtags}', hashtags);

    const mediaUrls = analysis.images.slice(0, opts.format === 'carousel' ? 10 : 1).map(img => img.url);

    const post: InstagramPost = {
      caption: caption.trim(),
      mediaType: opts.format === 'carousel' ? 'CAROUSEL' : 'IMAGE',
      mediaUrls,
      location: opts.location,
      userTags: opts.mentionAccounts.length > 0 ? opts.mentionAccounts : undefined,
      firstComment: opts.firstComment && hashtags ? hashtags : undefined
    };

    const validation = this.validateInstagramPost(post);

    return { post, validation };
  }

  validateFacebookPost(post: FacebookPost): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (post.message.length > 63206) {
      errors.push('El mensaje excede el límite de 63,206 caracteres');
    } else if (post.message.length > 500) {
      warnings.push('El mensaje es muy largo. Considera shorten it para mejor engagement');
    }

    if (!post.message || post.message.trim().length === 0) {
      errors.push('El mensaje no puede estar vacío');
    }

    if (post.message.length < 10) {
      warnings.push('El mensaje es muy corto');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  validateInstagramPost(post: InstagramPost): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (post.caption.length > 2200) {
      errors.push('El caption excede el límite de 2,200 caracteres');
    } else if (post.caption.length > 125) {
      warnings.push('Para mejor visibilidad, considera un caption más corto (125 caracteres)');
    }

    if (!post.caption || post.caption.trim().length === 0) {
      errors.push('El caption no puede estar vacío');
    }

    if (post.mediaUrls.length === 0) {
      errors.push('Debe incluir al menos una imagen');
    }

    const hashtagMatches = post.caption.match(/#\w+/g) || [];
    if (hashtagMatches.length > 30) {
      errors.push('Instagram permite máximo 30 hashtags');
    } else if (hashtagMatches.length > 15) {
      warnings.push('Considera usar entre 5-15 hashtags para mejor alcance');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  formatTextForFacebook(text: string): string {
    return text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  formatTextForInstagram(text: string, maxLength: number = 2200): string {
    let formatted = text;
    
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 50) + '...';
    }
    
    return formatted
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

export const postGenerator = new PostGeneratorService();
