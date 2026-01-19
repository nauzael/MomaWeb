'use client';

import React from 'react';
import styles from './ButtonFlex.module.css';
import { cn } from '@/lib/utils';
import { Mukta } from 'next/font/google';

const mukta = Mukta({
    weight: '700',
    subsets: ['latin'],
    display: 'swap',
});

interface ButtonFlexProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    className?: string;
}

export default function ButtonFlex({ text, className, ...props }: ButtonFlexProps) {
    return (
        <button className={cn(styles.buttonFlex, className)} {...props}>
            <span className={styles.circle} aria-hidden="true">
                <span className={cn(styles.icon, styles.arrow)}></span>
            </span>
            <span className={cn(styles.buttonText, mukta.className)}>{text}</span>
        </button>
    );
}
