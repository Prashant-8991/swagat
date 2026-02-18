//@ts-nocheck
import PageMeta from "../../components/common/PageMeta";
import OverviewComponent from "./OverviewComponent";

export default function OverviewPage() {
 return (
 <>
 <PageMeta
 title="Grievance Overview Dashboard | Swagat Analytics"
 description="Comprehensive grievance analytics dashboard with KPIs, cross-filtering, and interactive visualizations for districts, departments, channels, and statuses"
 />
 <OverviewComponent />
 </>
 );
}
