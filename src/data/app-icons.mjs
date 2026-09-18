import icons from "./app-icons.json" with { type: "json" };

// Immutable asset URLs change whenever an approved source icon changes.
export function appIconSrc(slug) {
  return `/assets/apps/${slug}/${icons[slug]?.file ?? "icon.webp"}`;
}
