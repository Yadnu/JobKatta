import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, pages, onPageChange, className }: Props) {
  if (pages <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

    const result: (number | '...')[] = [1];
    if (page > 3) result.push('...');

    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    for (let i = start; i <= end; i++) result.push(i);

    if (page < pages - 2) result.push('...');
    result.push(pages);
    return result;
  };

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="h-8 w-8 p-0"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-slate-400">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p as number)}
            className="h-8 w-8 p-0"
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="h-8 w-8 p-0"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
