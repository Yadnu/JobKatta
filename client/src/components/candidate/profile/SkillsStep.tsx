'use client';

import { useState, useCallback } from 'react';
import { ChevronsUpDown, Search } from 'lucide-react';
import { useSkills } from '@/hooks/useJobs';
import { useUpdateSkills } from '@/hooks/useCandidate';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import SkillBadge from '@/components/shared/SkillBadge';
import type { Candidate, Skill } from '@/types';

interface Props {
  candidate: Candidate | null;
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export default function SkillsStep({ candidate, onNext, onBack }: Props) {
  const initialSkills: Skill[] = (candidate?.skills ?? []).map((cs) => cs.skill);
  const [selected, setSelected] = useState<Skill[]>(initialSkills);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { data: allSkills = [], isLoading } = useSkills();
  const updateSkills = useUpdateSkills();

  const toggle = useCallback(
    (skill: Skill) => {
      setSelected((prev) =>
        prev.some((s) => s.id === skill.id)
          ? prev.filter((s) => s.id !== skill.id)
          : [...prev, skill]
      );
    },
    []
  );

  const removeSkill = (id: string) => setSelected((prev) => prev.filter((s) => s.id !== id));

  const handleNext = async () => {
    if (selected.length > 0) {
      await updateSkills.mutateAsync(selected.map((s) => s.id));
    }
    onNext({});
  };

  const availableSkills = allSkills.filter(
    (sk) => !selected.some((s) => s.id === sk.id)
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-600 mb-3">
          Select skills that best represent your expertise. Employers filter candidates by skills.
        </p>

        {/* Skill combobox */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
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
                {isLoading ? (
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
                            toggle(skill);
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
      </div>

      {/* Selected skills */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          Selected skills ({selected.length})
        </p>
        {selected.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No skills selected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <SkillBadge
                key={skill.id}
                name={skill.name}
                onRemove={() => removeSkill(skill.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={updateSkills.isPending}
        >
          {updateSkills.isPending
            ? 'Saving…'
            : selected.length === 0
            ? 'Skip & Continue'
            : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
