import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState, {
  NoAlertsEmptyState,
  NoSearchResultsEmptyState,
  NoNotificationsEmptyState,
  NoFavoritesEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
  NoDataEmptyState,
  LoadingEmptyState,
  UnauthorizedEmptyState,
} from './EmptyState';
import { AlertTriangle } from 'lucide-react';

describe('EmptyState components', () => {
  describe('EmptyState', () => {
    it('renders with title and description', () => {
      render(
        <EmptyState
          icon={<AlertTriangle />}
          title="No data"
          description="There is no data to display"
        />
      );

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('There is no data to display')).toBeInTheDocument();
    });

    it('renders action button when provided', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <EmptyState
          icon={<AlertTriangle />}
          title="No data"
          action={{
            label: 'Add data',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole('button', { name: /add data/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies info variant styles', () => {
      const { container } = render(
        <EmptyState
          icon={<AlertTriangle />}
          title="Info"
          variant="info"
        />
      );

      expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
    });

    it('applies error variant styles', () => {
      const { container } = render(
        <EmptyState
          icon={<AlertTriangle />}
          title="Error"
          variant="error"
        />
      );

      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });
  });

  describe('NoAlertsEmptyState', () => {
    it('renders no alerts message', () => {
      render(<NoAlertsEmptyState />);

      expect(screen.getByText(/no hay alertas/i)).toBeInTheDocument();
    });

    it('renders create alert button when handler provided', async () => {
      const handleCreate = jest.fn();
      const user = userEvent.setup();

      render(<NoAlertsEmptyState onCreateAlert={handleCreate} />);

      const button = screen.getByRole('button', { name: /crear alerta/i });
      await user.click(button);

      expect(handleCreate).toHaveBeenCalledTimes(1);
    });

    it('does not render button when no handler', () => {
      render(<NoAlertsEmptyState />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('NoSearchResultsEmptyState', () => {
    it('renders no search results message', () => {
      render(<NoSearchResultsEmptyState searchTerm="accident" />);

      expect(screen.getByText(/no se encontraron resultados/i)).toBeInTheDocument();
      expect(screen.getByText(/accident/i)).toBeInTheDocument();
    });

    it('renders clear search button when handler provided', async () => {
      const handleClear = jest.fn();
      const user = userEvent.setup();

      render(
        <NoSearchResultsEmptyState
          searchTerm="test"
          onClearSearch={handleClear}
        />
      );

      const button = screen.getByRole('button', { name: /limpiar búsqueda/i });
      await user.click(button);

      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('NoNotificationsEmptyState', () => {
    it('renders no notifications message', () => {
      render(<NoNotificationsEmptyState />);

      expect(screen.getByText(/no tienes notificaciones/i)).toBeInTheDocument();
    });
  });

  describe('NoFavoritesEmptyState', () => {
    it('renders no favorites message', () => {
      render(<NoFavoritesEmptyState />);

      expect(screen.getByText(/no tienes favoritos/i)).toBeInTheDocument();
    });

    it('renders explore button when handler provided', async () => {
      const handleExplore = jest.fn();
      const user = userEvent.setup();

      render(<NoFavoritesEmptyState onExplore={handleExplore} />);

      const button = screen.getByRole('button', { name: /explorar/i });
      await user.click(button);

      expect(handleExplore).toHaveBeenCalledTimes(1);
    });
  });

  describe('ErrorEmptyState', () => {
    it('renders error message', () => {
      render(<ErrorEmptyState message="Something went wrong" />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('renders retry button when handler provided', async () => {
      const handleRetry = jest.fn();
      const user = userEvent.setup();

      render(<ErrorEmptyState onRetry={handleRetry} />);

      const button = screen.getByRole('button', { name: /reintentar/i });
      await user.click(button);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('uses default error message when not provided', () => {
      render(<ErrorEmptyState />);

      expect(screen.getByText(/ocurrió un error/i)).toBeInTheDocument();
    });
  });

  describe('OfflineEmptyState', () => {
    it('renders offline message', () => {
      render(<OfflineEmptyState />);

      expect(screen.getByText(/sin conexión/i)).toBeInTheDocument();
    });

    it('renders retry button when handler provided', async () => {
      const handleRetry = jest.fn();
      const user = userEvent.setup();

      render(<OfflineEmptyState onRetry={handleRetry} />);

      const button = screen.getByRole('button', { name: /reintentar/i });
      await user.click(button);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('NoDataEmptyState', () => {
    it('renders no data message with custom title', () => {
      render(<NoDataEmptyState title="No users" />);

      expect(screen.getByText(/no users/i)).toBeInTheDocument();
    });

    it('uses default title when not provided', () => {
      render(<NoDataEmptyState />);

      expect(screen.getByText(/no hay datos/i)).toBeInTheDocument();
    });
  });

  describe('LoadingEmptyState', () => {
    it('renders loading message', () => {
      render(<LoadingEmptyState />);

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('renders custom loading message', () => {
      render(<LoadingEmptyState message="Loading users..." />);

      expect(screen.getByText(/loading users/i)).toBeInTheDocument();
    });
  });

  describe('UnauthorizedEmptyState', () => {
    it('renders unauthorized message', () => {
      render(<UnauthorizedEmptyState />);

      expect(screen.getByText(/no autorizado/i)).toBeInTheDocument();
    });

    it('renders login button when handler provided', async () => {
      const handleLogin = jest.fn();
      const user = userEvent.setup();

      render(<UnauthorizedEmptyState onLogin={handleLogin} />);

      const button = screen.getByRole('button', { name: /iniciar sesión/i });
      await user.click(button);

      expect(handleLogin).toHaveBeenCalledTimes(1);
    });
  });
});
