<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application structure
- Legacy storefront HTML is served through raw-import TanStack routes; preserve its checkout integration when changing presentation.
- Public asset compaction lives only in the build layer: preserve global handler names, exclude backup/map copies from deployment, and never treat shortcut interception as authorization.
- Content routes use pageHead for unique metadata; legacy HTML responses retain their embedded document head.

- UTMify "paid" reports pass through enviarPedidoParaUtmify, which checks app_settings key utmify_track_paid (default on); keep all UTMify sends going through it so the admin switch applies everywhere.
- Live visitors use realtime presence channel "site-presence" via public/js/presence-tracker.js, which must point at this project's backend.
