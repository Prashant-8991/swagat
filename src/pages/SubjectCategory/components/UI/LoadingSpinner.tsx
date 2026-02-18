//@ts-nocheck
import CustomLoader from '../../../../components/common/CustomLoader';

export default function LoadingSpinner() {
 return (
 <div className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900">
 <CustomLoader />
 </div>
 );
}
