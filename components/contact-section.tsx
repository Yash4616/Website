"use client"

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { Mail, MapPin, Send, Clock } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
})

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      // console.log(values) // Unnecessary console log for later use
      setIsSubmitting(false)
      form.reset()
      toast.success('Message sent successfully! I will get back to you soon.')
    }, 1500)
  }

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Get In Touch</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or want to work together? Feel free to reach out!
            <br />
            (Doesn't work just mail me)
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-3 rounded-full text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="mt-1 text-muted-foreground">
                    <a href="mailto:yashgurjar9714@gmail.com" className="hover:text-primary transition-colors">
                      yashgurjar9714@gmail.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    For general inquiries and opportunities(works)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-3 rounded-full text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Location</h3>
                  <p className="mt-1 text-muted-foreground">
                    Jaipur, Rajasthan, India
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available for remote work worldwide
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-3 rounded-full text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Availability</h3>
                  <p className="mt-1 text-muted-foreground">
                    Open to new opportunities
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Response time: Within 12-24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="What is this regarding?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your message here..." 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Sending message...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}