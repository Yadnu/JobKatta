import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  completion: number;
  setupHref?: string;
  className?: string;
}

export default function ProfileCompletionBanner({ completion, setupHref = '/candidate/profile/setup', className }: Props) {
  const pct = Math.min(100, Math.max(0, completion));

  if (pct >= 80) return null;

  return (
    <div className={cn('rounded-xl border border-amber-200 bg-amber-50 p-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">
            Your profile is {pct}% complete
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            Complete your profile to unlock more job applications and stand out to employers.
          </p>
          <div className="mt-2">
            <Progress
              value={pct}
              className="h-2 bg-amber-200 [&>div]:bg-amber-500"
            />
          </div>
        </div>
        <Button asChild size="sm" className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white border-0">
          <Link href={setupHref}>Complete Profile</Link>
        </Button>
      </div>
    </div>
  );
}
