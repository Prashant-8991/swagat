// @ts-nocheck
import CustomLoader from "../../components/common/CustomLoader";
import PageMeta from "../../components/common/PageMeta";
import { lazy, Suspense } from "react";

const LazySubjectCategory = lazy(() => import("./SubjectCategory"));


export default function SubjectCategoryPage() {
 return (
 <>
 <PageMeta
 title="Grievance Overview Dashboard | Swagat Analytics"
 description="Comprehensive grievance analytics dashboard with KPIs, cross-filtering, and interactive visualizations for districts, departments, channels, and statuses"
 />
 <Suspense fallback={<div>Loading...</div>}>
 <LazySubjectCategory />
 </Suspense>
 </>
 );
}
