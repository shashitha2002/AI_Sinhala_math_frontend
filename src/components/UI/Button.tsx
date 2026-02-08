import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    fullWidth = false,
    ...props
}) => {
    const baseClasses = 'font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation';

    const variantClasses: Record<ButtonVariant, string> = {
        primary: 'bg-dominant-600 dark:bg-dominant-500 hover:bg-dominant-700 dark:hover:bg-dominant-600 active:bg-dominant-800 dark:active:bg-dominant-700 text-white focus:ring-dominant-500 dark:focus:ring-dominant-400 shadow-md hover:shadow-lg active:shadow-sm',
        secondary: 'bg-secondary-600 dark:bg-secondary-500 hover:bg-secondary-700 dark:hover:bg-secondary-600 active:bg-secondary-800 dark:active:bg-secondary-700 text-white focus:ring-secondary-500 dark:focus:ring-secondary-400 shadow-md hover:shadow-lg active:shadow-sm',
        success: 'bg-success-600 dark:bg-success-500 hover:bg-success-700 dark:hover:bg-success-600 active:bg-success-800 dark:active:bg-success-700 text-white focus:ring-success-500 dark:focus:ring-success-400 shadow-md hover:shadow-lg active:shadow-sm',
        danger: 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 active:bg-red-800 dark:active:bg-red-700 text-white focus:ring-red-500 dark:focus:ring-red-400 shadow-md hover:shadow-lg active:shadow-sm',
        outline: 'border-2 border-dominant-300 dark:border-dominant-700 text-dominant-700 dark:text-dominant-300 hover:bg-dominant-50 dark:hover:bg-dominant-800 active:bg-dominant-100 dark:active:bg-dominant-700 focus:ring-dominant-500 dark:focus:ring-dominant-400',
    };

    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
        md: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm',
        lg: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
            {...props}
        >
            <span className="whitespace-nowrap text-center w-full block">{children}</span>
        </button>
    );
};

export default Button;
