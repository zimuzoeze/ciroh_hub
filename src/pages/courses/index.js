import React, { useCallback, useMemo, useState } from "react";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";
import { ConstellationCanvas } from '@site/src/components/ConstellationCanvas';
import Layout from '@theme/Layout';
import TechBox from "@site/src/components/TechBox";
import HydroLearnLogo from '@site/static/img/logos/hydrolearn_logo.png';
import HydroShareLogo from '@site/static/img/logos/hydroshare-white.png';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Header from "@site/src/components/Header";
import { useColorMode } from '@docusaurus/theme-common';
import LMLightIcon from '@site/static/img/cards/modules_light.png';
import LMDarkIcon from '@site/static/img/cards/modules_dark.png';

const items = [
  {
    lightIcon: HydroLearnLogo,
    darkIcon: HydroLearnLogo,
    alt: 'HydroLearn',
    name: 'HydroLearn',
    href: 'https://www.hydrolearn.org/',
  },
  {
    lightIcon: HydroShareLogo,
    darkIcon: HydroShareLogo,
    alt: 'HydroShare',
    name: 'HydroShare',
    href: 'https://www.hydroshare.org/',
  },
];

export default function CoursesPage() {
  const contributeUrl = useBaseUrl('/contribute?current-contribution=courses');
  const docsUrl = useBaseUrl('/docs/products/intro');

  return (
    <Layout title="Courses" description="CIROH Courses">
      <CoursesPageContent
        contributeUrl={contributeUrl}
        docsUrl={docsUrl}
      />
    </Layout>
  );
}

function CoursesPageContent({ contributeUrl, docsUrl }) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === 'dark';
  const defaultImage = colorMode === 'dark' ? LMDarkIcon : LMLightIcon;

  const [courses, setCourses] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const onResultsChange = useCallback((results, meta) => {
    setCourses(results);
    setStatsLoading(Boolean(meta?.loading));
  }, []);

  const stats = useMemo(() => {
    const totalCourses = courses.length;

    const categories = new Set(
      courses.map(c => c?.resource_type).filter(Boolean)
    ).size;

    const contributors = (() => {
      const set = new Set();
      for (const course of courses) {
        const authors = typeof course?.authors === 'string' ? course.authors : '';
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
      for (const course of courses) {
        const d = course?.date_last_updated ? new Date(course.date_last_updated) : null;
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

    return { totalCourses, categories, contributors, lastUpdated };
  }, [courses]);

  return (
    <>
      {/* Hero */}
      <section className="tw-relative tw-z-20 tw-overflow-hidden tw-pb-8">
        <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-overflow-hidden" style={{ zIndex: 0 }}>
          <ConstellationCanvas isDarkTheme={isDarkTheme} />
        </div>
      <div className="margin-top--lg">
        <Header 
            title="Courses" 
            tagline="Access a range of open courses in hydrology, enriched with CIROH and NOAA research, designed for learners at all levels seeking to deepen their understanding of water science."
            buttons={[
                { label: "Add your Apps", href: contributeUrl, primary: true },
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
                {statsLoading ? <span className="statsLoadingText">...</span> : stats.totalCourses}
              </div>
              <div className="tw-mt-1 tw-text-xs sm:tw-text-sm tw-text-slate-600 dark:tw-text-slate-300">Total Courses</div>
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
          keyword="nwm_portal_module,ciroh_hub_module"
          defaultImage={defaultImage}
          variant="modern"
          onResultsChange={onResultsChange}
        />

        <div className="tw-pb-16">
          <TechBox items={items} type={"Courses"} />
        </div>
      </main>
    </>
  );
}
