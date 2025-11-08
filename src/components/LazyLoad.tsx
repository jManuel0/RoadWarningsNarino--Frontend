import { Suspense, lazy, ComponentType } from 'react';
import LoadingSpinner from './LoadingSpinner';


export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
}