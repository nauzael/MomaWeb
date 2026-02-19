# Especificación Técnica: Sistema de Integración Multired para Blog

**Versión**: 1.0  
**Fecha**: 2026-02-18  
**Proyecto**: Moma Web - Dashboard de Blog con Publicación Multired  
**Estado**: Especificación de Desarrollo

---

## 1. Visión General del Sistema

### 1.1 Descripción

Sistema integral de publicación multired que permite a los administradores del dashboard de blog de Moma Web exportar y adaptar contenido automáticamente para Facebook e Instagram. El sistema analiza las entradas de blog y genera versiones optimizadas para cada plataforma social, considerando mejores prácticas de formato, longitud de texto, hashtags, dimensiones de imágenes y horarios óptimos de publicación.

### 1.2 Objetivos Principales

- **Automatización**: Reducir el tiempo de publicación en redes sociales de 30 minutos a 2 minutos por post
- **Optimización**: Adaptar contenido automáticamente a las mejores prácticas de cada plataforma
- **Centralización**: Gestionar todas las publicaciones desde un único dashboard
- **Métricas**: Registrar y visualizar el engagement básico de cada publicación
- **Escalabilidad**: Sistema modular que permite agregar nuevas redes sociales fácilmente

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD ADMIN (Blog)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │  Blog Editor    │  │  Social Manager │  │  Preview & Publish           ││
│  │  (Existing)     │──│  (NEW)          │──│  (NEW)                      ││
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE SERVICES LAYER                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │ Content         │  │ Post            │  │ Social Media                ││
│  │ Analyzer       │  │ Generator       │  │ Integration                 ││
│  │ Service        │  │ Service         │  │ Service                    ││
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘│
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │ Template        │  │ Schedule        │  │ Analytics                  ││
│  │ Service         │  │ Service         │  │ Service                    ││
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐│
│  │ MySQL Database  │  │ File Storage    │  │ External APIs              ││
│  │ (Existing)     │  │ (Existing)      │  │ Facebook/Instagram         ││
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Estructura de Archivos

```
app/
├── admin/
│   └── blog/
│       ├── components/
│       │   ├── BlogForm.tsx          (EXISTING - modificar)
│       │   ├── SocialShareModal.tsx  (NUEVO)
│       │   ├── ContentAnalyzer.tsx   (NUEVO)
│       │   ├── PostPreview.tsx       (NUEVO)
│       │   ├── PlatformSelector.tsx  (NUEVO)
│       │   └── TemplateEditor.tsx    (NUEVO)
│       ├── page.tsx                  (EXISTING)
│       ├── edit/
│       │   └── page.tsx              (EXISTING)
│       └── new/
│           └── page.tsx              (EXISTING)
├── api/
│   └── social/
│       ├── analyze/
│       │   └── route.ts              (NUEVO)
│       ├── generate/
│       │   └── route.ts              (NUEVO)
│       ├── publish/
│       │   └── route.ts              (NUEVO)
│       ├── accounts/
│       │   ├── route.ts              (NUEVO)
│       │   └── connect/
│       │       └── route.ts          (NUEVO)
│       ├── schedule/
│       │   └── route.ts              (NUEVO)
│       ├── history/
│       │   └── route.ts              (NUEVO)
│       └── templates/
│           ├── route.ts              (NUEVO)
│           └── [id]/
│               └── route.ts          (NUEVO)
lib/
├── services/
│   ├── content-analyzer.ts           (NUEVO)
│   ├── post-generator.ts             (NUEVO)
│   ├── social-integration.ts          (NUEVO)
│   ├── template-engine.ts             (NUEVO)
│   └── analytics.ts                   (NUEVO)
├── types/
│   └── social.ts                     (NUEVO)
└── utils/
    └── social-helpers.ts              (NUEVO)
```

---

## 3. Especificación de Módulos

### 3.1 Módulo de Análisis de Contenido (ContentAnalyzerService)

#### 3.1.1 Funcionalidades

