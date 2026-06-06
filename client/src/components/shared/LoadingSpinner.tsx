import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

const sizeMap = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-3', lg: 'h-12 w-12 border-4' };

export default function LoadingSpinner({ size = 'md', className, fullPage }: Props) {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-primary-500 border-t-transparent',
        sizeMap[size],
        className
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
