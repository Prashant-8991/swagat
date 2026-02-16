//@ts-nocheck
interface EmptyStateProps {
  icon: string;
  message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
}
