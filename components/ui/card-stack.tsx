"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export type CardStackItem = {
    id: string | number;
    title: string;
    description?: string;
    imageSrc?: string;
    href?: string;
    ctaLabel?: string;
    tag?: string;
};

export type CardStackProps<T extends CardStackItem> = {
    items: T[];

    /** Selected index on mount */
    initialIndex?: number;

    /** How many cards are visible around the active (odd recommended) */
    maxVisible?: number;

    /** Card sizing */
    cardWidth?: number;
    cardHeight?: number;

    /** How much cards overlap each other (0..0.8). Higher = more overlap */
    overlap?: number;

    /** Total fan angle (deg). Higher = wider arc */
    spreadDeg?: number;

    /** 3D / depth feel */
    perspectivePx?: number;
    depthPx?: number;
    tiltXDeg?: number;

    /** Active emphasis */
    activeLiftPx?: number;
    activeScale?: number;
    inactiveScale?: number;

    /** Motion */
    springStiffness?: number;
    springDamping?: number;

    /** Behavior */
    loop?: boolean;
    autoAdvance?: boolean;
    intervalMs?: number;
    pauseOnHover?: boolean;

    /** UI */
    showDots?: boolean;
    className?: string;

    /** Hooks */
    onChangeIndex?: (index: number, item: T) => void;

    /** Custom renderer (optional) */
    renderCard?: (item: T, state: { active: boolean }) => React.ReactNode;
};

function wrapIndex(n: number, len: number) {
    if (len <= 0) return 0;
    return ((n % len) + len) % len;
}

