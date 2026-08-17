export interface RouteConfig {
  label: string;
  href: string;
}

/**
 * Single source of truth for primary navigation. Later modules should
 * read from here rather than hard-coding links in the header/footer,
 * so adding/renaming a route only happens in one place.
 */
export const primaryNav: RouteConfig[] = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Team", href: "/team" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export const ctaRoute: RouteConfig = { label: "Start a Project", href: "/start-project" };
