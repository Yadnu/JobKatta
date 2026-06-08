'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { educationSchema, type EducationInput } from '@/lib/validations';
import {
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import ConfirmModal from '@/components/shared/ConfirmModal';
import EmptyState from '@/components/shared/EmptyState';
import type { Candidate, Education } from '@/types';

interface Props {
  candidate: Candidate | null;
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

const EMPTY_FORM = {
  degree: '',
  institution: '',
  fieldOfStudy: '',
  board: '',
  percentage: undefined as number | undefined,
  startYear: new Date().getFullYear() - 4,
  endYear: undefined as number | undefined,
  isCurrently: false,
} satisfies EducationInput;

export default function EducationStep({ candidate, onNext, onBack }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Education | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addEdu = useAddEducation();
  const updateEdu = useUpdateEducation();
  const deleteEdu = useDeleteEducation();

  const form = useForm<EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: EMPTY_FORM,
  });

  const isCurrently = form.watch('isCurrently');

  const openAdd = () => {
    form.reset(EMPTY_FORM);
    setEditItem(null);
    setDialogOpen(true);
  };

  const openEdit = (edu: Education) => {
    form.reset({
      degree: edu.degree,
      institution: edu.institution,
      fieldOfStudy: edu.fieldOfStudy ?? '',
      board: edu.board ?? '',
      percentage: edu.percentage ?? undefined,
      startYear: edu.startYear,
      endYear: edu.endYear ?? undefined,
      isCurrently: edu.isCurrently,
    });
    setEditItem(edu);
    setDialogOpen(true);
  };

  const onSubmitDialog = async (data: EducationInput) => {
    const payload = {
      ...data,
      percentage: data.percentage != null ? Number(data.percentage) : undefined,
      startYear: Number(data.startYear),
      endYear: data.isCurrently ? undefined : (data.endYear != null ? Number(data.endYear) : undefined),
    };
    if (editItem) {
      await updateEdu.mutateAsync({ id: editItem.id, data: payload });
    } else {
      await addEdu.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const educations = candidate?.educations ?? [];
  const isSaving = addEdu.isPending || updateEdu.isPending;

  return (
    <div className="space-y-4">
      {educations.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education added yet"
          description="Add your degrees, diplomas, or school qualifications."
        />
      ) : (
        <div className="space-y-3">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-slate-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800 text-sm">
                  {edu.degree}
                  {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {edu.institution}
                  {edu.board ? ` · ${edu.board}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {edu.startYear} – {edu.isCurrently ? 'Present' : edu.endYear ?? ''}
                  {edu.percentage ? ` · ${edu.percentage}%` : ''}
                </p>
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => openEdit(edu)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteId(edu.id)}
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
        Add Education
      </Button>

      <div className="flex justify-between pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={() => onNext({})}>
          {educations.length === 0 ? 'Skip & Continue' : 'Continue'}
        </Button>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Education' : 'Add Education'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitDialog)} className="space-y-3">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree / Level <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. B.Tech, 12th Grade, MBA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science, Commerce" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="School or college name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="board"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board / University</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CBSE, Mumbai University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Year <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1980}
                          max={new Date().getFullYear()}
                          placeholder="2018"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1980}
                          max={new Date().getFullYear() + 5}
                          placeholder="2022"
                          disabled={isCurrently}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          placeholder="75"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isCurrently"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Currently studying here
                    </FormLabel>
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
          if (deleteId) deleteEdu.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Delete Education"
        description="Remove this education entry? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteEdu.isPending}
      />
    </div>
  );
}