```typescript
interface ContentAnalyzerService {
  // Analiza el contenido del blog y extrae elementos clave
  analyzeBlogContent(content: string, title: string): Promise<ContentAnalysis>;
  
  // Extrae el título principal
  extractTitle(content: string): string;
  
  // Extrae subtítulos (H2, H3)
  extractHeadings(content: string): Heading[];
  
  // Extrae párrafos destacados (primera oración de cada párrafo)
  extractKeyParagraphs(content: string): string[];
  
  // Extrae URLs de imágenes del contenido
  extractImages(content: string): ImageAsset[];
  
  // Genera hashtags relevantes basados en el contenido
  generateHashtags(analysis: ContentAnalysis): string[];
  
  // Calcula tiempo de lectura estimado
  calculateReadingTime(content: string): number;
}

interface ContentAnalysis {
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

interface Heading {
  level: 2 | 3 | 4;
  text: string;
}

interface ImageAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
}
```

#### 3.1.2 Algoritmo de Extracción de Keywords

1. Tokenizar el texto completo (título + contenido)
2. Eliminar stop words en español
3. Contar frecuencia de palabras restantes
4. Extraer bigrams relevantes
5. Rankear por frecuencia y posición en el texto
6. Seleccionar top 10 keywords

#### 3.1.3 Generación de Hashtags

- **Primarios**: Keywords principales (3-5 hashtags)
- **Secundarios**: Categoría del blog + ubicación (2-3 hashtags)
- **Trending**: Hashtags fijos relacionados con turismoColombia (2-3 hashtags)

---

### 3.2 Módulo Generador de Posts (PostGeneratorService)

#### 3.2.1 Facebook Post Generator

```typescript
interface FacebookPostGenerator {
  // Genera post para Facebook
  generatePost(analysis: ContentAnalysis, options: FacebookOptions): Promise<FacebookPost>;
  
  // Valida longitud del post
  validateLength(post: FacebookPost): ValidationResult;
  
  // Optimiza el formato del texto
  formatText(text: string): string;
}

interface FacebookOptions {
  includeImage: boolean;
  includeLink: boolean;
  linkPreview: boolean;
  callToAction: 'shop_now' | 'learn_more' | 'sign_up' | 'none';
  templateId?: string;
}

interface FacebookPost {
  message: string;
  link?: string;
  imageAttachment?: {
    url: string;
    caption?: string;
  };
  scheduledTime?: Date;
}
```

**Especificaciones Facebook**:
- Longitud máxima: 63,206 caracteres
- Longitud óptima: 40-80 caracteres
- Link preview: 自动生成
- Imagen recomendada: 1200x630px (1.91:1)
- Hashtags máximo: 30

#### 3.2.2 Instagram Post Generator

```typescript
interface InstagramPostGenerator {
  // Genera post para Instagram
  generatePost(analysis: ContentAnalysis, options: InstagramOptions): Promise<InstagramPost>;
  
  // Prepara imagen para Instagram
  prepareImage(imageUrl: string, format: 'square' | 'portrait' | 'landscape'): Promise<ProcessedImage>;
  
  // Genera caption optimizado
  generateCaption(analysis: ContentAnalysis, options: InstagramOptions): string;
}

interface InstagramOptions {
  format: 'square' | 'portrait' | 'landscape' | 'carousel';
  includeHashtags: boolean;
  hashtagCount: number; // 1-30
  mentionAccounts: string[];
  location?: string;
  firstComment?: boolean;
}

interface InstagramPost {
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  mediaUrls: string[];
  location?: string;
  userTags?: string[];
}
```

**Especificaciones Instagram**:
- Longitud máxima caption: 2,200 caracteres
- Longitud óptima: 125-150 caracteres
- Hashtags máximo: 30 (óptimo: 5-15)
- Dimensiones imagen:
  - Square: 1080x1080px (1:1)
  - Portrait: 1080x1350px (4:5)
  - Landscape: 1080x566px (1.91:1)
- Carrusel: hasta 10 imágenes

#### 3.2.3 Plantillas de Posts

```typescript
interface PostTemplate {
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

interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'hashtag' | 'link';
  required: boolean;
  defaultValue?: string;
}
```

---

### 3.3 Sistema de Previsualización (PreviewSystem)

