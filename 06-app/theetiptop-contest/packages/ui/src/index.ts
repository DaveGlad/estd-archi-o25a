/**
 * Design system shared by the public site (`apps/web`) and the back office
 * (`apps/admin`).
 *
 * The split into two Next.js applications is the decision recorded in
 * `DECISIONS.md` § 3 — a separate back office means a smaller attack surface on the
 * public site and genuinely distinct rights. That split only works if the two
 * applications look like one product, which is what this package is for: the tokens, the
 * primitives and the charts live here, so a change to the brand reaches both.
 *
 * Prefer the **subpath imports** over this barrel at call sites:
 *
 *     import { Card } from '@theetiptop-contest/ui/card';
 *
 * rather than
 *
 *     import { Card } from '@theetiptop-contest/ui';
 *
 * The reason is the client/server boundary. Several of these modules are client
 * components (`'use client'`) and `recharts` alone is a sizeable dependency; importing
 * through the barrel pulls the whole graph into whichever bundle touches it. The barrel
 * is kept because a barrel-free package is awkward to discover, not because it is the
 * recommended path.
 */

// Primitives
export * from './ui/alert';
export * from './ui/badge';
export * from './ui/bar';
export * from './ui/button';
export * from './ui/card';
export * from './ui/chart';
export * from './ui/field';
export * from './ui/input';
export * from './ui/prize-status';
export * from './ui/skeleton';
export * from './ui/stat';
export * from './ui/table';

// Layout
export * from './layout/container';
export * from './layout/logo';
export * from './layout/ornaments';
export * from './layout/theme-toggle';

// Charts
export * from './charts/age-chart';
export * from './charts/gender-chart';
export * from './charts/participation-chart';
export * from './charts/prize-chart';
export * from './charts/store-chart';

// Formatting helpers
export * from './lib/utils';
