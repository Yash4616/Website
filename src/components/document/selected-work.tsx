import { orderedProjects } from '@/data/config';
import { ProjectEntry } from '@/components/document/project-entry';

export function SelectedWork() {
  let figureCursor = 1;

  return (
    <>
      {orderedProjects.map((project, index) => {
        const start = figureCursor;
        figureCursor += project.figures.length;
        return <ProjectEntry key={project.id} project={project} index={index + 1} figureStart={start} />;
      })}
    </>
  );
}

export default SelectedWork;
