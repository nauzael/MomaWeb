'use client';

import { useState, useEffect, useRef } from 'react';
import ExperienceCarousel from '@/components/experiences/ExperienceCarousel';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowRight, ChevronLeft, ChevronRight, Leaf, Sprout, Tent, Users } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { getAllExperiencesPersisted, type Experience } from '@/lib/experience-service';
import { MOCK_EXPERIENCES } from '@/lib/mock-data';
import SectionDivider from '@/components/ui/SectionDivider';
import ParallaxGallery from '@/components/ui/ParallaxGallery';

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>(MOCK_EXPERIENCES as unknown as Experience[]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      getAllExperiencesPersisted()
        .then((data) => {
          if (!cancelled) setExperiences(data);
        })
        .catch((error) => {
          if (error?.message !== 'ABORTED') {
            console.error('Failed to load experiences:', error);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (experiences.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % experiences.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [experiences.length]);

  const nextSlide = () => {
    if (experiences.length === 0) return;
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % experiences.length);
  };
  const prevSlide = () => {
    if (experiences.length === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  const hasExperiences = experiences.length > 0;
  const currentExperience = hasExperiences ? experiences[currentSlide] : null;

  // Parallax logic
  const parallaxRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"]
  });
  // Increased movement range and added subtle scale for more depth
  const yParallax = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);

  // Hero Parallax Logic
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(heroScrollY, [0, 1], ["0%", "20%"]); // Reduced range to prevent top gap
  const heroScale = useTransform(heroScrollY, [0, 1], [1, 1.15]); // Subtle scale
  const heroOpacity = useTransform(heroScrollY, [0, 0.8], [1, 0.2]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section / Carousel */}
      <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden bg-stone-900">
        {/* Background Images with Framer Motion - Extended height to handle parallax without gaps */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-0 h-[130vh] -top-[30vh] w-full">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ x: direction > 0 ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: direction > 0 ? '-100%' : '100%' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={currentExperience?.image || '/images/hero-bg.jpg'}
                alt={currentExperience?.title || 'Experiencia Moma Nature'}
                fill
                priority
                className="object-cover"
                sizes="100vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent"></div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="relative z-10 px-4 max-w-7xl mx-auto w-full pt-20">
          <div className="max-w-3xl">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-4 leading-tight drop-shadow-xl">
                {currentExperience
                  ? currentExperience.title
                  : <>La magia de la <br /><span className="text-moma-green italic font-serif">naturaleza</span> te <br />espera</>}
              </h1>
              {/* Location element removed as per user request */}

              <p className="text-lg md:text-xl text-stone-200 mb-10 font-light max-w-lg leading-relaxed line-clamp-3">
                {currentExperience
                  ? currentExperience.description
                  : 'Explora experiencias únicas en la naturaleza colombiana, seleccionadas y gestionadas desde nuestro panel de tours.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link
                  href={currentExperience ? `/experiencias/${currentExperience.slug}` : "#experiencias"}
                  className="bg-moma-green text-white px-8 py-4 rounded-full text-base font-bold hover:bg-white hover:text-moma-green transition-all shadow-lg shadow-moma-green/20 flex items-center justify-center min-w-[200px]"
                >
                  Ver Experiencia <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <div className="flex gap-2">
                  <button onClick={prevSlide} className="p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all" aria-label="Anterior">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextSlide} className="p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all" aria-label="Siguiente">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {experiences.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-12 h-1 rounded-full transition-all ${i === currentSlide ? 'bg-moma-green' : 'bg-white/30'}`}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === currentSlide ? 'true' : 'false'}
            />
          ))}
        </div>

      </section >

      {/* Destinations Section */}
      < section id="experiencias" className="pt-12 pb-4 px-0 bg-stone-50 dark:bg-stone-950" >
        <div className="w-full">
          <div className="text-center mb-10 px-4">
            <span className="text-moma-green uppercase tracking-widest text-xs font-bold mb-3 block">Lugares para ir</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 dark:text-white mb-6">Un destino perfecto</h2>
            <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">¡Descubre el mundo a tu manera! Te invitamos a embarcarte en una emocionante aventura a través de nuestras rutas turísticas.</p>
          </div>

          <ExperienceCarousel experiences={experiences} />
        </div>
        <SectionDivider className="text-stone-50 dark:text-stone-950 top-auto -bottom-px z-20" variant="mountains" />
      </section >



      {/* Why Choose Us */}
      < section id="nosotros" className="py-24 bg-white dark:bg-stone-900" >
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <span className="text-moma-green uppercase tracking-widest text-xs font-bold mb-3 block">Una elección brillante</span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 dark:text-white">¿Por qué elegirnos?</h2>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          {[
            { title: 'Autenticidad y Cultura', icon: Leaf },
            { title: 'Conservación', icon: Sprout },
            { title: 'Experiencias Únicas', icon: Tent },
            { title: 'Apoyo Local', icon: Users }
          ].map((item, i) => (
            <div key={i} className="text-center group p-8 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border border-stone-100 dark:border-stone-800 hover:shadow-2xl hover:bg-white dark:hover:bg-stone-900 hover:-translate-y-2 transition-all duration-300">
              <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 group-hover:bg-moma-green group-hover:text-white transition-all duration-300 text-moma-green">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-stone-900 dark:text-white group-hover:translate-x-1 transition-transform">{item.title}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                Compromiso con el turismo sostenible y el desarrollo de comunidades locales.
              </p>
            </div>
          ))}
        </div>
        <SectionDivider className="text-stone-50 dark:text-stone-950 top-auto -bottom-px z-20" variant="mountains" />
      </section >

      {/* Dynamic Parallax Gallery Section */}
      <ParallaxGallery />

      {/* CTA Section */}
      < section ref={parallaxRef} className="py-24 bg-stone-900 relative overflow-hidden min-h-[700px] flex items-center" >
        {/* Background with color but dark overlay for contrast + Improved Parallax */}
        < motion.div
          style={{ y: yParallax, scale: scaleParallax }
          }
          className="absolute inset-0 h-[140%] -top-[20%] w-full bg-[url('/images/montes-m-frame.webp')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-stone-900/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-green-900/40 mix-blend-overlay"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center pb-32 pt-10">
          <span className="text-moma-green text-xl md:text-2xl font-light mb-4 font-sans tracking-wide">Ideas que transforman</span>
          <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8 leading-tight drop-shadow-lg">
            Únete a nuestra aventura <br className="hidden md:block" /> y deja huellas positivas
          </h2>
          <div className="w-24 h-1.5 bg-moma-green rounded-full mb-12"></div>

          <Link
            href="/experiencias"
            className="bg-[#009688] text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-[#00796b] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Empezar la Aventura
          </Link>
        </div>
        <SectionDivider className="text-stone-50 dark:text-stone-950 top-auto -bottom-px z-20" variant="mountains" />
      </section >

      {/* Contact Section */}
      < section id="contacto" className="py-24 bg-stone-50 dark:bg-stone-950" >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-moma-green uppercase tracking-widest text-xs font-bold mb-3 block">Ponte en contacto</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 dark:text-white">Envíanos un mensaje</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-moma-green/10 rounded-xl flex items-center justify-center text-moma-green mr-4">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Whatsapp</p>
                  <p className="font-bold text-stone-900 dark:text-white font-heading text-lg">+57 301 6566932</p>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-moma-green/10 rounded-xl flex items-center justify-center text-moma-green mr-4">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="font-bold text-stone-900 dark:text-white font-heading text-lg">momaexcursiones@gmail.com</p>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-moma-green/10 rounded-xl flex items-center justify-center text-moma-green mr-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Ubicación</p>
                  <p className="font-bold text-stone-900 dark:text-white font-heading text-lg">Sucre, Colombia</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-lg shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800">
              <form className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="name" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Nombre</label>
                  <input id="name" type="text" className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moma-green/50 focus:border-moma-green transition-all" placeholder="Tu nombre" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label htmlFor="email" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Email</label>
                  <input id="email" type="email" className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moma-green/50 focus:border-moma-green transition-all" placeholder="tucorreo@email.com" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="message" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Mensaje</label>
                  <textarea id="message" rows={4} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-moma-green/50 focus:border-moma-green transition-all" placeholder="Cuéntanos tus planes..."></textarea>
                </div>
                <div className="col-span-2">
                  <button type="submit" className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-4 rounded-xl font-bold hover:bg-moma-green dark:hover:bg-stone-200 transition-all w-full md:w-auto shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300">
                    Enviar Mensaje
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section >
    </div >
  );
}
