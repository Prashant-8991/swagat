//@ts-nocheck
import { motion } from 'framer-motion';

export const CustomLoader = () => {
    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center z-50"
            style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f5f0ea 50%, #ede5da 100%)' }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="skeleton-loader"
            />
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 text-sm font-medium text-gray-400 tracking-wide"
            >
                Loading...
            </motion.p>
        </div>
    );
};

export default CustomLoader;
