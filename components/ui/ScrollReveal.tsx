"use client";

import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    className?: string;
    delay?: number;
    duration?: number;
    staggerChildren?: number;
    // Updated default and added 'cinematic' option
    variant?: "fade-up" | "fade-in" | "scale-up" | "slide-right" | "slide-left" | "cinematic";
}

export const ScrollReveal = ({
    children,
    width = "100%",
    className,
    delay = 0,
    duration = 1.0, // Slower default for cinematic feel
    staggerChildren = 0.1,
    variant = "cinematic", // Defaulting to Option 2: Cinematic Depth
}: ScrollRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    const variants = {
        "cinematic": {
            hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
            visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
        },
        "fade-up": {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
        },
        "fade-in": {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
        "scale-up": {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
        },
        "slide-right": {
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0 },
        },
        "slide-left": {
            hidden: { opacity: 0, x: 30 },
            visible: { opacity: 1, x: 0 },
        }
    };

    const selectedVariant = variants[variant] || variants["cinematic"];

    return (
        <motion.div
            ref={ref}
            variants={{
                hidden: selectedVariant.hidden,
                visible: {
                    ...selectedVariant.visible,
                    transition: {
                        duration: duration,
                        ease: [0.25, 0.4, 0.25, 1], // Smoother cinematic ease
                        delay: delay,
                        staggerChildren: staggerChildren
                    }
                },
            }}
            initial="hidden"
            animate={controls}
            className={cn(width === "fit-content" ? "inline-block" : "block", className)}
        >
            {children}
        </motion.div>
    );
};
