// --- src/components/ui/Button.tsx ---
import React from 'react';

export const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' | 'link'; size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'xs-sm'; baseClass?: string }
>(({ className = '', children, variant = 'default', size = 'default', baseClass = 'btn', ...props }, ref) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-size-${size}`;

    return (
        <button
            ref={ref}
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});
Button.displayName = 'Button';
