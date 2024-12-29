import { LucideIcon } from 'lucide-react';

interface SkillCardProps {
  icon: LucideIcon;
  title: string;
  skills: string[];
}

const SkillCard = ({ icon: Icon, title, skills }: SkillCardProps) => (
  <div className="p-6 rounded-lg bg-gradient-to-b from-gray-900/50 to-gray-950 border border-gray-800/50">
    <div className="text-blue-500 mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-300">{title}</h3>
    <ul className="text-gray-400">
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  </div>
)

export default SkillCard;