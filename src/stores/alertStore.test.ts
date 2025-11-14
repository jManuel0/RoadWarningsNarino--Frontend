import { useAlertStore } from "./alertStore";
import { Alert, AlertType, AlertSeverity, AlertStatus } from "@/types/Alert";

const createMockAlert = (overrides?: Partial<Alert>): Alert => ({
  id: 1,
  type: AlertType.ACCIDENTE,
  title: "Test Alert",
  severity: AlertSeverity.MEDIA,
  location: "Test Location",
  description: "Test description",
  latitude: 1.2,
  longitude: -77.3,
  status: AlertStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("alertStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useAlertStore.setState({
      alerts: [],
      loading: false,
      error: null,
    });
  });

  it("should initialize with empty state", () => {
    const state = useAlertStore.getState();
    expect(state.alerts).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set alerts", () => {
    const mockAlerts = [createMockAlert({ id: 1 }), createMockAlert({ id: 2 })];

    useAlertStore.getState().setAlerts(mockAlerts);

    const state = useAlertStore.getState();
    expect(state.alerts).toEqual(mockAlerts);
    expect(state.alerts).toHaveLength(2);
  });

  it("should add alert to the beginning of the list", () => {
    const existingAlert = createMockAlert({ id: 1 });
    const newAlert = createMockAlert({ id: 2, description: "New alert" });

    useAlertStore.setState({ alerts: [existingAlert] });
    useAlertStore.getState().addAlert(newAlert);

    const state = useAlertStore.getState();
    expect(state.alerts).toHaveLength(2);
    expect(state.alerts[0]).toEqual(newAlert);
    expect(state.alerts[1]).toEqual(existingAlert);
  });

  it("should notify observers when adding alert", () => {
    const observer = jest.fn();
    const newAlert = createMockAlert({ id: 1 });

    useAlertStore.getState().alertSubject.attach(observer);
    useAlertStore.getState().addAlert(newAlert);

    expect(observer).toHaveBeenCalledWith(newAlert);
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it("should update alert by id", () => {
    const alert = createMockAlert({ id: 1, description: "Original" });
    useAlertStore.setState({ alerts: [alert] });

    useAlertStore.getState().updateAlert(1, { description: "Updated" });

    const state = useAlertStore.getState();
    expect(state.alerts[0].description).toBe("Updated");
  });

  it("should not update non-existent alert", () => {
    const alert = createMockAlert({ id: 1 });
    useAlertStore.setState({ alerts: [alert] });

    useAlertStore.getState().updateAlert(999, { description: "Should not update" });

    const state = useAlertStore.getState();
    expect(state.alerts[0]).toEqual(alert);
  });

  it("should remove alert by id", () => {
    const alerts = [
      createMockAlert({ id: 1 }),
      createMockAlert({ id: 2 }),
      createMockAlert({ id: 3 }),
    ];
    useAlertStore.setState({ alerts });

    useAlertStore.getState().removeAlert(2);

    const state = useAlertStore.getState();
    expect(state.alerts).toHaveLength(2);
    expect(state.alerts.find((a) => a.id === 2)).toBeUndefined();
  });

  it("should set loading state", () => {
    useAlertStore.getState().setLoading(true);
    expect(useAlertStore.getState().loading).toBe(true);

    useAlertStore.getState().setLoading(false);
    expect(useAlertStore.getState().loading).toBe(false);
  });

  it("should set error state", () => {
    useAlertStore.getState().setError("Error message");
    expect(useAlertStore.getState().error).toBe("Error message");

    useAlertStore.getState().setError(null);
    expect(useAlertStore.getState().error).toBeNull();
  });

  describe("getActiveAlerts", () => {
    it("should return only active alerts", () => {
      const alerts = [
        createMockAlert({ id: 1, status: AlertStatus.ACTIVE }),
        createMockAlert({ id: 2, status: AlertStatus.RESOLVED }),
        createMockAlert({ id: 3, status: AlertStatus.ACTIVE }),
      ];
      useAlertStore.setState({ alerts });

      const activeAlerts = useAlertStore.getState().getActiveAlerts();

      expect(activeAlerts).toHaveLength(2);
      expect(activeAlerts.every((a) => a.status === AlertStatus.ACTIVE)).toBe(true);
    });

    it("should return empty array when no active alerts", () => {
      const alerts = [
        createMockAlert({ id: 1, status: AlertStatus.RESOLVED }),
        createMockAlert({ id: 2, status: AlertStatus.RESOLVED }),
      ];
      useAlertStore.setState({ alerts });

      const activeAlerts = useAlertStore.getState().getActiveAlerts();

      expect(activeAlerts).toEqual([]);
    });
  });

  describe("getCriticalAlerts", () => {
    it("should return only active critical alerts", () => {
      const alerts = [
        createMockAlert({ id: 1, status: AlertStatus.ACTIVE, severity: AlertSeverity.CRITICA }),
        createMockAlert({ id: 2, status: AlertStatus.ACTIVE, severity: AlertSeverity.MEDIA }),
        createMockAlert({ id: 3, status: AlertStatus.RESOLVED, severity: AlertSeverity.CRITICA }),
        createMockAlert({ id: 4, status: AlertStatus.ACTIVE, severity: AlertSeverity.CRITICA }),
      ];
      useAlertStore.setState({ alerts });

      const criticalAlerts = useAlertStore.getState().getCriticalAlerts();

      expect(criticalAlerts).toHaveLength(2);
      expect(
        criticalAlerts.every(
          (a) => a.status === AlertStatus.ACTIVE && a.severity === AlertSeverity.CRITICA
        )
      ).toBe(true);
    });

    it("should return empty array when no critical active alerts", () => {
      const alerts = [
        createMockAlert({ id: 1, status: AlertStatus.ACTIVE, severity: AlertSeverity.MEDIA }),
        createMockAlert({ id: 2, status: AlertStatus.RESOLVED, severity: AlertSeverity.CRITICA }),
      ];
      useAlertStore.setState({ alerts });

      const criticalAlerts = useAlertStore.getState().getCriticalAlerts();

      expect(criticalAlerts).toEqual([]);
    });
  });

  describe("Observer pattern", () => {
    it("should attach and detach observers", () => {
      const observer1 = jest.fn();
      const observer2 = jest.fn();
      const subject = useAlertStore.getState().alertSubject;

      subject.attach(observer1);
      subject.attach(observer2);

      const newAlert = createMockAlert();
      useAlertStore.getState().addAlert(newAlert);

      expect(observer1).toHaveBeenCalledWith(newAlert);
      expect(observer2).toHaveBeenCalledWith(newAlert);

      subject.detach(observer1);

      const anotherAlert = createMockAlert({ id: 2 });
      useAlertStore.getState().addAlert(anotherAlert);

      expect(observer1).toHaveBeenCalledTimes(1);
      expect(observer2).toHaveBeenCalledTimes(2);
    });
  });
});
