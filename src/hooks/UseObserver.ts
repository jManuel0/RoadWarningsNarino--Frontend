import { useEffect, useRef } from "react";

export interface Observer<T> {
  update: (data: T) => void;
}

export interface Subject<T> {
  attach: (observer: Observer<T>) => void;
  detach: (observer: Observer<T>) => void;
  notify: (data: T) => void;
}

export class ObserverSubject<T> implements Subject<T> {
  private readonly observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: T): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}

export function useObserver<T>(
  subject: Subject<T> | undefined,
  callback: (data: T) => void
) {
  const observerRef = useRef<Observer<T>>({
    update: callback,
  });

  useEffect(() => {
    observerRef.current.update = callback;
  }, [callback]);

  useEffect(() => {
    if (!subject) return; // 👈 evita subject.attach cuando es undefined

    const observer = observerRef.current;
    subject.attach(observer);

    return () => {
      subject.detach(observer);
    };
  }, [subject]);
}
