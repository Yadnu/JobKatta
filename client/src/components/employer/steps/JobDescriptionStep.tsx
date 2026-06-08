'use client';

import { Control, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { JobPostInput } from '@/lib/validations';

interface Props {
  control: Control<JobPostInput>;
  onNext: () => void;
  onBack: () => void;
}

export default function JobDescriptionStep({ control, onNext, onBack }: Props) {
  const description = useWatch({ control, name: 'description' });
  const charCount = description?.length ?? 0;

  return (
    <div className="space-y-5">
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Job Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the role, responsibilities, and what a typical day looks like…"
                className="min-h-[160px] resize-y"
                {...field}
              />
            </FormControl>
            <div className="flex items-start justify-between gap-2">
              <FormMessage />
              <span
                className={cn(
                  'text-xs shrink-0 ml-auto',
                  charCount < 100 ? 'text-amber-500 font-medium' : 'text-slate-400'
                )}
              >
                {charCount} / 100 min chars
              </span>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List the skills, qualifications, and experience required…"
                className="min-h-[120px] resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="hiringProcess"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hiring Process</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g. Phone screening → Technical test → HR interview → Offer"
                className="min-h-[80px] resize-y"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Optional: explain your recruitment steps so candidates know what to expect.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Preferences
        </Button>
      </div>
    </div>
  );
}
