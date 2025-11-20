import { render, screen } from '@testing-library/react';
import {
  SkeletonCard,
  SkeletonAlertCard,
  SkeletonList,
  SkeletonMap,
  SkeletonStats,
  SkeletonProfile,
  SkeletonTable,
  SkeletonForm,
  SkeletonChart,
  SkeletonNavigation,
} from './SkeletonLoader';

describe('SkeletonLoader components', () => {
  describe('SkeletonCard', () => {
    it('renders skeleton card', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders with custom count', () => {
      const { container } = render(<SkeletonCard count={3} />);
      const cards = container.querySelectorAll('.animate-pulse');
      expect(cards).toHaveLength(3);
    });
  });

  describe('SkeletonAlertCard', () => {
    it('renders skeleton alert card', () => {
      const { container } = render(<SkeletonAlertCard />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders with custom count', () => {
      const { container } = render(<SkeletonAlertCard count={5} />);
      const cards = container.querySelectorAll('.animate-pulse');
      expect(cards).toHaveLength(5);
    });
  });

  describe('SkeletonList', () => {
    it('renders skeleton list with default items', () => {
      const { container } = render(<SkeletonList />);
      const items = container.querySelectorAll('.animate-pulse > div');
      expect(items.length).toBeGreaterThan(0);
    });

    it('renders with custom item count', () => {
      const { container } = render(<SkeletonList items={3} />);
      const items = container.querySelectorAll('.animate-pulse > div');
      expect(items).toHaveLength(3);
    });
  });

  describe('SkeletonMap', () => {
    it('renders skeleton map', () => {
      const { container } = render(<SkeletonMap />);
      expect(container.firstChild).toHaveClass('animate-pulse');
      expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
    });

    it('renders with custom height', () => {
      const { container } = render(<SkeletonMap height="500px" />);
      const mapContainer = container.querySelector('div[style*="500px"]');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  describe('SkeletonStats', () => {
    it('renders skeleton stats', () => {
      const { container } = render(<SkeletonStats />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders with custom count', () => {
      const { container } = render(<SkeletonStats count={4} />);
      const stats = container.querySelectorAll('.animate-pulse > div');
      expect(stats).toHaveLength(4);
    });
  });

  describe('SkeletonProfile', () => {
    it('renders skeleton profile', () => {
      const { container } = render(<SkeletonProfile />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });

  describe('SkeletonTable', () => {
    it('renders skeleton table with default rows', () => {
      const { container } = render(<SkeletonTable />);
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders with custom row count', () => {
      const { container } = render(<SkeletonTable rows={10} />);
      const tableRows = container.querySelectorAll('tbody tr');
      expect(tableRows).toHaveLength(10);
    });

    it('renders with custom column count', () => {
      const { container } = render(<SkeletonTable columns={5} />);
      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells).toHaveLength(5);
    });
  });

  describe('SkeletonForm', () => {
    it('renders skeleton form', () => {
      const { container } = render(<SkeletonForm />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders with custom field count', () => {
      const { container } = render(<SkeletonForm fields={6} />);
      const fields = container.querySelectorAll('.animate-pulse > div');
      expect(fields).toHaveLength(6);
    });
  });

  describe('SkeletonChart', () => {
    it('renders skeleton chart', () => {
      const { container } = render(<SkeletonChart />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders with custom height', () => {
      const { container } = render(<SkeletonChart height="400px" />);
      const chart = container.querySelector('div[style*="400px"]');
      expect(chart).toBeInTheDocument();
    });
  });

  describe('SkeletonNavigation', () => {
    it('renders skeleton navigation', () => {
      const { container } = render(<SkeletonNavigation />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('renders with custom item count', () => {
      const { container } = render(<SkeletonNavigation items={7} />);
      const items = container.querySelectorAll('.animate-pulse > div > div');
      expect(items).toHaveLength(7);
    });
  });
});
