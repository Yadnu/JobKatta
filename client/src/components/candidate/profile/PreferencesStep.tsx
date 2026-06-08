'use client';

import { useState } from 'react';
import { EMPLOYMENT_TYPES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Candidate } from '@/types';

interface Props {
  candidate: Candidate | null;
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
  saving?: boolean;
}

export default function PreferencesStep({ candidate, onNext, onBack, saving }: Props) {
  const [preferredRoles, setPreferredRoles] = useState(candidate?.preferredRoles ?? '');
  const [preferredCities, setPreferredCities] = useState(candidate?.preferredCities ?? '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    candidate?.preferredEmpType
      ? candidate.preferredEmpType.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [salaryMin, setSalaryMin] = useState(candidate?.expectedSalaryMin?.toString() ?? '');
  const [salaryMax, setSalaryMax] = useState(candidate?.expectedSalaryMax?.toString() ?? '');
  const [openToWork, setOpenToWork] = useState(candidate?.openToWork ?? true);

  const toggleEmpType = (value: string) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    onNext({
      preferredRoles: preferredRoles || undefined,
      preferredCities: preferredCities || undefined,
      preferredEmpType: selectedTypes.length > 0 ? selectedTypes.join(', ') : undefined,
      expectedSalaryMin: salaryMin ? Number(salaryMin) : undefined,
      expectedSalaryMax: salaryMax ? Number(salaryMax) : undefined,
      openToWork,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="pref-roles" className="text-sm font-medium">
          Preferred Job Roles
        </Label>
        <Input
          id="pref-roles"
          className="mt-1.5"
          placeholder="e.g. Sales Executive, BDE, Customer Support"
          value={preferredRoles}
          onChange={(e) => setPreferredRoles(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">Separate multiple roles with commas.</p>
      </div>

      <div>
        <Label htmlFor="pref-cities" className="text-sm font-medium">
          Preferred Cities
        </Label>
        <Input
          id="pref-cities"
          className="mt-1.5"
          placeholder="e.g. Mumbai, Pune, Nashik"
          value={preferredCities}
          onChange={(e) => setPreferredCities(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">Separate multiple cities with commas.</p>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Preferred Employment Type</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {EMPLOYMENT_TYPES.map((t) => (
            <div key={t.value} className="flex items-center gap-2">
              <Checkbox
                id={`emp-${t.value}`}
                checked={selectedTypes.includes(t.value)}
                onCheckedChange={() => toggleEmpType(t.value)}
              />
              <Label htmlFor={`emp-${t.value}`} className="font-normal cursor-pointer text-sm">
                {t.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sal-min" className="text-sm font-medium">
            Expected Salary Min (₹/month)
          </Label>
          <Input
            id="sal-min"
            type="number"
            min={0}
            step={1000}
            className="mt-1.5"
            placeholder="e.g. 15000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sal-max" className="text-sm font-medium">
            Expected Salary Max (₹/month)
          </Label>
          <Input
            id="sal-max"
            type="number"
            min={0}
            step={1000}
            className="mt-1.5"
            placeholder="e.g. 30000"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
        <div>
          <p className="text-sm font-medium text-slate-800">Open to Work</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Let employers know you are actively looking for a job.
          </p>
        </div>
        <Switch checked={openToWork} onCheckedChange={setOpenToWork} />
      </div>

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Finish Setup'}
        </Button>
      </div>
    </div>
  );
}
