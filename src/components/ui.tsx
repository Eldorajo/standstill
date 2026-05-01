import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90',
    secondary: 'bg-elev text-ink hover:bg-elev/80 border border-border',
    ghost: 'text-ink hover:bg-elev/50'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 text-base'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-lg border border-border bg-elev px-3 py-2 text-sm placeholder:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-lg border border-border bg-elev px-3 py-2 text-sm placeholder:text-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`flex h-10 w-full rounded-lg border border-border bg-elev px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  hint?: string
}

export const Label: React.FC<LabelProps> = ({ children, hint, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
        {children}
      </label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`neu-card p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'low' | 'med' | 'high' | 'accent'
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-elev text-ink border-border',
    low: 'bg-risk-low/20 text-risk-low border-risk-low/30',
    med: 'bg-risk-med/20 text-risk-med border-risk-med/30',
    high: 'bg-risk-high/20 text-risk-high border-risk-high/30',
    accent: 'bg-accent/20 text-accent border-accent/30'
  }
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />
}