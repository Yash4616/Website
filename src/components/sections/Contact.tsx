import { Mail, MapPin, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ContactSection() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      primary: 'yashgurjar9714@gmail.com',
      secondary: 'For inquiries and opportunities',
      href: 'mailto:yashgurjar9714@gmail.com?subject=Portfolio%20Inquiry',
      action: 'Send Email',
    },
    {
      icon: MapPin,
      title: 'Location',
      primary: 'Jaipur, Rajasthan, India',
      secondary: 'Available for remote work worldwide',
    },
    {
      icon: Clock,
      title: 'Availability',
      primary: 'Open to new opportunities',
      secondary: 'Response time: Within 12-24 hours',
    },
  ]

  return (
    <section id="contact" className="py-16 md:py-24 w-full">
      <div className="container">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Get In Touch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or want to work together? I&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((item) => (
            <Card
              key={item.title}
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
            >
              <CardContent className="p-6 text-center">
                {/* Icon */}
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>

                {item.href ? (
                  <a
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors font-medium block mb-1"
                  >
                    {item.primary}
                  </a>
                ) : (
                  <p className="text-foreground font-medium mb-1">{item.primary}</p>
                )}

                <p className="text-sm text-muted-foreground">{item.secondary}</p>

                {/* Action Button */}
                {item.action && item.href && (
                  <Button
                    asChild
                    className="mt-4"
                    size="sm"
                  >
                    <a href={item.href}>
                      <Mail className="mr-2 h-4 w-4" />
                      {item.action}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-2xl mx-auto text-center mt-12">
          <p className="text-muted-foreground">
            Prefer email? Reach out directly at{' '}
            <a
              href="mailto:yashgurjar9714@gmail.com?subject=Portfolio%20Inquiry"
              className="text-primary hover:underline font-medium"
            >
              yashgurjar9714@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}