import { Code, Terminal, Palette, Brain } from 'lucide-react';
import SkillCard from './SkillCard';

const skills = [
  {
    icon: Code,
    title: 'Frontend',
    skills: ['React', 'TypeScript', 'Tailwind'],
  },
  // {
  //   icon: Terminal,
  //   title: 'Backend',
  //   skills: ['Node.js', 'Python', 'PostgreSQL'],
  // },
  {
    icon: Brain,
    title: 'AI & ML',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn'],
  },
  {
    icon: Palette,
    title: 'Tools & Skills',
    skills: ['Linux', 'Docker', 'Github'],
  },
];

const SkillsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {skills.map((skill) => (
      <SkillCard key={skill.title} {...skill} />
    ))}
  </div>
);

export default SkillsGrid;