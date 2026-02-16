import "./bootstrap.min.css";
import styles from "./styles.module.css";

import ExploreFeature from './ExploreFeature';
import FeedbackFeature from './FeedbackFeature';
import ResearchFeature from './ResearchFeature';
import TestimonialGallery from './TestimonialGallery';
import TeamGallery from './TeamGallery';
import OrgGallery from './OrgGallery';
import OfficeHoursFeature from "./OfficeHoursFeature";

export default function HomepageFeatures() {
  
  return (
    <>
      <section className={styles.homepageContainer}>
        
        <ExploreFeature />
        <ResearchFeature />
        <TeamGallery />
        <FeedbackFeature />
        <TestimonialGallery />
        <OfficeHoursFeature />
        <OrgGallery />

      </section>
    </>
  );
}