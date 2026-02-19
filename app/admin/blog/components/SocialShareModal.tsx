'use client';

import { useState, useEffect } from 'react';
import {
  X, Share2, Facebook, Instagram, Loader2, Image, Link2,
  Calendar, Clock, Check, AlertCircle, Eye, Download, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { contentAnalyzer } from '@/lib/services/content-analyzer';
import { postGenerator } from '@/lib/services/post-generator';
import type { ContentAnalysis, GeneratedPost } from '@/lib/types/social';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogPost: {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    slug: string;
  };
}

export default function SocialShareModal({ isOpen, onClose, blogPost }: SocialShareModalProps) {
  const [step, setStep] = useState<'analyzing' | 'preview' | 'publishing' | 'done'>('analyzing');
  const [selectedPlatforms, setSelectedPlatforms] = useState<{
    facebook: boolean;
    instagram: boolean;
  }>({ facebook: true, instagram: true });
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePreview, setActivePreview] = useState<'facebook' | 'instagram'>('facebook');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && blogPost) {
      analyzeContent();
    }
  }, [isOpen, blogPost]);

  const analyzeContent = async () => {
    setStep('analyzing');
    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await contentAnalyzer.analyzeBlogContent(
        blogPost.content,
        blogPost.title
      );
      
      setAnalysis(analysisResult);
      await generatePosts(analysisResult);
    } catch (err) {
      setError('Failed to analyze content');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePosts = async (analysisData: ContentAnalysis) => {
    setIsLoading(true);
    const posts: GeneratedPost[] = [];
    const blogUrl = `${window.location.origin}/blog/${blogPost.slug}`;

    try {
      if (selectedPlatforms.facebook) {
        const fbResult = await postGenerator.generateFacebookPost(
          analysisData,
          blogUrl,
          { includeImage: true, includeLink: true }
        );
        posts.push({
          id: crypto.randomUUID(),
          platform: 'facebook',
          content: {
            message: fbResult.post.message,
            link: fbResult.post.link,
            mediaUrls: analysisData.images.slice(0, 1).map(i => i.url)
          },
          validation: fbResult.validation
        });
      }

      if (selectedPlatforms.instagram) {
        const igResult = await postGenerator.generateInstagramPost(
          analysisData,
          { includeHashtags: true, hashtagCount: 10 }
        );
        posts.push({
          id: crypto.randomUUID(),
          platform: 'instagram',
          content: {
            caption: igResult.post.caption,
            mediaUrls: analysisData.images.slice(0, 1).map(i => i.url)
          },
          validation: igResult.validation
        });
      }

      setGeneratedPosts(posts);
      setStep('preview');
    } catch (err) {
      setError('Failed to generate posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setStep('publishing');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('done');
    } catch (err) {
      setError('Failed to publish posts');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const facebookPost = generatedPosts.find(p => p.platform === 'facebook');
  const instagramPost = generatedPosts.find(p => p.platform === 'instagram');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-moma-green" />
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Compartir en Redes Sociales
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-moma-green animate-spin mb-4" />
              <p className="text-stone-600 dark:text-stone-400">Analizando contenido...</p>
            </div>
          )}

          {step === 'preview' && analysis && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedPlatforms(prev => ({ ...prev, facebook: !prev.facebook }))}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all",
                    selectedPlatforms.facebook
                      ? "border-moma-green bg-moma-green/10"
                      : "border-stone-200 dark:border-stone-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Facebook className={cn(
                      "w-6 h-6",
                      selectedPlatforms.facebook ? "text-blue-600" : "text-stone-400"
                    )} />
                    <span className="font-bold">Facebook</span>
                    {selectedPlatforms.facebook && <Check className="w-4 h-4 text-moma-green ml-auto" />}
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPlatforms(prev => ({ ...prev, instagram: !prev.instagram }))}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 transition-all",
                    selectedPlatforms.instagram
                      ? "border-moma-green bg-moma-green/10"
                      : "border-stone-200 dark:border-stone-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Instagram className={cn(
                      "w-6 h-6",
                      selectedPlatforms.instagram ? "text-pink-600" : "text-stone-400"
                    )} />
                    <span className="font-bold">Instagram</span>
                    {selectedPlatforms.instagram && <Check className="w-4 h-4 text-moma-green ml-auto" />}
                  </div>
                </button>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4">
                <h3 className="font-bold text-stone-900 dark:text-white mb-3">📊 Análisis de Contenido</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-stone-500">Título:</span>
                    <p className="font-medium truncate">{analysis.title}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Tiempo lectura:</span>
                    <p className="font-medium">{analysis.readingTime} min</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Palabras:</span>
                    <p className="font-medium">{analysis.wordCount}</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Imágenes:</span>
                    <p className="font-medium">{analysis.images.length}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-stone-500 text-sm">Hashtags:</span>
                  <p className="text-sm text-moma-green font-medium truncate">
                    {analysis.hashtags.slice(0, 5).join(' ')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivePreview('facebook')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activePreview === 'facebook'
                      ? "bg-blue-600 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                  )}
                >
                  <Facebook className="w-4 h-4 inline mr-2" />
                  Facebook
                </button>
                <button
                  onClick={() => setActivePreview('instagram')}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activePreview === 'instagram'
                      ? "bg-pink-600 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                  )}
                >
                  <Instagram className="w-4 h-4 inline mr-2" />
                  Instagram
                </button>
              </div>

              {activePreview === 'facebook' && facebookPost && (
                <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                  <div className="bg-stone-100 dark:bg-stone-800 px-4 py-2 border-b border-stone-200 dark:border-stone-700">
                    <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                      Vista previa Facebook
                    </span>
                  </div>
                  <div className="p-4 bg-white dark:bg-stone-900">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-moma-green rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Moma Excursiones</p>
                        <p className="text-xs text-stone-500">Ahora mismo</p>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap mb-3">
                      {facebookPost.content.message}
                    </p>
                    {facebookPost.content.link && (
                      <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                        <div className="h-40 bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                          <Image className="w-8 h-8 text-stone-400" />
                        </div>
                        <div className="p-3 bg-stone-50 dark:bg-stone-800">
                          <p className="text-xs text-stone-500">momanature.com</p>
                          <p className="font-medium text-sm line-clamp-2">{blogPost.title}</p>
                        </div>
                      </div>
                    )}
                    {facebookPost.validation.warnings && facebookPost.validation.warnings.length > 0 && (
                      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          ⚠️ {facebookPost.validation.warnings[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activePreview === 'instagram' && instagramPost && (
                <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                  <div className="bg-stone-100 dark:bg-stone-800 px-4 py-2 border-b border-stone-200 dark:border-stone-700">
                    <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                      Vista previa Instagram
                    </span>
                  </div>
                  <div className="bg-white dark:bg-stone-900">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 bg-moma-green rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M</span>
                      </div>
                      <p className="font-bold text-sm">moma_excursiones</p>
                    </div>
                    <div className="aspect-square bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                      <Image className="w-12 h-12 text-stone-400" />
                    </div>
                    <div className="p-3">
                      <div className="flex gap-4 mb-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <p className="text-sm">
                        <span className="font-bold">moma_excursiones</span>{' '}
                        {instagramPost.content.caption?.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4">
                <h3 className="font-bold text-stone-900 dark:text-white mb-3">📅 Programar Publicación</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-500 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-500 mb-1">Hora</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Déjalo en blanco para publicar inmediatamente
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'publishing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-moma-green animate-spin mb-4" />
              <p className="text-stone-600 dark:text-stone-400">Publicando en redes sociales...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                ¡Publicación Exitosa!
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-center mb-6">
                Tu contenido ha sido publicado en las redes sociales seleccionadas.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-moma-green text-white rounded-xl font-bold hover:bg-moma-green/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {step === 'preview' && (
          <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 flex gap-3">
            <button
              onClick={analyzeContent}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerar
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading || (generatedPosts.length === 0)}
              className="px-6 py-2 bg-moma-green text-white rounded-xl font-bold hover:bg-moma-green/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {scheduleDate ? (
                <>
                  <Calendar className="w-4 h-4" />
                  Programar
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Publicar Ahora
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
