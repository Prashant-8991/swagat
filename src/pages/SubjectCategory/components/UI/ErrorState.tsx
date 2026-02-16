//@ts-nocheck
interface ErrorStateProps {
 message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900">
 <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl shadow-sm">
 <div className="text-6xl mb-4">⚠️</div>
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
 Failed to Load Data
 </h2>
 <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
 {message}
 </p>
 <button
 onClick={() => window.location.reload()}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 Reload Page
 </button>
 </div>
 </div>
 );
}
