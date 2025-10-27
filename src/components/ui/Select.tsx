// --- src/components/ui/Select.tsx ---
import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown } from './Icons';

const SelectContext = React.createContext<{
    currentValue?: string;
    onValueChange: (value: string) => void;
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    options?: { value: string, label: React.ReactNode }[];
}>({ onValueChange: () => { } });

export const Select: React.FC<{
    children: React.ReactNode;
    onValueChange: (value: string) => void;
    value?: string | number;
    id?: string;
    className?: string;
}> = ({ children, onValueChange, value, id, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(!isOpen);
    const handleValueChange = (selectedValue: string) => {
        onValueChange(selectedValue);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && triggerRef.current && contentRef.current) {
            const triggerWidth = triggerRef.current.offsetWidth;
            contentRef.current.style.width = `${triggerWidth}px`;
        }
    }, [isOpen]);

    const contextValue = {
        currentValue: value !== undefined ? String(value) : undefined,
        onValueChange: handleValueChange,
        setIsOpen,
        options: React.Children.toArray(children)
            .filter((child: any): child is React.ReactElement<{ value: string, children: React.ReactNode }> =>
                React.isValidElement(child) && child.type === SelectItem
            )
            .map((child: React.ReactElement<{ value: string, children: React.ReactNode }>) => ({
                value: child.props.value,
                label: child.props.children
            }))
    };

    return (
        <SelectContext.Provider value={contextValue}>
            <div ref={selectRef} className={`select-container ${className || ''}`} id={id}>
                {React.Children.map(children, child => {
                    if (React.isValidElement(child) && child.type === SelectTrigger) {
                        return React.cloneElement(child as React.ReactElement<any>, { onClick: handleToggle, ref: triggerRef });
                    }
                    if (React.isValidElement(child) && child.type === SelectContent) {
                        return isOpen ? React.cloneElement(child as React.ReactElement<any>, { ref: contentRef }) : null;
                    }
                    return null;
                })}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className = '', children, ...props }, ref) => (
        <button ref={ref} type="button" className={`select-trigger ${className}`} {...props}>
            {children}
            <ChevronDown />
        </button>
    )
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const { currentValue, options } = React.useContext(SelectContext);
    const selectedOption = options?.find(opt => opt.value === currentValue);
    const displayValue = selectedOption ? selectedOption.label : currentValue;
    return (
        <span className={`select-value ${!displayValue && placeholder ? 'select-value-placeholder' : ''}`}>
            {displayValue || placeholder}
        </span>
    );
};

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div ref={ref} className={`select-content ${className}`} {...props}>
            <div className="select-content-inner">{children}</div>
        </div>
    )
);
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
    ({ className = '', children, value, ...props }, ref) => {
        const { onValueChange, currentValue, setIsOpen } = React.useContext(SelectContext);
        const isSelected = currentValue === value;
        return (
            <div
                ref={ref}
                onClick={() => {
                    onValueChange(value);
                    if (setIsOpen) setIsOpen(false);
                }}
                className={`select-item ${isSelected ? 'select-item-selected' : ''} ${className}`}
                onFocus={(e) => e.currentTarget.classList.add('select-item-focused')}
                onBlur={(e) => e.currentTarget.classList.remove('select-item-focused')}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onValueChange(value);
                        if (setIsOpen) setIsOpen(false);
                    }
                }}
            >
                <span className="select-item-label">{children}</span>
                {isSelected && <Check className="select-item-check" />}
            </div>
        );
    }
);
SelectItem.displayName = 'SelectItem';
