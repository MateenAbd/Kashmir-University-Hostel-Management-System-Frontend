import React from 'react';
import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  };

  return (
    <div className={cn('flex items-center gap-2 font-bold text-primary', sizeClasses[size], className)}>
      <Building size={iconSizes[size]} className="text-primary" />
      <span className="bg-gradient-primary bg-clip-text text-transparent">
        NC Hostel
      </span>
    </div>
  );
};

export default Logo;