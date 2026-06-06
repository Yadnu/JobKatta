import { LucideIcon, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon = SearchX, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 bg-primary-500 hover:bg-primary-600">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