#### 3.3.1 Componentes de Preview

```typescript
interface PreviewSystem {
  // Renderiza preview de Facebook
  renderFacebookPreview(post: FacebookPost): JSX.Element;
  
  // Renderiza preview de Instagram
  renderInstagramPreview(post: InstagramPost): JSX.Element;
  
  // Compara versiones side-by-side
  renderComparison(facebook: FacebookPost, instagram: InstagramPost): JSX.Element;
  
  // Simula feed de cada plataforma
  renderFeedSimulation(posts: SocialPost[]): JSX.Element;
}
```

#### 3.3.2mock Data de Preview

El sistema debe mostrar:
- **Facebook**: Avatar, nombre de página, timestamp, texto, imagen con link preview, reacciones simuladas
- **Instagram**: Imagen/video, username, caption con hashtags (primeros 125 caracteres), primer comentario

---

### 3.4 Integración con APIs Externas

#### 3.4.1 Facebook Graph API Integration

```typescript
interface FacebookIntegration {
  // Autentica con Facebook OAuth
  authenticate(code: string): Promise<FBAuthToken>;
  
  // Publica post en Facebook
  publishPost(pageId: string, post: FacebookPost): Promise<FBPostResponse>;
  
  // Programa publicación
  schedulePost(pageId: string, post: FacebookPost, scheduledTime: Date): Promise<FBScheduleResponse>;
  
  // Obtiene métricas básicas
  getPostInsights(postId: string): Promise<FBInsights>;
}

interface FBAuthToken {
  accessToken: string;
  expiresIn: number;
  pageAccessToken: string;
  pageId: string;
}
```

#### 3.4.2 Instagram Graph API Integration

```typescript
interface InstagramIntegration {
  // Autentica con Instagram (vía Facebook)
  authenticate(facebookToken: string): Promise<IGAuthToken>;
  
  // Publica contenido en Instagram
  publishMedia(media: InstagramPost): Promise<IGMediaResponse>;
  
  // Publica en carrusel
  publishCarousel(mediaUrls: string[], caption: string): Promise<IGCarouselResponse>;
  
  // Obtiene métricas
  getMediaInsights(mediaId: string): Promise<IGInsights>;
}
```

#### 3.4.3 Tabla de Cuentas Vinculadas

```sql
CREATE TABLE social_accounts (
  id VARCHAR(36) PRIMARY KEY,
  platform ENUM('facebook', 'instagram') NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  page_id VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at DATETIME,
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_platform (platform),
  INDEX idx_active (is_active)
);
```

---

### 3.5 Gestión de Cuentas

#### 3.5.1 Flujo de Conexión OAuth

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Admin    │────▶│   App       │────▶│ Facebook   │
│  Dashboard  │     │  (Backend)  │     │   OAuth    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      │<──── Redirect with code ────>|
      │                   │                   │
      │<──── Access Token + Page List ────>|
      │                   │                   │
      │──── User selects page ────>        │
      │                   │                   │
      │<──── Save account ──────>          │
```

#### 3.5.2 Modelo de Datos de Cuentas

```typescript
interface SocialAccount {
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
```

---

### 3.6 Historial de Publicaciones

#### 3.6.1 Tabla de Publicaciones

```sql
CREATE TABLE social_posts (
  id VARCHAR(36) PRIMARY KEY,
  blog_post_id VARCHAR(36) NOT NULL,
  platform ENUM('facebook', 'instagram') NOT NULL,
  account_id VARCHAR(36) NOT NULL,
  status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
  
  -- Contenido
  content_original TEXT,
  content_adapted TEXT,
  media_urls JSON,
  
  -- Publicación
  external_post_id VARCHAR(255),
  published_at DATETIME,
  scheduled_at DATETIME,
  
  -- Métricas básicas (actualizables)
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  reach_count INT DEFAULT 0,
  impressions_count INT DEFAULT 0,
  
  -- Metadatos
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_blog_post (blog_post_id),
  INDEX idx_platform (platform),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES social_accounts(id)
);
```

#### 3.6.2 Modelo de Historial

```typescript
interface PostHistory {
  id: string;
  blogPostId: string;
  blogPostTitle: string;
  platform: 'facebook' | 'instagram';
  accountName: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt?: Date;
  scheduledAt?: Date;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  thumbnail?: string;
}
```

---

### 3.7 Sistema de Programación

#### 3.7.1 Horarios Óptimos

```typescript
interface OptimalSchedule {
  // Retorna horarios óptimos por plataforma
  getOptimalTimes(platform: 'facebook' | 'instagram'): TimeSlot[];
  
