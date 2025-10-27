// --- src/components/ui/Textarea.tsx ---
import React from 'react';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = '', ...props }, ref) => (
        <textarea ref={ref} className={`textarea-base ${className}`} {...props} />
    )
);
Textarea.displayName = 'Textarea';
