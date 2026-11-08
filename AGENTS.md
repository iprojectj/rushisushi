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
- Keep the root shell and blank index as the minimal application baseline; the previous presell, admin page, redirect configuration, and branding were deliberately removed for a fresh start.

- UTMify "paid" reports pass through enviarPedidoParaUtmify, which checks app_settings key utmify_track_paid (default on); keep all UTMify sends going through it so the admin switch applies everywhere.
- Live visitors use realtime presence channel "site-presence" via public/js/presence-tracker.js, which must point at this project's backend.
