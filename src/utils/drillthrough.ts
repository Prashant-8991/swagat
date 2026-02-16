//@ts-nocheck
import { DrillThroughFilters } from '../redux/features/drillthroughSlice';

export interface DrillThroughContext extends Partial<DrillThroughFilters> {
  sourcePage?: string;
}

export function buildDrillThroughUrl(context: DrillThroughContext): string {
  const params = new URLSearchParams();
  Object.entries(context).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else {
        params.set(key, String(value));
      }
    }
  });
  
  return `/drill-down?${params.toString()}`;
}

export function getDrillThroughFilters(): DrillThroughContext | null {
  const params = new URLSearchParams(window.location.search);
  const urlFilters: DrillThroughContext = {};
  
  if (params.get('district')) urlFilters.district = params.get('district')!;
  if (params.get('taluka')) urlFilters.taluka = params.get('taluka')!;
  if (params.get('departmentName')) urlFilters.departmentName = params.get('departmentName')!;
  if (params.get('disposeChannel')) urlFilters.disposeChannel = params.get('disposeChannel')!;
  if (params.get('subjectCategory')) urlFilters.subjectCategory = params.get('subjectCategory')!;
  if (params.get('grievanceStatus')) urlFilters.grievanceStatus = params.get('grievanceStatus')!;
  
  const programTypes = params.getAll('programTypes');
  if (programTypes.length > 0) urlFilters.programTypes = programTypes;
  
  if (params.get('escalatedByCitizen')) urlFilters.escalatedByCitizen = params.get('escalatedByCitizen')!;
  if (params.get('IsReviewed')) urlFilters.IsReviewed = parseInt(params.get('IsReviewed')!);
  if (params.get('aiCategory')) urlFilters.aiCategory = params.get('aiCategory')!;
  if (params.get('levelNo')) urlFilters.levelNo = parseInt(params.get('levelNo')!);
  if (params.get('month')) urlFilters.month = params.get('month')!;
  if (params.get('subject')) urlFilters.subject = params.get('subject')!;
  if (params.get('forwardedToDesignation')) urlFilters.forwardedToDesignation = params.get('forwardedToDesignation')!;
  if (params.get('sourcePage')) urlFilters.sourcePage = params.get('sourcePage')!;
  if (params.get('grievanceReviewType')) urlFilters.grievanceReviewType = params.get('grievanceReviewType')!;
  if (params.get('subStatusName')) urlFilters.subStatusName = params.get('subStatusName')!;
  
  return Object.keys(urlFilters).length > 0 ? urlFilters : null;
}

export function clearDrillThroughFilters() {
  return '/drill-down';
}