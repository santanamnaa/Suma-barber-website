'use client'
import { submitApplicationHandler as submitFormWorkWithUs } from '../api/submit-application'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// --- 1) Define separate schemas ---
const jobSchema = z.object({
  name: z.string().min(2, 'Minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  position: z.enum(['senior-barber', 'junior-barber'], {
    errorMap: () => ({ message: 'Pilih posisi' }),
  }),
  experience: z.string().min(10, 'Ceritakan pengalaman Anda (min 10 karakter)'),
})

const collabSchema = z.object({
  name: z.string().min(2, 'Minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  opportunityType: z.enum(
    ['franchise', 'collaboration', 'product', 'event', 'sponsorship'],
    { errorMap: () => ({ message: 'Pilih jenis kesempatan' }) }
  ),
  company: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
})

type JobForm   = z.infer<typeof jobSchema>
type CollabForm = z.infer<typeof collabSchema>

export default function WorkWithUs() {
  const [tab, setTab] = useState<'job' | 'collab'>('job')
  const [loading, setLoading] = useState(false)

  // two separate forms
  const jobForm = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: { name: '', email: '', phone: '', position: '', experience: '' },
  })

  const collabForm = useForm<CollabForm>({
    resolver: zodResolver(collabSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      opportunityType: '',
      company: '',
      message: '',
    },
  })



  async function onSubmit(data: JobForm | CollabForm) {
    setLoading(true)
    try {
      const payload = { ...data, type: tab }
      const res = await fetch(submitFormWorkWithUs, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Network response was not ok')
      toast.success('Berhasil dikirim!')
      tab === 'job' ? jobForm.reset() : collabForm.reset()
    } catch (err) {
      console.error(err)
      toast.error('Gagal kirim, coba lagi.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-xl">
        <h1 className="text-4xl font-bold text-center mb-6">Work With Us</h1>

        {/* Tab Switch */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={tab === 'job' ? 'default' : 'outline'}
            onClick={() => setTab('job')}
          >
            I Want to Work
          </Button>
          <Button
            variant={tab === 'collab' ? 'default' : 'outline'}
            onClick={() => setTab('collab')}
          >
            I Want to Collaborate
          </Button>
        </div>

        {/* Job Application Form */}
        {tab === 'job' && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
            <Form {...jobForm}>
              <form
                onSubmit={jobForm.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/** Name */}
                <FormField
                  control={jobForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/** Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={jobForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/** Position */}
                <FormField
                  control={jobForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Posisi</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih posisi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="senior-barber">
                              Senior Barber
                            </SelectItem>
                            <SelectItem value="junior-barber">
                              Junior Barber
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/** Experience */}
                <FormField
                  control={jobForm.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pengalaman Anda</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ceritakan pengalaman Anda..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Mengirim...' : 'Kirim Lamaran'}
                </Button>
              </form>
            </Form>
          </Card>
        )}

        {/* Collaboration Form */}
        {tab === 'collab' && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Business Opportunities
            </h2>
            <Form {...collabForm}>
              <form
                onSubmit={collabForm.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/** Name */}
                <FormField
                  control={collabForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kontak</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/** Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={collabForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={collabForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telepon</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/** Opportunity Type */}
                <FormField
                  control={collabForm.control}
                  name="opportunityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kesempatan</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="franchise">
                              Franchise Partnership
                            </SelectItem>
                            <SelectItem value="collaboration">
                              Brand Collaboration
                            </SelectItem>
                            <SelectItem value="product">
                              Product Partnership
                            </SelectItem>
                            <SelectItem value="event">
                              Event Sponsorship
                            </SelectItem>
                            <SelectItem value="sponsorship">
                              Sponsorship
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/** Company */}
                <FormField
                  control={collabForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perusahaan / Organisasi</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama perusahaan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/** Message */}
                <FormField
                  control={collabForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pesan / Rincian</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ceritakan kebutuhan Anda..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading
                    ? 'Mengirim...'
                    : 'Kirim Permintaan Kerja Sama'}
                </Button>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </div>
  )
}
