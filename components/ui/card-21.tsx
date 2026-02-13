import * as React from "react";
import { cn } from "@/lib/utils"; // Your utility for merging class names
import { ArrowRight } from "lucide-react";

// Define the props for the DestinationCard component
interface DestinationCardProps extends React.HTMLAttributes<HTMLDivElement> {
    imageUrl: string;
    location: string;
    flag: string;
    stats: string;
    href: string;
    themeColor: string; // e.g., "150 50% 25%" for a deep green
}

const DestinationCard = React.forwardRef<HTMLDivElement, DestinationCardProps>(
    ({ className, imageUrl, location, flag, stats, href, themeColor, ...props }, ref) => {
        return (
            // The 'group' class enables hover effects on child elements
            <div
                ref={ref}
                style={{
                    // @ts-ignore - CSS custom properties are valid
                    "--theme-color": themeColor,
                } as React.CSSProperties}
                className={cn("group w-full h-full", className)}
                {...props}
            >
                <a
                    href={href}
                    className="relative block w-full h-full rounded-2xl overflow-hidden shadow-lg 
                     transition-all duration-500 ease-in-out 
                     group-hover:scale-105 group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
                    aria-label={`Explore details for ${location}`}
                    style={{
                        boxShadow: `0 0 40px -15px hsl(var(--theme-color) / 0.5)`
                    }}
                >
                    {/* Background Image with Parallax Zoom */}
                    <div
                        className="absolute inset-0 bg-cover bg-center 
                       transition-transform duration-500 ease-in-out group-hover:scale-110"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />

                    {/* Themed Gradient Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to top, hsl(var(--theme-color) / 0.9), hsl(var(--theme-color) / 0.6) 30%, transparent 60%)`,
                        }}
                    />

                    {/* Content */}
                    <div className="relative flex flex-col justify-end h-full p-8 text-white">
                        <h3 className="text-3xl md:text-2xl lg:text-3xl font-heading font-black tracking-tight leading-tight italic drop-shadow-md">
                            {location} <span className="text-xl ml-1 not-italic opacity-80">{flag}</span>
                        </h3>
                        <p className="text-xs font-sans text-white/70 mt-3 font-black uppercase tracking-[0.2em]">{stats}</p>

                        {/* Explore Button */}
                        <div className="mt-8 flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 
                           rounded-full px-6 py-3 
                           transition-all duration-300 
                           group-hover:bg-white group-hover:border-white group-hover:text-moma-green group-hover:shadow-lg">
                            <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em]">Leer Historia</span>
                            <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </div>
                </a>
            </div>
        );
    }
);
DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
