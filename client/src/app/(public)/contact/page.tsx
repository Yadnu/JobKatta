'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import api from '@/lib/api';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactInput = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    try {
      await api.post('/support/ticket', { subject: data.subject, message: `From: ${data.name} <${data.email}>\n\n${data.message}` });
      setSubmitted(true);
      toast.success('Message sent! We'll get back to you within 24 hours.');
    } catch {
      toast.error('Failed to send. Please email us directly at support@jobkatta.in');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-slate-500">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-slate-800">Get in Touch</h2>
              {[
                { icon: Mail, label: 'Email', value: 'support@jobkatta.in', href: 'mailto:support@jobkatta.in' },
                { icon: Phone, label: 'Phone', value: '+91 88888 88888', href: 'tel:+918888888888' },
                { icon: MapPin, label: 'Address', value: 'Pune, Maharashtra, India', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-medium text-slate-700 hover:text-blue-600">{value}</a>
                    ) : (
                      <p className="text-sm font-medium text-slate-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-2">Business Hours</h3>
              <p className="text-sm text-slate-500">Monday – Saturday</p>
              <p className="text-sm font-medium text-slate-700">9:00 AM – 6:00 PM IST</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <Send className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">Message Sent!</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl><Input placeholder="What's this about?" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us how we can help…" rows={5} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full gap-2" disabled={form.formState.isSubmitting}>
                      <Send className="h-4 w-4" />
                      {form.formState.isSubmitting ? 'Sending…' : 'Send Message'}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
