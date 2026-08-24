-- SEO-4 — additive column only (spec §19: "do not break the existing
-- schema"). Adds a real, queryable article → service relationship
-- (spec §16/§17 "Internal Linking System" / "Article → Service
-- Connection") instead of faking it as untyped body text, which the
-- existing InsightBlock union has no link/href shape for.
--
-- Nullable, no default: every insight published before this module
-- (and any future editorial/opinion piece with no natural service
-- tie-in) simply has no related service — never fabricated (spec
-- §18 "do not create a fake link").
--
-- `on delete set null`: if a service is ever deleted, the article
-- doesn't break or cascade-delete — it just loses the CTA, matching
-- how `media_path` failures already degrade gracefully elsewhere in
-- this schema.

alter table public.insights
  add column related_service_slug text references public.services (slug) on delete set null;

comment on column public.insights.related_service_slug is 'Optional FK to services.slug — powers the "Related Service" CTA on the article detail page (SEO-4 spec §17). Null means no natural service tie-in; never fabricated.';
