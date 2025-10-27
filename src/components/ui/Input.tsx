// --- src/components/ui/Input.tsx ---
import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void }>(
    ({ className = '', type = "text", onWheel, ...props }, ref) => (
        <input ref={ref} type={type} className={`input-base ${className}`} {...props} onWheel={onWheel} />
    )
);
Input.displayName = 'Input';