  // Verifica si un horario es óptimo
  isOptimalTime(platform: 'facebook' | 'instagram', date: Date): boolean;
  
  // Recomienda próximo horario disponible
  getNextAvailableSlot(platform: 'facebook' | 'instagram'): Date;
}

const OPTIMAL_TIMES = {
  facebook: [
    { day: 1, start: '09:00', end: '13:00' },  // Lunes mañana
    { day: 2, start: '08:00', end: '10:00' },  // Martes temprano
    { day: 3, start: '11:00', end: '13:00' },  // Miércoles medio día
    { day: 4, start: '13:00', end: '15:00' },  // Jueves tarde
    { day: 5, start: '09:00', end: '11:00' },  // Viernes mañana
  ],
  instagram: [
    { day: 1, start: '18:00', end: '21:00' },  // Lunes noche
    { day: 2, start: '12:00', end: '14:00' },  // Martes almuerzo
    { day: 3, start: '19:00', end: '21:00' },  // Miércoles noche
    { day: 5, start: '10:00', end: '12:00' },  // Viernes mañana
    { day: 6, start: '10:00', end: '12:00' },  // Sábado mañana
    { day: 7, start: '17:00', end: '19:00' },  // Domingo tarde
  ]
};
```

---

## 4. API Endpoints

### 4.1 Análisis de Contenido

```
POST /api/social/analyze
Content-Type: application/json

Request:
{
  "blogPostId": "uuid",
  "title": "Título del post",
  "content": "Contenido HTML del blog"
}

Response:
{
  "success": true,
  "analysis": {
    "title": "Título extraído",
    "headings": [...],
    "keyParagraphs": [...],
    "images": [...],
    "hashtags": ["#turismo", "#colombia", ...],
    "readingTime": 5,
    "wordCount": 1200,
    "mainTopic": "turismo",
    "keywords": ["experiencia", "viaje", ...]
  }
}
```

### 4.2 Generación de Posts

```
POST /api/social/generate
Content-Type: application/json

Request:
{
  "analysisId": "uuid",
  "platform": "facebook" | "instagram",
  "options": {
    "includeImage": true,
    "templateId": "optional"
  }
}

Response:
{
  "success": true,
  "post": {
    "platform": "facebook",
    "content": {
      "message": "Texto del post...",
      "link": "https://...",
      "imageAttachment": {...}
    },
    "preview": {...},
    "validation": {
      "isValid": true,
      "warnings": []
    }
  }
}
```

### 4.3 Publicación

```
POST /api/social/publish
Content-Type: application/json

Request:
{
  "postId": "uuid",
  "accountId": "uuid",
  "scheduledAt": "2026-02-20T10:00:00Z", // Opcional
  "publishNow": true
}

Response:
{
  "success": true,
  "publishedPost": {
    "id": "external-post-id",
    "platform": "facebook",
    "publishedAt": "2026-02-18T10:00:00Z",
    "previewUrl": "https://facebook.com/..."
  }
}
```

### 4.4 Gestión de Cuentas

```
GET /api/social/accounts
Response:
{
  "success": true,
  "accounts": [
    {
      "id": "uuid",
      "platform": "facebook",
      "accountName": "Moma Excursiones",
      "pageName": "Moma Excursiones",
      "followersCount": 5000,
      "isActive": true
    }
  ]
}

POST /api/social/accounts/connect
Request:
{
  "platform": "facebook",
  "code": "oauth-code-from-facebook"
}
Response:
{
  "success": true,
  "account": {...}
}
```

### 4.5 Historial

```
GET /api/social/history?page=1&limit=20
Response:
{
  "success": true,
  "history": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 5. Base de Datos

### 5.1 Nuevas Tablas

```sql
-- Tabla 1: Cuentas de redes sociales
CREATE TABLE social_accounts (
  id VARCHAR(36) PRIMARY KEY,
  platform ENUM('facebook', 'instagram') NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  page_id VARCHAR(255),
  page_name VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at DATETIME,
  permissions JSON,
  profile_picture VARCHAR(500),
  followers_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla 2: Publicaciones en redes sociales
CREATE TABLE social_posts (
  id VARCHAR(36) PRIMARY KEY,
  blog_post_id VARCHAR(36) NOT NULL,
  platform ENUM('facebook', 'instagram') NOT NULL,
  account_id VARCHAR(36) NOT NULL,
  status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
  content_original TEXT,
  content_adapted TEXT,
  media_urls JSON,
  external_post_id VARCHAR(255),
  published_at DATETIME,
  scheduled_at DATETIME,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  reach_count INT DEFAULT 0,
  impressions_count INT DEFAULT 0,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES social_accounts(id)
);

-- Tabla 3: Plantillas de posts
CREATE TABLE social_templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platform ENUM('facebook', 'instagram', 'both') NOT NULL,
  content_header TEXT,
  content_body TEXT NOT NULL,
  content_footer TEXT,
  variables JSON,
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla 4: Métricas de publicaciones (para sync periódico)
CREATE TABLE social_metrics (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  metric_date DATE NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  reach_count INT DEFAULT 0,
  impressions_count INT DEFAULT 0,
  saved_count INT DEFAULT 0,
  profile_visits INT DEFAULT 0,
  FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
  UNIQUE KEY idx_post_date (post_id, metric_date)
);
```

---

## 6. Interfaz de Usuario

### 6.1 Componentes del Dashboard

#### 6.1.1 Botón de Compartir en Redes

Ubicación: BlogForm.tsx (después de guardar post)
- Botón flotante "Compartir en Redes"
- Muestra miniaturas de las plataformas disponibles

#### 6.1.2 Modal de Social Share

```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📱 Publicar en Redes Sociales                          X │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────┐ ┌────────────────────┐                 │
│  │   Facebook        │ │   Instagram         │                 │
│  │   [✓] Seleccionado│ │   [ ]               │                 │
│  └────────────────────┘ └────────────────────┘                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📊 Análisis de Contenido                               │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  Título: Viaje a Sucre                                  │  │
│  │  Lectura: 5 min | Palabras: 1,200                       │  │
│  │  Imágenes: 5                                            │  │
│  │  Hashtags: #turismo #colombia #experiencia...          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📝 Previsualización                                    │  │
│  │  ┌─────────────────┐  ┌─────────────────┐               │  │
│  │  │  Facebook       │  │  Instagram      │               │  │
│  │  │  [Preview]      │  │  [Preview]      │               │  │
│  │  └─────────────────┘  └─────────────────┘               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Plantilla: [Dropdown de plantillas]                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Programar: [📅] 20/Feb/2026  [🕐] 10:00 AM             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              [💾 Guardar Borrador]                       │  │
│  │              [🚀 Publicar Ahora]                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Página de Historial

```
┌────────────────────────────────────────────────────────────────┐
│  📊 Historial de Publicaciones                     [+ Nuevo] │
├────────────────────────────────────────────────────────────────┤
│  Filtros: [Plataforma ▼] [Estado ▼] [Fecha ▼] [Buscar...]   │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📄 Título del Blog Post           📅 18/Feb/2026       │ │
│  │ Platform: Facebook  |  Estado: Publicado               │ │
│  │ Métricas: ❤️ 45  💬 12  🔄 8  👁️ 1,200               │ │
│  │ [Ver] [Editar] [Republicar]                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📄 Título del Blog Post           📅 20/Feb/2026       │ │
│  │ Platform: Instagram |  Estado: Programado              │ │
│  │ Programado para: 10:00 AM                              │ │
│  │ [Ver] [Editar] [Cancelar]                             │ │
│  └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  Página 1 de 8                              [<] 1 2 3 ... [>] │
└────────────────────────────────────────────────────────────────┘
```

### 6.3 Página de Configuración de Cuentas

```
┌────────────────────────────────────────────────────────────────┐
│  ⚙️ Configuración de Redes Sociales                           │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Facebook                                                │ │
│  │  ─────────────────────────────────────────────────────  │ │
│  │  Estado: ✅ Conectado                                   │ │
│  │  Cuenta: Moma Excursiones (5,234 seguidores)           │ │
│  │  Permisos: pages_read_engagement, pages_manage_posts    │ │
│  │  Última conexión: 18/Feb/2026                           │ │
│  │  [🔄 Reconectar]  [❌ Desconectar]                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Instagram                                               │ │
│  │  ─────────────────────────────────────────────────────  │ │
│  │  Estado: ❌ No conectado                                │ │
│  │  [🔗 Conectar con Facebook]                            │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Consideraciones de Seguridad

### 7.1 Autenticación OAuth

1. **State Parameter**: Siempre usar CSRF state parameter en OAuth
2. **Token Storage**: Guardar tokens de acceso cifrados en la base de datos
3. **Token Refresh**: Implementar refresh automático de tokens antes de expirar
4. **HTTPS**: Todas las comunicaciones deben ser HTTPS

### 7.2 Permisos

- `pages_read_engagement`: Leer métricas de páginas
- `pages_manage_posts`: Crear publicaciones
- `pages_manage_metadata`: Gestionar configuración
- `instagram_basic`: Acceso básico a Instagram
- `instagram_manage_insights`: Métricas de Instagram

### 7.3 Rate Limiting

```typescript
const RATE_LIMITS = {
  facebook: {
    posts_per_day: 25,
    posts_per_hour: 10
  },
  instagram: {
    posts_per_day: 25,
    posts_per_hour: 10
  }
};
```

---

## 8. Manejo de Errores

### 8.1 Tipos de Errores

```typescript
enum SocialErrorType {
  AUTH_EXPIRED = 'auth_expired',
  TOKEN_REVOKED = 'token_revoked',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CONTENT_POLICY_VIOLATION = 'content_policy_violation',
  MEDIA_UPLOAD_FAILED = 'media_upload_failed',
  PUBLISH_FAILED = 'publish_failed',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

interface SocialError {
  type: SocialErrorType;
  message: string;
  platform?: 'facebook' | 'instagram';
  recoverable: boolean;
  retryAfter?: number;
}
```

### 8.2 Estrategias de Recuperación

| Error | Acción |
|-------|--------|
| AUTH_EXPIRED | Auto-refresh del token, si falla → pedir reconexión |
| TOKEN_REVOKED | Notificar al usuario, marcar cuenta como inactiva |
| RATE_LIMIT_EXCEEDED | Reprogramar publicación para más tarde |
| CONTENT_POLICY_VIOLATION | Mostrar error específico, sugerir edición |
| MEDIA_UPLOAD_FAILED | Reintentar 3 veces, luego usar fallback |

---

## 9. Logging

### 9.1 Niveles de Log

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
```

### 9.2 Estructura de Log

```typescript
interface SocialLog {
  timestamp: Date;
  level: LogLevel;
  action: 'analyze' | 'generate' | 'publish' | 'schedule' | 'sync';
  platform?: 'facebook' | 'instagram';
  accountId?: string;
  postId?: string;
  blogPostId?: string;
  details: Record<string, any>;
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
  duration: number; // en milisegundos
}
```

---

## 10. Testing

### 10.1 Tests Unitarios

```typescript
// content-analyzer.test.ts
describe('ContentAnalyzerService', () => {
  describe('extractHeadings', () => {
    it('debe extraer todos los H2 del contenido', () => {...});
    it('debe extraer todos los H3 del contenido', () => {...});
    it('debe manejar contenido sin headings', () => {...});
  });
  
  describe('generateHashtags', () => {
    it('debe generar entre 5-10 hashtags relevantes', () => {...});
    debe incluir hashtags de categoría', () => {...});
    debe evitar hashtags duplicados', () => {...});
  });
});

// post-generator.test.ts
describe('PostGeneratorService', () => {
  describe('generateFacebookPost', () => {
    it('debe generar post dentro del límite de caracteres', () => {...});
    debe incluir link al blog completo', () => {...});
    debe usar plantilla seleccionada', () => {...});
  });
  
  describe('generateInstagramPost', () => {
    debe generar caption dentro del límite', () => {...});
    debe incluir hashtags en primer comentario si hay muchos', () => {...});
  });
});
```

### 10.2 Tests de Integración

```typescript
// social-integration.test.ts
describe('Social Media Integration', () => {
  it('debe completar flujo completo de publicación', async () => {
    // 1. Analizar contenido
    // 2. Generar posts
    // 3. Publicar (con mock)
    // 4. Verificar registro en historial
  });
  
  it('debe manejar error de OAuth gracefully', async () => {...});
  it('debe reintentar publicación fallida', async () => {...});
});
```

---

## 11. Manual de Usuario

### 11.1 Conectar Cuentas

1. Ir a **Configuración > Redes Sociales**
2. Hacer clic en **"Conectar"** junto a la plataforma deseada
3. Iniciar sesión con la cuenta de Facebook/Instagram
4. Seleccionar la página/perfil a conectar
5. Aprobar los permisos solicitados
6. ¡Listo! La cuenta aparecerá como conectada

### 11.2 Publicar un Blog Post

1. Crear o editar un post en el blog
2. Hacer clic en **"Compartir en Redes"**
3. Seleccionar plataformas (Facebook, Instagram o ambas)
4. Revisar el análisis de contenido generado
5. Previsualizar cómo se verá el post
6. (Opcional) Seleccionar una plantilla
7. (Opcional) Programar para más tarde
8. Hacer clic en **"Publicar Ahora"** o **"Programar"**

### 11.3 Usar Plantillas

1. En el modal de compartir, expandir **"Plantillas"**
2. Seleccionar una plantilla existente o crear nueva
3. La plantilla personalizará el formato del post

### 11.4 Ver Historial

1. Ir a **Blog > Historial de Redes**
2. Filtrar por plataforma, estado o fecha
3. Hacer clic en **"Ver"** para detalles
4. Ver métricas de publicaciones publicadas

---

## 12. Roadmap de Implementación

### Fase 1: Core (Semana 1-2)
- [ ] Módulo de análisis de contenido
- [ ] Generador de posts básicos
- [ ] Tablas de base de datos
- [ ] API endpoints básicos

### Fase 2: Integración (Semana 3-4)
- [ ] Conexión OAuth con Facebook
- [ ] Publicación en Facebook
- [ ] Previsualización Facebook
- [ ] Sistema de programación

### Fase 3: Instagram (Semana 5)
- [ ] Conexión OAuth con Instagram
- [ ] Publicación en Instagram
- [ ] Previsualización Instagram
- [ ] Optimización de imágenes

### Fase 4: Funcionalidades Extras (Semana 6)
- [ ] Plantillas personalizables
- [ ] Historial y métricas
- [ ] Múltiples cuentas
- [ ] Tests y documentación

---

## 13. Dependencias Externas

### 13.1 APIs Requeridas

1. **Facebook Graph API** v18.0
   - OAuth 2.0
   - Pages API
   - Instagram Graph API

2. **Meta for Developers**
   - App registration
   - Review de permisos

### 13.2 Paquetes NPM

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| OAuth | Protocolo de autorización para acceso delegaddo |
| Graph API | API de Facebook para interactuar con la plataforma |
| Carousel | Formato de publicación con múltiples imágenes |
| Story | Formato efímero de Instagram (24h) |
| Engagement | Interacciones de usuarios (likes, comentarios, shares) |
| Reach | Número de personas que ven el contenido |
| Impressions | Número total de visualizaciones |

---

## 15. Referencias

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Meta for Developers](https://developers.facebook.com/)
- [Best Practices for Facebook Posts](https://www.facebook.com/business/help/认真)
- [Instagram Content Guidelines](https://help.instagram.com/477434105621119)

---

*Documento generado el 18 de Febrero de 2026*
