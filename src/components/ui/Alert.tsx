// --- src/components/ui/Alert.tsx ---
import React from 'react';

export const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' | 'success' }>(
    ({ className = '', variant = 'default', ...props }, ref) => {
        const variantClass = `alert-${variant}`;
        return (
            <div
                ref={ref}
                role="alert"
                className={`alert-base ${variantClass} ${className}`}
                {...props}
            />
        );
    }
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className = '', ...props }, ref) => (
        <h5 ref={ref} className={`alert-title-base ${className}`} {...props} />
    )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className = '', ...props }, ref) => (
        <div ref={ref} className={`alert-description-base ${className}`} {...props} />
    )
);
AlertDescription.displayName = 'AlertDescription';
