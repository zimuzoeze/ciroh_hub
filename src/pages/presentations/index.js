import React, { useCallback, useMemo, useState } from "react";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Header from "@site/src/components/Header";
import { useColorMode } from '@docusaurus/theme-common';

const items = [
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
    name: 'HydroShare',
    href: 'https://hydroshare.org/',
  },
];

export default function PresentationsPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=presentations');
  const docsUrl = useBaseUrl('/docs/products/intro');

  return (
    <Layout title="Presentations" description="CIROH Presentations">
      <PresentationsPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
      />
    </Layout>
  );
}

function PresentationsPageContent({ contributeUrl, docsUrl }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';

  const [presentations, setPresentations] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setPresentations(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => {
    const totalPresentations = presentations.length;

    const categories = new Set(
      presentations.map(p => p?.resource_type).filter(Boolean)
    ).size;

    const contributors = (() => {
      const set = new Set();
      for (const presentation of presentations) {
        const authors = typeof presentation?.authors === 'string' ? presentation.authors : '';
        authors
          .split('🖊️')
          .map(a => a.trim())
          .filter(Boolean)
          .forEach(a => set.add(a));
      }
      return set.size;
    })();

    const lastUpdated = (() => {
      let latest = null;
      for (const presentation of presentations) {
        const d = presentation?.date_last_updated ? new Date(presentation.date_last_updated) : null;
        if (!d || Number.isNaN(d.getTime())) continue;
        if (!latest || d > latest) latest = d;
      }
      if (!latest) return '—';
      try {
        return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(latest);
      } catch {
        return latest.toISOString().slice(0, 10);
      }
    })();

    return { totalPresentations, categories, contributors, lastUpdated };
  }, [presentations]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
      <div className="margin-top--lg">
        <Header 
            title="Presentations" 
            tagline="Presentations and workshops regarding CIROH and NOAA&apos;s hydrologic research, offering cutting-edge insights into the latest tools and advances in hydrology."
            buttons={[
                { label: "Add your Presentation", href: contributeUrl, primary: true },
                { label: "Browse Documentation", href: docsUrl }
              ]}
        />
      </div>

      </section>

      {/* Stats */}
      <div className="tw-relative tw-z-20 tw-border-y tw-border-slate-200/70 dark:tw-border-slate-700/70 tw-bg-white/60 dark:tw-bg-slate-950 tw-backdrop-blur">
        <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-6">
          <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6">
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading ? <span className="statsLoadingText">...</span> : stats.totalPresentations}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Total Presentations</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading ? <span className="statsLoadingText">...</span> : stats.categories}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Categories</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading ? <span className="statsLoadingText">...</span> : stats.contributors}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Contributors</div>
            </div>
            <div className="tw-text-center">
              <div className="tw-text-2xl sm:tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">
                {statsLoading ? <span className="statsLoadingText">...</span> : stats.lastUpdated}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Latest Update</div>
            </div>
          </div>
        </div>
      </div>

      <main className="tw-relative tw-z-20">
        <HydroShareResourcesSelector
          keyword="ciroh_portal_presentation,ciroh_hub_presentation"
          defaultImage="https://ciroh-portal-static-data.s3.us-east-1.amazonaws.com/presentation_placeholder.png"
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Presentations"} />
        </div>
      </main>
    </>
  );
}