/** Minimal signed offset from active index to i, with wrapping (for loop behavior). */
function signedOffset(i: number, active: number, len: number, loop: boolean) {
    const raw = i - active;
    if (!loop || len <= 1) return raw;

    // consider wrapped alternative
    const alt = raw > 0 ? raw - len : raw + len;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack<T extends CardStackItem>({
    items,
    initialIndex = 0,
    maxVisible = 5,

    cardWidth = 320,
    cardHeight = 420,

    overlap = 0.48,
    spreadDeg = 48,

    perspectivePx = 1100,
    depthPx = 140,
    tiltXDeg = 12,

    activeLiftPx = 22,
    activeScale = 1.03,
    inactiveScale = 0.94,

    springStiffness = 200, // Softer spring for "natural" feel
    springDamping = 25,

    loop = true,
    autoAdvance = false,
    intervalMs = 4000,
    pauseOnHover = true,

    showDots = true,
    className,

    onChangeIndex,
    renderCard,
}: CardStackProps<T>) {
    const reduceMotion = useReducedMotion();
    const len = items.length;
    const router = useRouter();

    const [active, setActive] = React.useState(() =>
        wrapIndex(initialIndex, len),
    );
    const [hovering, setHovering] = React.useState(false);

    // keep active in bounds if items change
    React.useEffect(() => {
        setActive((a) => wrapIndex(a, len));
    }, [len]);

    React.useEffect(() => {
        if (!len) return;
        onChangeIndex?.(active, items[active]!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const maxOffset = Math.max(0, Math.floor(maxVisible / 2));

    const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)));
    const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;

    const canGoPrev = loop || active > 0;
    const canGoNext = loop || active < len - 1;

    const prev = React.useCallback(() => {
        if (!len) return;
        if (!canGoPrev) return;
        setActive((a) => wrapIndex(a - 1, len));
    }, [canGoPrev, len]);

    const next = React.useCallback(() => {
        if (!len) return;
        if (!canGoNext) return;
        setActive((a) => wrapIndex(a + 1, len));
    }, [canGoNext, len]);

    // keyboard navigation (when container focused)
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    // autoplay
    React.useEffect(() => {
        if (!autoAdvance) return;
        if (reduceMotion) return;
        if (!len) return;
        if (pauseOnHover && hovering) return;

        const id = window.setInterval(
            () => {
                if (loop || active < len - 1) next();
            },
            Math.max(700, intervalMs),
        );

        return () => window.clearInterval(id);
    }, [
        autoAdvance,
        intervalMs,
        hovering,
        pauseOnHover,
        reduceMotion,
        len,
        loop,
        active,
        next,
    ]);

    if (!len) return null;

    const activeItem = items[active]!;

    return (
        <div
            className={cn("w-full flex flex-col items-center", className)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* Stage */}
            <div
                className="relative w-full flex justify-center overflow-visible"
                style={{ height: Math.max(380, cardHeight + 80) }}
                tabIndex={0}
                onKeyDown={onKeyDown}
            >
                {/* background wash / spotlight (unique feel) */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-48 w-[70%] rounded-full bg-black/5 blur-3xl dark:bg-white/5"
                    aria-hidden="true"
                />
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-40 w-[76%] rounded-full bg-black/10 blur-3xl dark:bg-black/30"
                    aria-hidden="true"
                />

                <div
                    className="absolute inset-0 flex items-end justify-center"
                    style={{
                        perspective: `${perspectivePx}px`,
                    }}
                >
                    <AnimatePresence initial={false}>
                        {items.map((item, i) => {
                            const off = signedOffset(i, active, len, loop);
                            const abs = Math.abs(off);
                            const visible = abs <= maxOffset;

                            // hide far-away cards cleanly
                            if (!visible) return null;

                            // fan geometry
                            const rotateZ = off * stepDeg;
                            const x = off * cardSpacing;
                            const y = abs * 10; // subtle arc-down feel
                            const z = -abs * depthPx;

                            const isActive = off === 0;

                            const scale = isActive ? activeScale : inactiveScale;
                            const lift = isActive ? -activeLiftPx : 0;

                            const rotateX = isActive ? 0 : tiltXDeg;

                            const zIndex = 100 - abs;

                            // drag only on the active card
                            const dragProps = isActive
                                ? {
                                    drag: "x" as const,
                                    dragConstraints: { left: 0, right: 0 },
                                    dragElastic: 0.18,
                                    onDragEnd: (
                                        _e: any,
                                        info: { offset: { x: number }; velocity: { x: number } },
                                    ) => {
                                        if (reduceMotion) return;
                                        const travel = info.offset.x;
                                        const v = info.velocity.x;
                                        const threshold = Math.min(160, cardWidth * 0.22);

                                        // swipe logic
                                        if (travel > threshold || v > 650) prev();
                                        else if (travel < -threshold || v < -650) next();
                                    },
                                }
                                : {};

                            return (
                                <motion.div
                                    key={item.id}
                                    className={cn(
                                        "absolute bottom-0 rounded-2xl border-4 border-black/10 dark:border-white/10 overflow-hidden shadow-xl transition-shadow duration-300",
                                        "will-change-transform select-none bg-stone-100 dark:bg-stone-900",
                                        isActive
                                            ? "cursor-pointer hover:shadow-2xl hover:border-moma-green/50"
                                            : "cursor-pointer hover:brightness-110",
                                    )}
                                    style={{
                                        width: cardWidth,
                                        height: cardHeight,
                                        zIndex,
                                        transformStyle: "preserve-3d",
                                    }}
                                    initial={
                                        reduceMotion
                                            ? false
                                            : {
                                                opacity: 0,
                                                y: y + 40,
                                                x,
                                                rotateZ,
                                                rotateX,
                                                scale,
                                            }
                                    }
                                    animate={{
                                        opacity: 1,
                                        x,
                                        y: y + lift,
                                        rotateZ,
                                        rotateX,
                                        scale,
                                    }}
                                    whileHover={isActive ? {
                                        scale: scale * 1.05,
                                        y: y + lift - 10,
                                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)"
                                    } : {}}
                                    transition={{
                                        type: "spring",
                                        stiffness: springStiffness,
                                        damping: springDamping,
                                    }}
                                    onClick={() => {
                                        if (isActive && item.href) {
                                            router.push(item.href);
                                        } else {
                                            setActive(i);
                                        }
                                    }}
                                    {...dragProps}
                                >
                                    <div
                                        className="h-full w-full"
                                        style={{
                                            transform: `translateZ(${z}px)`,
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        {renderCard ? (
                                            renderCard(item, { active: isActive })
                                        ) : (
                                            <DefaultFanCard item={item} active={isActive} />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dots navigation centered at bottom */}
            {showDots ? (
                <div className="mt-6 flex items-center justify-center gap-3">
                    {items.map((it, idx) => {
                        const on = idx === active;
                        return (
                            <button
                                key={it.id}
                                onClick={() => setActive(idx)}
                                className={cn(
                                    "h-2 w-2 rounded-full transition-all duration-300",
                                    on
                                        ? "bg-moma-green w-6"
                                        : "bg-stone-300 dark:bg-stone-700 hover:bg-moma-green/50"
                                )}
                                aria-label={`Go to ${it.title}`}
                            />
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

function DefaultFanCard({ item, active }: { item: CardStackItem; active: boolean }) {
    return (
        <div className="relative h-full w-full group">
            {/* image */}
            <div className="absolute inset-0">
                {item.imageSrc ? (
                    <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        draggable={false}
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-200 text-sm text-stone-500">
                        No image
                    </div>
                )}
            </div>

            {/* subtle gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

            {/* content */}
            <div className="relative z-10 flex h-full flex-col justify-end p-6 text-left">
                {item.tag && (
                    <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-moma-green rounded-full w-fit shadow-md">
                        {item.tag}
                    </span>
                )}
                <div className="text-2xl font-bold text-white font-heading leading-tight mb-2 drop-shadow-md">
                    {item.title}
                </div>
                {item.ctaLabel && (
                    <div className="text-lg font-light text-moma-green mb-2">{item.ctaLabel}</div>
                )}

                <div className={cn(
                    "grid grid-rows-[0fr] transition-all duration-500 ease-in-out",
                    active ? "grid-rows-[1fr]" : "group-hover:grid-rows-[1fr]"
                )}>
                    <div className="overflow-hidden">
                        {item.description ? (
                            <div className="line-clamp-3 text-sm text-white/90 font-medium font-sans mb-4">
                                {item.description}
                            </div>
                        ) : null}
                    </div>
                </div>

                {item.href && (
                    <div className={cn(
                        "mt-2 pt-4 border-t border-white/20 flex justify-between items-center text-white text-xs uppercase tracking-widest font-bold transition-all duration-300",
                        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"
                    )}>
                        <span>Ver Detalles</span>
                        <div className="bg-white/20 p-2 rounded-full group-hover:bg-moma-green transition-colors duration-300">
                            <SquareArrowOutUpRight className="h-4 w-4" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
