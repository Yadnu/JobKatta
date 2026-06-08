'use client';

import { useEffect, useRef, useState } from 'react';
import { Control, useController, useWatch } from 'react-hook-form';
import { ChevronsUpDown, Search } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SkillBadge from '@/components/shared/SkillBadge';
import { useSkills } from '@/hooks/useJobs';
import { SHIFT_TIMINGS } from '@/lib/constants';
import type { JobPostInput } from '@/lib/validations';
import type { Skill } from '@/types';

interface Props {
  control: Control<JobPostInput>;
  onNext: () => void;
  onBack: () => void;
}

export default function JobPreferencesStep({ control, onNext, onBack }: Props) {
  const hideSalary = useWatch({ control, name: 'hideSalary' });
  const isSalaryNegotiable = useWatch({ control, name: 'isSalaryNegotiable' });

  const { field: skillsField } = useController({ control, name: 'skills' });
  const { data: allSkills = [], isLoading: skillsLoading } = useSkills();

  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const initializedRef = useRef(false);

  // On edit mode: initialize selectedSkills from the form's existing skill IDs
  useEffect(() => {
    if (!initializedRef.current && allSkills.length > 0 && skillsField.value?.length > 0) {
      setSelectedSkills(allSkills.filter((s) => skillsField.value.includes(s.id)));
      initializedRef.current = true;
    }
  }, [allSkills, skillsField.value]);

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((prev) => {
      const next = prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill];
      skillsField.onChange(next.map((s) => s.id));
      return next;
    });
  };

  const removeSkill = (id: string) => {
    setSelectedSkills((prev) => {
      const next = prev.filter((s) => s.id !== id);
      skillsField.onChange(next.map((s) => s.id));
      return next;
    });
  };

  const availableSkills = allSkills.filter(
    (sk) => !selectedSkills.some((s) => s.id === sk.id)
  );

  return (
    <div className="space-y-5">
      {/* Salary */}
      <div className="space-y-3 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700">Salary</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <FormField
            control={control}
            name="hideSalary"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <Label className="font-normal cursor-pointer text-sm">Hide salary from candidates</Label>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="isSalaryNegotiable"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={hideSalary}
                  />
                </FormControl>
                <Label className="font-normal cursor-pointer text-sm">Salary negotiable</Label>
              </FormItem>
            )}
          />
        </div>

        {!hideSalary && !isSalaryNegotiable && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="salaryMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Salary (₹/month)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 15000"
                      min={0}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="salaryMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Salary (₹/month)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 25000"
                      min={0}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="openings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Number of Openings <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  value={field.value ?? 1}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? 1 : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Qualification</FormLabel>
              <FormControl>
                <Input placeholder="e.g. B.Com / 12th Pass / Any Graduate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="experienceMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Experience (years)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? 0}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="experienceMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Experience (years)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Leave blank for any"
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="shiftTiming"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Timing</FormLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SHIFT_TIMINGS.map((s) => (
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
        <FormField
          control={control}
          name="applicationDeadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Deadline</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">
            Required Skills <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-slate-500 mt-0.5">
            Add skills to help match your job with the right candidates.
          </p>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpen}
              className="w-full justify-between font-normal text-slate-500"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                Search and add skills…
              </span>
              <ChevronsUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Type a skill name…" />
              <CommandList>
                {skillsLoading ? (
                  <div className="py-6 text-center text-sm text-slate-500">Loading skills…</div>
                ) : (
                  <>
                    <CommandEmpty>No skills found.</CommandEmpty>
                    <CommandGroup>
                      {availableSkills.map((skill) => (
                        <CommandItem
                          key={skill.id}
                          value={skill.name}
                          onSelect={() => {
                            toggleSkill(skill);
                            setPopoverOpen(false);
                          }}
                        >
                          {skill.name}
                          {skill.category && (
                            <span className="ml-auto text-xs text-slate-400">{skill.category}</span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">
            Selected skills ({selectedSkills.length})
          </p>
          {selectedSkills.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No skills selected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <SkillBadge key={skill.id} name={skill.name} onRemove={() => removeSkill(skill.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Show zod error for skills if triggered */}
        <FormField
          control={control}
          name="skills"
          render={() => (
            <FormItem className="mt-0">
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Review
        </Button>
      </div>
    </div>
  );
}
