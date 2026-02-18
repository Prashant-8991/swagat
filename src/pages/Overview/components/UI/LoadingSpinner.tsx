//@ts-nocheck
import CustomLoader from '../../../../components/common/CustomLoader';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f5f0ea 50%, #ede5da 100%)' }}>
            <CustomLoader />
        </div>
    );
}