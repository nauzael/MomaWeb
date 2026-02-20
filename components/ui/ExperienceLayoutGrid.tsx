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
                  "relative group overflow-hidden rounded-2xl block",
                  getGridClass(index)
                )}
              >
                <Link href={`/experiencia?slug=${card.experience.slug}`} className="absolute inset-0 z-30" />

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
    </div>
  );
};
