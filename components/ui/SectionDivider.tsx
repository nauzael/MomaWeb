import React from 'react';

interface SectionDividerProps {
    className?: string;
    fill?: string;
    variant?: 'mountains' | 'waves' | 'brush';
    flip?: boolean;
}

export default function SectionDivider({ className = "", fill = "currentColor", variant = 'mountains', flip = false }: SectionDividerProps) {
    const paths = {
        mountains: "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,106.7C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
        waves: "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
        brush: "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
    };

    return (
        <div className={`absolute left-0 right-0 w-full overflow-hidden leading-none z-10 ${flip ? 'rotate-180 -bottom-px' : '-top-px'} ${className}`}>
            <svg
                className="relative block w-[calc(100%+1.3px)] h-[100px] md:h-[150px]"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
            >
                <path
                    fill={fill}
                    fillOpacity="1"
                    d={paths[variant]}
                />
            </svg>
        </div>
    );
}
