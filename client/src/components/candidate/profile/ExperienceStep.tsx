'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { experienceSchema, type ExperienceInput } from '@/lib/validations';
import { EMPLOYMENT_TYPES } from '@/lib/constants';
import {
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
} from '@/hooks/useCandidate';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ConfirmModal from '@/components/shared/ConfirmModal';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import type { Candidate, Experience } from '@/types';

interface Props {
  candidate: Candidate | null;
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
  saving?: boolean;
}

const EMPTY_FORM = {
  jobTitle: '',
  companyName: '',
  city: '',
  employmentType: undefined as ExperienceInput['employmentType'],
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
} satisfies ExperienceInput;

export default function ExperienceStep({ candidate, onNext, onBack, saving }: Props) {
  const [isFresher, setIsFresher] = useState(candidate?.isFresher ?? false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Experience | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addExp = useAddExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();

  const form = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: EMPTY_FORM,
  });

  const isCurrent = form.watch('isCurrent');

  const openAdd = () => {
    form.reset(EMPTY_FORM);
    setEditItem(null);
    setDialogOpen(true);
  };

  const openEdit = (exp: Experience) => {
    form.reset({
      jobTitle: exp.jobTitle,
      companyName: exp.companyName,
      city: exp.city ?? '',
      employmentType: exp.employmentType ?? undefined,
      startDate: exp.startDate.split('T')[0],
      endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
      isCurrent: exp.isCurrent,
      description: exp.description ?? '',
    });
    setEditItem(exp);
    setDialogOpen(true);
  };

  const onSubmitDialog = async (data: ExperienceInput) => {
    const payload = {
      ...data,
      endDate: data.isCurrent ? undefined : data.endDate || undefined,
    };
    if (editItem) {
      await updateExp.mutateAsync({ id: editItem.id, data: payload });
    } else {
      await addExp.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const experiences = candidate?.experiences ?? [];
  const isSaving = addExp.isPending || updateExp.isPending;

  return (
    <div className="space-y-4">
      {/* Fresher toggle */}
      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-blue-50 border border-blue-100">
        <Switch
          id="fresher-toggle"
          checked={isFresher}
          onCheckedChange={setIsFresher}
        />
        <Label htmlFor="fresher-toggle" className="cursor-pointer text-sm font-medium text-blue-800">
          I am a fresher (no work experience)
        </Label>
      </div>

      {!isFresher && (
        <>
          {experiences.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No experience added yet"
              description="Add your work history to help employers understand your background."
            />
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{exp.jobTitle}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {exp.companyName}
                      {exp.city ? ` · ${exp.city}` : ''}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(exp.startDate)} –{' '}
                      {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEdit(exp)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteId(exp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Experience
          </Button>
        </>
      )}

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => onNext({ isFresher })}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save & Continue'}
        </Button>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitDialog)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sales Executive" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pune" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" disabled={isCurrent} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isCurrent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      I currently work here
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe your role and responsibilities…"
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving…' : editItem ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteExp.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Delete Experience"
        description="Remove this experience entry? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteExp.isPending}
      />
    </div>
  );
}
