//@ts-nocheck
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; // 1. Import useLocation
import { useEffect } from 'react'; // 2. Import useEffect
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { Navigate } from "react-router-dom";
import SessionWatcher from "./components/SessionWatcher";
import { SessionProvider } from "./context/SessionContext";

import { lazy, Suspense } from 'react';
import SearchQueryPage from "./components/common/SearchQueryPage";
import CustomLoader from "./components/common/CustomLoader";
import SubjectCategoryPage from "./pages/SubjectCategory";

const LazyDrillThroughComponent = lazy(() => import("./pages/DrillThrough/DrillThroughComponent"));
const LazyPositiveDispose = lazy(() => import('./pages/PositiveDispose'));
const LazyLevelWise = lazy(() => import('./pages/LevelWise'));
const LazyEscalated = lazy(() => import('./pages/Escalated'));
const LazyOverview = lazy(() => import('./pages/Overview'));
const LazyReviewed = lazy(() => import("./pages/Reviewed"));



export default function App() {
    return (
        <>
            {/* <Router basename="/Swagat_AI/"> */}
            <Router basename={import.meta.env.VITE_BASE_NAME}>

                {/* SessionProvider wraps everything to provide session context */}
                <SessionProvider>

                    {/* SessionWatcher handles the popup modal */}
                    <SessionWatcher />

                    <ScrollToTop />
                    <Suspense fallback={<CustomLoader />}>
                        <Routes>
                            <Route path="/" element={<Navigate to="dashboard" replace />} />
                            <Route element={<AppLayout />}>
                                <Route index path="/" element={
                                    <LazyOverview />
                                } />
                                <Route path="/overview" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <LazyOverview />
                                    </Suspense>
                                </>} />
                                <Route path="/subject-category" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <SubjectCategoryPage />
                                    </Suspense>
                                </>} />
                                <Route path="/level-wise-designation-analysis" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <LazyLevelWise />
                                    </Suspense>
                                </>} />
                                <Route path="/disposed-grievance" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <LazyPositiveDispose />
                                    </Suspense>
                                </>} />
                                <Route path="/escalated-by-citizen" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <LazyEscalated />
                                    </Suspense>
                                </>} />
                                <Route path="/drill-down" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <LazyDrillThroughComponent />
                                    </Suspense>
                                </>} />
                                <Route path="/reviewed" element={<>
                                    <Suspense fallback={<CustomLoader />}>
                                        <LazyReviewed />
                                    </Suspense>
                                </>} />
                                <Route path="/search/:searchQuery"
                                    element={
                                        <SearchQueryPage />
                                    }
                                />
                            </Route>
                            {/* <Route path="*" element={<NotFound />} /> */}
                        </Routes>
                    </Suspense>

                </SessionProvider>

            </Router>
        </>
    );
}