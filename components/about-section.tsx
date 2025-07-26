import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FaBrain, FaCode, FaDna, FaFlask, FaGraduationCap, FaLightbulb } from 'react-icons/fa'

interface StrengthProps {
  icon: React.ReactNode
  title: string
  description: string
}

function Strength({ icon, title, description }: StrengthProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          {/* Image and education column */}
          <div className="md:w-2/5">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Image 
                src="/myimage.jpg" 
                alt="Yash Gurjar"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>

            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaGraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Education</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">B.Tech - CSE Specialization (AI & ML IBM)</h4>
                      <Badge variant="outline">2023-2027</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">JECRC University</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">High School</h4>
                      <Badge variant="outline">2009-2022</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Alwar Public School</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio and strengths column */}
          <div className="md:w-3/5">
            <h2 className="text-3xl font-bold tracking-tight">About Me</h2>
            <p className="mt-6 text-lg leading-relaxed">
              I'm an AI and ML Engineer passionate about tackling complex challenges through innovative
              algorithms and advanced deep learning architectures. Though early in my career, I've 
              contributed to diverse projects spanning computer vision applications and natural language
              processing solutions.
            </p>
            
            <p className="mt-4 leading-relaxed text-muted-foreground">
              My fascination with AI began during my undergraduate studies, where I discovered the 
              potential of machines to mimic human intelligence. This inspired me to specialize in 
              deep learning for computer vision, launching my professional journey in the field.
            </p>
            
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Today, I focus on expanding AI's frontiers by contributing to open-source initiatives 
              and keeping pace with cutting-edge machine learning research. I'm especially drawn to 
              practical applications that drive positive societal impact.
            </p>

            <h3 className="mt-10 text-xl font-semibold">Key Strengths</h3>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Strength 
                icon={<FaBrain className="h-5 w-5" />}
                title="Deep Learning Expert"
                description="Specialized in neural networks and advanced ML architectures"
              />
              <Strength 
                icon={<FaCode className="h-5 w-5" />}
                title="Production-Ready Code"
                description="Writing clean, efficient, and maintainable code for real-world deployment"
              />
              <Strength 
                icon={<FaDna className="h-5 w-5" />}
                title="Research-Oriented"
                description="Continuously exploring new techniques and staying current with research"
              />
              <Strength 
                icon={<FaLightbulb className="h-5 w-5" />}
                title="Problem Solver"
                description="Breaking down complex problems into actionable solutions"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}