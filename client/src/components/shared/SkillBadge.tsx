import { cn } from '@/lib/utils';

interface Props {
  name: string;
  className?: string;
  onRemove?: () => void;
}

export default function SkillBadge({ name, className, onRemove }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100',
        className
      )}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full text-blue-500 hover:text-blue-700 focus:outline-none"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
