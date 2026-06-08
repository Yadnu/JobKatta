'use client';

import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { JOB_CATEGORIES, EMPLOYMENT_TYPES, INDIAN_STATES } from '@/lib/constants';
import type { JobPostInput } from '@/lib/validations';

interface Props {
  control: Control<JobPostInput>;
  onNext: () => void;
}

export default function JobDetailsStep({ control, onNext }: Props) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Job Title <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g. Senior Sales Executive" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-64">
                  {JOB_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Employment Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((et) => (
                    <SelectItem key={et.value} value={et.value}>
                      {et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                City <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Mumbai" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                State <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-64">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="pincode"
        render={({ field }) => (
          <FormItem className="max-w-[200px]">
            <FormLabel>Pincode</FormLabel>
            <FormControl>
              <Input placeholder="6-digit pincode" maxLength={6} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isRemote"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div>
              <Label className="font-medium cursor-pointer">Remote / Work from home</Label>
              <p className="text-xs text-slate-500">Candidates can work from any location</p>
            </div>
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <Button type="button" onClick={onNext}>
          Next: Description
        </Button>
      </div>
    </div>
  );
}
