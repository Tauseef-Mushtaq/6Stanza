import { Container } from "@/components/ui/Container";
import { Loader } from "@/components/ui/Loader";

/**
 * Module 10A — public route loading foundation (spec §12). Sibling
 * to `src/app/admin/loading.tsx` (Module 7A, kept as-is): that one
 * uses skeleton blocks suited to admin list/detail pages, this one is
 * a generic centered spinner suited to the varied public routes under
 * `(site)`. Page-specific skeletons for individual routes are
 * deferred to Module 10B.
 */
export default function SiteLoading() {
  return (
    <Container className="flex min-h-[60svh] items-center justify-center">
      <Loader label="Loading…" size="lg" />
    </Container>
  );
}
