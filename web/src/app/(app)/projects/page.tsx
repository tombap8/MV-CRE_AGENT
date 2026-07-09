import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { ProjectCard } from "@/components/ui/project-card";

const STATUSES = [
  { label: "AI Generating", tone: "yellow" as const },
  { label: "Concept Setup", tone: "purple" as const },
  { label: "Needs Review", tone: "coral" as const },
];

const META = ["Modified 2 hours ago", "Last modified 1 day ago", "Last modified 4 hours ago"];

const TITLES = [
  "Synthwave Dreams",
  "BeatSync Promo",
  "Future Funk Visuals",
  "Neon Nights",
  "Project Rooms",
  "Midnight Drive",
  "City Lights",
  "Project Promo",
  "Ocean Echoes",
  "Retro Wave",
  "Golden Hour",
  "After Party",
  "Skyline Dreams",
  "Analog Heart",
  "Fade to Blue",
];

const PROJECTS = TITLES.map((title, i) => ({
  title,
  meta: META[i % META.length],
  status: STATUSES[i % STATUSES.length].label,
  statusTone: STATUSES[i % STATUSES.length].tone,
  variantIndex: i,
}));

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
      <h1 className="text-4xl font-bold text-ink">My Projects</h1>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-full bg-surface px-5 py-3 text-steel lg:max-w-md">
          <SearchIcon className="h-5 w-5" />
          <span className="text-sm">Search projects...</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-hairline-strong px-5 py-3 text-sm font-medium text-ink">
            Sort by Recent
            <ChevronDownIcon />
          </button>
          <button className="flex items-center gap-2 rounded-full border border-hairline-strong px-5 py-3 text-sm font-medium text-ink">
            Filter by Status
            <ChevronDownIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {PROJECTS.map((project, i) => (
          <ProjectCard key={`${project.title}-${i}`} {...project} />
        ))}
      </div>
    </div>
  );
}
