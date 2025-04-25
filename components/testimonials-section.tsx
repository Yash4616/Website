// "use client"

// import { useState, useEffect, useCallback } from 'react'
// import Image from 'next/image'
// import { Card } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa'

// const testimonials = [
//   {
//     id: 1,
//     name: 'Dr. Sarah Johnson',
//     role: 'Professor of AI, Stanford University',
//     testimonial: "Yash is one of the most talented AI researchers I have had the pleasure of mentoring. His work on neural network architectures for medical imaging analysis was truly innovative.",
//     image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//   },
//   {
//     id: 2,
//     name: 'Alex Rodriguez',
//     role: 'CTO, TechNova AI',
//     testimonial: 'Yash has consistently delivered exceptional results at TechNova. His deep understanding of machine learning principles combined with practical implementation skills makes him a valuable asset to any team.',
//     image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//   },
//   {
//     id: 3,
//     name: 'Emily Chang',
//     role: 'Lead Data Scientist, DataMinds Inc.',
//     testimonial: 'Working with Yash was a great experience. His attention to detail and ability to tackle complex ML problems is impressive. The NLP models he developed are still core to our product today.',
//     image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//   },
//   {
//     id: 4,
//     name: 'Michael Wei',
//     role: 'Research Collaborator, MIT',
//     testimonial: 'Yash\'s contributions to our joint research paper were invaluable. His insights and technical expertise in reinforcement learning significantly strengthened our methodology and results.',
//     image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
//   }
// ]

// export default function TestimonialsSection() {
//   const [activeIndex, setActiveIndex] = useState(0)
  
//   const nextTestimonial = useCallback(() => {
//     setActiveIndex((prev) => (prev + 1) % testimonials.length)
//   }, [])
  
//   const prevTestimonial = useCallback(() => {
//     setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
//   }, [])

//   useEffect(() => {
//     // Auto-scroll testimonials
//     const interval = setInterval(() => {
//       nextTestimonial()
//     }, 8000)
    
//     return () => clearInterval(interval)
//   }, [nextTestimonial])

//   return (
//     <section id="testimonials" className="py-16 md:py-24 bg-muted/30">
//       <div className="container px-4">
//         <div className="max-w-3xl mx-auto text-center mb-12">
//           <h2 className="text-3xl font-bold tracking-tight">What People Say</h2>
//           <p className="mt-4 text-lg text-muted-foreground">
//             Feedback from colleagues, mentors, and collaborators
//           </p>
//         </div>

//         <div className="max-w-4xl mx-auto relative">
//           <div className="absolute z-0 top-8 left-8 text-primary/10">
//             <FaQuoteLeft className="h-24 w-24" />
//           </div>

//           <Card className="relative z-10 bg-card/80 backdrop-blur-sm shadow-sm border rounded-lg p-6 md:p-8">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <div className="md:col-span-1 flex flex-col items-center">
//                 <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-background">
//                   <Image 
//                     src={testimonials[activeIndex].image} 
//                     alt={testimonials[activeIndex].name}
//                     fill
//                     style={{ objectFit: 'cover' }}
//                     sizes="96px"
//                   />
//                 </div>
//                 <div className="mt-4 text-center">
//                   <h3 className="font-semibold text-lg">{testimonials[activeIndex].name}</h3>
//                   <p className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</p>
//                 </div>
//               </div>
              
//               <div className="md:col-span-2 flex flex-col justify-center">
//                 <p className="text-lg italic leading-relaxed">
//                   "{testimonials[activeIndex].testimonial}"
//                 </p>
//               </div>
//             </div>
            
//             <div className="mt-8 flex justify-center gap-4">
//               <Button 
//                 variant="outline" 
//                 size="icon" 
//                 className="rounded-full"
//                 onClick={prevTestimonial}
//               >
//                 <FaChevronLeft className="h-5 w-5" />
//                 <span className="sr-only">Previous testimonial</span>
//               </Button>
//               <div className="flex gap-2">
//                 {testimonials.map((_, i) => (
//                   <button
//                     key={i}
//                     className={`w-2.5 h-2.5 rounded-full transition-colors ${
//                       i === activeIndex ? 'bg-primary' : 'bg-primary/20'
//                     }`}
//                     onClick={() => setActiveIndex(i)}
//                   />
//                 ))}
//               </div>
//               <Button 
//                 variant="outline" 
//                 size="icon" 
//                 className="rounded-full"
//                 onClick={nextTestimonial}
//               >
//                 <FaChevronRight className="h-5 w-5" />
//                 <span className="sr-only">Next testimonial</span>
//               </Button>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </section>
//   )
// }