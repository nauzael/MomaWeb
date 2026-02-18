"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MapPin, Users, ArrowRight, Clock, X, Filter } from "lucide-react";
import Link from "next/link";
import { type Experience } from "@/lib/experience-service";
import { getImageUrl } from "@/lib/api-client";

type Card = {
  id: string;
  thumbnail: string;
  experience: Experience;
};

export const ExperienceLayoutGrid = ({ experiences }: { experiences: Experience[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Obtener ubicaciones únicas para el filtro
  const locations = useMemo(() => {
    const locs = experiences
      .map((exp) => exp.location_name)
      .filter((loc): loc is string => !!loc && loc.trim() !== "");
    return [...new Set(locs)];
  }, [experiences]);

  // Filtrar experiencias según la ubicación seleccionada
  const filteredExperiences = useMemo(() => {
    if (activeFilter === "all") return experiences;
    return experiences.filter((exp) => exp.location_name === activeFilter);
  }, [experiences, activeFilter]);

  const cards: Card[] = filteredExperiences.map((exp) => ({
    id: exp.id,
    thumbnail: getImageUrl(exp.image) || "",
    experience: exp,
  }));

  // Asignar clases de grid según el patrón masonry (llena los espacios)
  const getGridClass = (index: number): string => {
    const pattern = index % 4;
    switch (pattern) {
      case 0:
        return "md:col-span-2 md:row-span-2";
      case 1:
        return "col-span-1 row-span-1";
      case 2:
        return "col-span-1 row-span-1";
      case 3:
        return "md:col-span-2 row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  const handleCardClick = (card: Card) => {
    setSelected(card);
  };

  const handleClose = () => {
    setSelected(null);
  };

  return (
    <div className="w-full">
      {/* Filtros de categoría */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Filtrar por ubicación:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeFilter === "all"
                ? "bg-moma-green text-white"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            )}
          >
            Todas ({experiences.length})
          </button>
          {locations.map((location) => {
            const count = experiences.filter(
              (exp) => exp.location_name === location
            ).length;
            return (
              <button
                key={location}
                onClick={() => setActiveFilter(location)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  activeFilter === location
                    ? "bg-moma-green text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                {location} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid masonry-like */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-[200px]">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const isLarge = getGridClass(index).includes("col-span-2");
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "relative group cursor-pointer overflow-hidden rounded-2xl",
                  getGridClass(index)
                )}
                onClick={() => handleCardClick(card)}
              >
                <div className="absolute inset-0">
                  <Image
                    src={card.thumbnail || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800"}
                    alt={card.experience.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <span className="text-sm font-bold text-stone-900">
                      ${Number(card.experience.price_cop).toLocaleString("es-CO")}
                    </span>
                  </div>

                  {/* Location */}
                  {card.experience.location_name && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-moma-green" />
                      <span className="text-xs font-medium text-white/90">
                        {card.experience.location_name}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={cn(
                    "font-heading font-bold text-white leading-tight mb-2 line-clamp-2",
                    isLarge ? "text-xl md:text-2xl" : "text-base md:text-lg"
                  )}>
                    {card.experience.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-white/70">
                    {card.experience.max_capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{card.experience.max_capacity}</span>
                      </div>
                    )}
                    {card.experience.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{card.experience.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-3 flex items-center gap-2 text-moma-green font-semibold text-sm">
                    <span>Ver más</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mensaje si no hay resultados */}
      {cards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-500 text-lg">
            No hay experiencias disponibles para esta ubicación.
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="mt-4 text-moma-green font-medium hover:underline"
          >
            Ver todas las experiencias
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Image */}
                <div className="relative w-full md:w-1/2 h-64 md:h-auto">
                  <Image
                    src={selected.thumbnail || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200"}
                    alt={selected.experience.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 bg-white dark:bg-stone-900 p-6 md:p-8 overflow-y-auto">
                  {/* Price */}
                  <div className="inline-block bg-moma-green px-4 py-1.5 rounded-full mb-4">
                    <span className="text-xl font-bold text-white">
                      ${Number(selected.experience.price_cop).toLocaleString("es-CO")}
                    </span>
                  </div>

                  {/* Location */}
                  {selected.experience.location_name && (
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-moma-green" />
                      <span className="text-stone-600 dark:text-stone-300">
                        {selected.experience.location_name}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-stone-900 dark:text-white mb-4">
                    {selected.experience.title}
                  </h2>

                  {/* Description */}
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                    {selected.experience.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {selected.experience.max_capacity && (
                      <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-full">
                        <Users className="w-5 h-5 text-moma-green" />
                        <span className="text-stone-700 dark:text-stone-200">
                          Hasta {selected.experience.max_capacity} personas
                        </span>
                      </div>
                    )}
                    {selected.experience.duration && (
                      <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5 text-moma-green" />
                        <span className="text-stone-700 dark:text-stone-200">
                          {selected.experience.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/experiencia?slug=${selected.experience.slug}`}
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 bg-moma-green text-white px-6 py-3 rounded-full font-bold hover:bg-[#229ca3] transition-colors"
                  >
                    <span>Reservar ahora</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
