import { LightBulbIcon } from '@heroicons/react/24/outline';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse">
          <LightBulbIcon className="w-8 h-8 text-stone-900" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 blur-xl opacity-50 animate-pulse" />
      </div>
      <p className="text-stone-400 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="py-24 flex items-center justify-center">
      {content}
    </div>
  );
}
