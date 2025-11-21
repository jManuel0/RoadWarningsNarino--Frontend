import { Suspense, lazy, ComponentType } from "react";
import LoadingSpinner from "./LoadingSpinner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
