// import { Badge } from '@/components/ui/badge'
// import { FaBriefcase } from 'react-icons/fa'
// import { cn } from '@/lib/utils'

// const experiences = [
//   {
//     id: 1,
//     position: 'Senior AI Engineer',
//     company: 'TechNova AI',
//     duration: 'Jan 2022 - Present',
//     description: 'Leading development of computer vision solutions for autonomous systems',
//     achievements: [
//       'Improved object detection accuracy by 15% using custom model architecture',
//       'Reduced inference time by 40% through model optimization and quantization',
//       'Mentored a team of 5 junior engineers in deep learning best practices'
//     ]
//   },
//   {
//     id: 2,
//     position: 'Machine Learning Engineer',
//     company: 'DataMinds Inc.',
//     duration: 'Mar 2020 - Dec 2021',
//     description: 'Developed and deployed NLP models for text analysis and classification',
//     achievements: [
//       'Built and deployed a sentiment analysis API serving 1M+ requests per day',
//       'Implemented transformer-based models improving accuracy by 12%',
//       'Presented research findings at two international ML conferences'
//     ]
//   },
//   {
//     id: 3,
//     position: 'AI Research Intern',
//     company: 'Stanford AI Lab',
//     duration: 'May 2019 - Feb 2020',
//     description: 'Researched novel computer vision techniques for medical imaging analysis',
//     achievements: [
//       'Published paper on efficient segmentation of medical images',
//       'Developed open-source library for medical image preprocessing',
//       'Collaborated with radiologists to validate model outputs'
//     ]
//   },
//   {
//     id: 4,
//     position: 'Software Engineering Intern',
//     company: 'Global Tech Solutions',
//     duration: 'Jun 2018 - Aug 2018',
//     description: 'Contributed to full-stack web applications with focus on data visualization',
//     achievements: [
//       'Implemented interactive dashboards for data visualization using D3.js',
//       'Developed RESTful APIs for data processing and retrieval',
//       'Optimized database queries improving load time by 35%'
//     ]
//   }
// ]

// export default function ExperienceSection() {
//   return (
//     <section id="experience" className="py-16 md:py-24">
//       <div className="container px-4">
//         <div className="max-w-3xl mx-auto text-center mb-12">
//           <h2 className="text-3xl font-bold tracking-tight">Work Experience</h2>
//           <p className="mt-4 text-lg text-muted-foreground">
//             My professional journey in AI, machine learning, and software development
//           </p>
//         </div>

//         <div className="max-w-4xl mx-auto mt-12 relative">
//           {/* Timeline vertical line */}
//           <div className="absolute top-0 left-[15px] md:left-1/2 md:-ml-0.5 w-1 h-full bg-border rounded" />

//           {/* Experience items */}
//           <div className="space-y-12">
//             {experiences.map((experience, index) => (
//               <div key={experience.id} className="relative z-10">
//                 <div className={cn(
//                   "flex flex-col md:flex-row gap-4 md:gap-8",
//                   index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
//                 )}>
//                   {/* Timeline dot */}
//                   <div className="absolute top-0 left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-sm">
//                     <FaBriefcase className="h-4 w-4 text-primary" />
//                   </div>

//                   {/* Content */}
//                   <div className={cn(
//                     "ml-12 md:ml-0 md:w-1/2",
//                     index % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8"
//                   )}>
//                     <div className="bg-card shadow-sm border rounded-lg p-6">
//                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
//                         <h3 className="font-semibold text-lg">{experience.position}</h3>
//                         <Badge variant="outline">{experience.duration}</Badge>
//                       </div>
                      
//                       <p className="font-medium text-primary">{experience.company}</p>
//                       <p className="mt-2 text-muted-foreground">{experience.description}</p>
                      
//                       <div className="mt-4">
//                         <h4 className="text-sm font-semibold mb-2">Key Achievements:</h4>
//                         <ul className="space-y-1 text-sm list-disc pl-4">
//                           {experience.achievements.map((achievement, i) => (
//                             <li key={i}>{achievement}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }