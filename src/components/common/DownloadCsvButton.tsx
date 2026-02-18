//@ts-nocheck
import { Download } from "lucide-react";
import { motion } from "framer-motion";

interface DownloadCsvButtonProps {
    onClick: () => void;
}

export default function DownloadCsvButton({ onClick }: DownloadCsvButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            title="Download CSV"
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/40 transition-all duration-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            style={{ lineHeight: 0 }}
        >
            <Download size={16} strokeWidth={1.8} />
        </motion.button>
    );
}
