import { render } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAlertCard,
  SkeletonList,
  SkeletonMap,
  SkeletonTable,
  SkeletonChart,
  PageLoadingSkeleton,
} from './SkeletonLoader';

describe('SkeletonLoader components', () => {
  describe('Skeleton', () => {
    it('renders skeleton with default styles', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('SkeletonText', () => {
    it('renders default number of lines', () => {
      const { container } = render(<SkeletonText />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines.length).toBeGreaterThan(0);
    });

    it('renders custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(5);
    });
  });

  describe('SkeletonCard', () => {
    it('renders skeleton card', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('SkeletonAlertCard', () => {
    it('renders skeleton alert card', () => {
      const { container } = render(<SkeletonAlertCard />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('SkeletonList', () => {
    it('renders skeleton list with default items', () => {
      const { container } = render(<SkeletonList />);
      const items = container.querySelectorAll('.animate-pulse');
      expect(items.length).toBeGreaterThan(0);
    });

    it('renders with custom item count', () => {
      const { container } = render(<SkeletonList items={3} />);
      const listItems = container.querySelectorAll('.rounded-lg');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('SkeletonMap', () => {
    it('renders skeleton map', () => {
      const { container } = render(<SkeletonMap />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('SkeletonTable', () => {
    it('renders skeleton table with default rows', () => {
      const { container } = render(<SkeletonTable />);
      expect(container.querySelector('.space-y-2')).toBeInTheDocument();
    });

    it('renders with custom row count', () => {
      const { container } = render(<SkeletonTable rows={10} />);
      const rows = container.querySelectorAll('.animate-pulse');
      expect(rows.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('SkeletonChart', () => {
    it('renders skeleton chart', () => {
      const { container } = render(<SkeletonChart />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('PageLoadingSkeleton', () => {
    it('renders page loading skeleton', () => {
      const { container } = render(<PageLoadingSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
