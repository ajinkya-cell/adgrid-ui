import { ArrowUpRight, Bug } from "lucide-react";

const githubIssueUrl = "https://github.com/ajinkya-cell/adgrid-ui/issues/new";

export default function IssuesPage() {
  return (
    <main className="flex min-h-screen justify-center bg-[#09090b] px-4 pb-24 pt-28 font-inter text-neutral-300 sm:px-6 sm:pt-32">
      <section className="w-full max-w-xl space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-neutral-500">
            <Bug className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>AdGrid UI / Issues</span>
          </div>
          <h1 className="font-inter text-2xl font-semibold text-white sm:text-3xl">
            Report a bug
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            Tell us what went wrong and we’ll prepare a GitHub issue draft for you.
          </p>
        </header>

        <form
          action={githubIssueUrl}
          method="GET"
          target="_blank"
          rel="noopener noreferrer"
          className="site-bevel-panel space-y-5 rounded-2xl p-5 sm:p-6"
        >
          <div className="space-y-2">
            <label htmlFor="issue-title" className="block text-sm font-medium text-neutral-200">
              Title
            </label>
            <input
              id="issue-title"
              name="title"
              type="text"
              required
              placeholder="What is broken?"
              className="site-recessed-well w-full rounded-xl px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="issue-body" className="block text-sm font-medium text-neutral-200">
              Description
            </label>
            <textarea
              id="issue-body"
              name="body"
              required
              rows={6}
              placeholder="What did you expect to happen, and what happened instead?"
              className="site-recessed-well w-full resize-y rounded-xl px-3.5 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/20 focus-visible:ring-2 focus-visible:ring-white/20"
            />
          </div>

          <p className="text-xs leading-relaxed text-neutral-500">
            GitHub opens with your report as a draft. Review and submit it there; submitted issues are public.
          </p>

          <button
            type="submit"
            className="site-raised-action inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Continue to GitHub
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
