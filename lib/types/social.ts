export interface ContentAnalysis {
  title: string;
  headings: Heading[];
  keyParagraphs: string[];
  images: ImageAsset[];
  hashtags: string[];
  readingTime: number;
  wordCount: number;
  mainTopic: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

export interface Heading {
  level: 2 | 3 | 4;
  text: string;
}

export interface ImageAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface FacebookPost {
  message: string;
  link?: string;
  imageAttachment?: {
    url: string;
    caption?: string;
  };
  scheduledTime?: Date;
}

export interface FacebookOptions {
  includeImage: boolean;
  includeLink: boolean;
  linkPreview: boolean;
  callToAction: 'shop_now' | 'learn_more' | 'sign_up' | 'none';
  templateId?: string;
}

export interface InstagramPost {
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  mediaUrls: string[];
  location?: string;
  userTags?: string[];
  firstComment?: string;
}

export interface InstagramOptions {
  format: 'square' | 'portrait' | 'landscape' | 'carousel';
  includeHashtags: boolean;
  hashtagCount: number;
  mentionAccounts: string[];
  location?: string;
  firstComment?: boolean;
}

export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  platform: 'facebook' | 'instagram' | 'both';
  content: {
    header?: string;
    body: string;
    footer?: string;
  };
  variables: TemplateVariable[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'hashtag' | 'link';
  required: boolean;
  defaultValue?: string;
}

export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram';
  accountName: string;
  accountId: string;
  pageId?: string;
  pageName?: string;
  profilePicture?: string;
  followersCount?: number;
  isActive: boolean;
  permissions: string[];
  connectedAt: Date;
  lastUsedAt?: Date;
}

export interface PostHistory {
  id: string;
  blogPostId: string;
  blogPostTitle: string;
  platform: 'facebook' | 'instagram';
  accountName: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  contentAdapted: string;
  mediaUrls: string[];
  externalPostId?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  thumbnail?: string;
  createdAt: Date;
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface TimeSlot {
  day: number;
  start: string;
  end: string;
}

export interface SocialLog {
  timestamp: Date;
  action: 'analyze' | 'generate' | 'publish' | 'schedule' | 'sync';
  platform?: 'facebook' | 'instagram';
  accountId?: string;
  postId?: string;
  blogPostId?: string;
  details: Record<string, unknown>;
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
  duration: number;
}
