'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bell, Plus, Trash2, Search, MapPin, Briefcase } from 'lucide-react';
import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from '@/hooks/useAlerts';
import { EMPLOYMENT_TYPES } from '@/lib/constants';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ConfirmModal from '@/components/shared/ConfirmModal';
import type { EmailAlert } from '@/types';

const alertSchema = z.object({
  keywords: z.string().min(2, 'Enter at least one keyword'),
  city: z.string().min(2, 'City is required'),
  jobType: z.string().min(1, 'Select a job type'),
});

type AlertFormValues = z.infer<typeof alertSchema>;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">No job alerts yet</h3>
      <p className="text-sm text-slate-500 max-w-xs">
        Create alerts and we&apos;ll email you when matching jobs are posted.
      </p>
    </div>
  );
}

function AlertCard({
  alert,
  onToggle,
  onDelete,
  isToggling,
}: {
  alert: EmailAlert;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
}) {
  const empLabel =
    EMPLOYMENT_TYPES.find((e) => e.value === alert.jobType)?.label ?? alert.jobType;

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="mt-0.5 h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <Bell className={`h-4 w-4 ${alert.isActive ? 'text-primary-500' : 'text-slate-400'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-sm font-semibold text-slate-800 truncate">{alert.keywords}</span>
          {alert.isActive ? (
            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500">
              Paused
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {alert.city}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {empLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={alert.isActive}
          onCheckedChange={(checked) => onToggle(alert.id, checked)}
          disabled={isToggling}
          aria-label={alert.isActive ? 'Pause alert' : 'Enable alert'}
        />
        <button
          onClick={() => onDelete(alert.id)}
          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
          aria-label="Delete alert"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: { keywords: '', city: '', jobType: '' },
  });

  function openDialog() {
    form.reset({ keywords: '', city: '', jobType: '' });
    setDialogOpen(true);
  }

  function onSubmit(values: AlertFormValues) {
    createAlert.mutate(values, {
      onSuccess: () => setDialogOpen(false),
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    updateAlert.mutate({ id, isActive });
  }

  function handleDelete(id: string) {
    deleteAlert.mutate(id, {
      onSuccess: () => setDeleteId(null),
    });
  }

  const activeCount = alerts?.filter((a) => a.isActive).length ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Job Alerts"
        subtitle={
          alerts && alerts.length > 0
            ? `${activeCount} active alert${activeCount !== 1 ? 's' : ''} of ${alerts.length}`
            : 'Get notified when matching jobs are posted'
        }
        action={
          <Button onClick={openDialog} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Alert
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={handleToggle}
              onDelete={(id) => setDeleteId(id)}
              isToggling={updateAlert.isPending}
            />
          ))}
        </div>
      )}

      {/* Add Alert Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-500" />
              New Job Alert
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          placeholder="e.g. React Developer, Sales Manager"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input placeholder="e.g. Mumbai, Pune" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={createAlert.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAlert.isPending}>
                  {createAlert.isPending ? 'Creating…' : 'Create Alert'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteId}
        title="Delete alert?"
        description="This alert will be permanently removed and you'll stop receiving notifications for it."
        confirmLabel="Delete"
        confirmVariant="destructive"
        loading={deleteAlert.isPending}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
