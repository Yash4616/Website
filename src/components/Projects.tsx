import { ExternalLink, Github } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'E-Commerce Platform ',
      description: 'A full-stack e-commerce solution with real-time inventory management.',
      image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      title: 'Task Management App',
      description: 'A collaborative task management tool with real-time updates.',
      image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80',
      technologies: ['React', 'Firebase', 'Tailwind'],
      github: 'https://github.com',
      live: 'https://example.com',
    },
    {
      title: 'AI Image Generator',
      description: 'An AI-powered image generation tool using deep learning models.',
      image: 'https://images.unsplash.com/photo-1547954575-855750c57bd3?auto=format&fit=crop&w=800&q=80',
      technologies: ['Python', 'TensorFlow', 'React'],
      github: 'https://github.com',
      live: 'https://example.com',
    },
  ];

  return (
    <section id="projects" className="py-24 bg-gradient-to-b text-gray-300">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
            Featured Upcoming Projects
          </span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.title}
              className="group relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 transition-transform hover:-translate-y-2"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm rounded-full bg-gray-800 text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <Github size={20} />
                    Code
                  </a>
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <ExternalLink size={20} />
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;