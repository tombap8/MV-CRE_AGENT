import { LinkButton } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";

const RECENT_PROJECTS = [
  { title: "Project Title 1", status: "Editing Timeline" },
  { title: "Project Title 2", status: "Editing Timeline" },
  { title: "Project Title 3", status: "Editing Timeline" },
  { title: "Project Title 3", status: "Editing Timeline" },
  { title: "Project Video 4", status: "Editing Timeline" },
  { title: "Project Title 5", status: "Editing Timeline" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col items-center justify-center gap-6 rounded-xxl bg-brand-yellow px-8 py-16 text-center">
          <span className="text-4xl leading-none text-ink">+</span>
          <h2 className="text-4xl font-bold leading-tight text-ink">
            Start New
            <br />
            Project
          </h2>
          <LinkButton href="/projects/new" variant="primary">
            Get Started
          </LinkButton>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold text-ink">Recent Projects</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {RECENT_PROJECTS.map((project, i) => (
              <ProjectCard
                key={`${project.title}-${i}`}
                title={project.title}
                status={project.status}
                variantIndex={i % 3}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xxl bg-primary px-8 py-6">
        <span className="text-lg font-semibold text-on-primary">
          Call to-action strip
        </span>
        <LinkButton href="/projects/new" variant="onDark">
          Get Started
        </LinkButton>
      </div>
    </div>
  );
}
