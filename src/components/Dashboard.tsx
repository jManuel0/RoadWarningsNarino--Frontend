import { useMemo } from 'react';
import { Alert, AlertType, AlertPriority, AlertStatus } from '@/types/Alert';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  alerts: Alert[];
}

const COLORS = {
  [AlertPriority.CRITICA]: '#dc2626',
  [AlertPriority.ALTA]: '#ea580c',
  [AlertPriority.MEDIA]: '#facc15',
  [AlertPriority.BAJA]: '#3b82f6',
};

const TYPE_COLORS = {
  [AlertType.DERRUMBE]: '#8b5cf6',
  [AlertType.ACCIDENTE]: '#ef4444',
  [AlertType.INUNDACION]: '#3b82f6',
  [AlertType.CIERRE_VIAL]: '#f59e0b',
  [AlertType.MANTENIMIENTO]: '#10b981',
};

export default function Dashboard({ alerts }: Readonly<DashboardProps>) {
  // Estadísticas generales
  const stats = useMemo(() => {
    const active = alerts.filter(a => a.status === AlertStatus.ACTIVE).length;
    const inProgress = alerts.filter(a => a.status === AlertStatus.IN_PROGRESS).length;
    const resolved = alerts.filter(a => a.status === AlertStatus.RESOLVED).length;
    const critical = alerts.filter(a => a.priority === AlertPriority.CRITICA).length;

    const avgResolutionTime = alerts
      .filter(a => a.status === AlertStatus.RESOLVED && a.estimatedDuration)
      .reduce((acc, a) => acc + (a.estimatedDuration || 0), 0) / resolved || 0;

    // Comparar con período anterior (últimos 7 días vs 7 días anteriores)
    const now = new Date();
    const last7Days = alerts.filter(a => 
      new Date(a.timestamp) >= subDays(now, 7)
    ).length;
    const previous7Days = alerts.filter(a => {
      const date = new Date(a.timestamp);
      return date >= subDays(now, 14) && date < subDays(now, 7);
    }).length;

    const trend = previous7Days === 0 ? 0 : 
      ((last7Days - previous7Days) / previous7Days) * 100;

    return {
      active,
      inProgress,
      resolved,
      critical,
      total: alerts.length,
      avgResolutionTime: Math.round(avgResolutionTime),
      trend: Math.round(trend),
    };
  }, [alerts]);

  // Datos para gráfico de tendencia (últimos 7 días)
  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayAlerts = alerts.filter(a => {
        const alertDate = new Date(a.timestamp);
        return alertDate >= dayStart && alertDate <= dayEnd;
      });

      return {
        date: format(date, 'EEE', { locale: es }),
        alertas: dayAlerts.length,
        criticas: dayAlerts.filter(a => a.priority === AlertPriority.CRITICA).length,
      };
    });
    return days;
  }, [alerts]);

  // Datos para gráfico de distribución por tipo
  const typeDistribution = useMemo(() => {
    const distribution = Object.values(AlertType).map(type => ({
      name: type.replace('_', ' '),
      value: alerts.filter(a => a.type === type).length,
      color: TYPE_COLORS[type],
    }));
    const total = distribution.reduce((sum, d) => sum + d.value, 0);
    return distribution.filter(d => d.value > 0).map(d => ({
      ...d,
      percent: total > 0 ? d.value / total : 0,
    }));
  }, [alerts]);

  // Datos para gráfico de prioridades
  const priorityDistribution = useMemo(() => {
    return [
      { name: 'Crítica', value: alerts.filter(a => a.priority === AlertPriority.CRITICA).length, color: COLORS[AlertPriority.CRITICA] },
      { name: 'Alta', value: alerts.filter(a => a.priority === AlertPriority.ALTA).length, color: COLORS[AlertPriority.ALTA] },
      { name: 'Media', value: alerts.filter(a => a.priority === AlertPriority.MEDIA).length, color: COLORS[AlertPriority.MEDIA] },
      { name: 'Baja', value: alerts.filter(a => a.priority === AlertPriority.BAJA).length, color: COLORS[AlertPriority.BAJA] },
    ].filter(d => d.value > 0);
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Alertas Activas"
          value={stats.active}
          icon={<Activity className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
          trend={stats.trend}
        />
        
        <StatCard
          title="En Progreso"
          value={stats.inProgress}
          icon={<Clock className="text-yellow-600" size={24} />}
          bgColor="bg-yellow-50"
        />
        
        <StatCard
          title="Resueltas"
          value={stats.resolved}
          icon={<CheckCircle className="text-green-600" size={24} />}
          bgColor="bg-green-50"
        />
        
        <StatCard
          title="Críticas"
          value={stats.critical}
          icon={<AlertTriangle className="text-red-600" size={24} />}
          bgColor="bg-red-50"
          highlight={stats.critical > 0}
        />
      </div>

      {/* Tiempo promedio de resolución */}
      {stats.avgResolutionTime > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Promedio de Resolución</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgResolutionTime} min</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <Clock className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia semanal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tendencia Semanal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="alertas"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total Alertas"
              />
              <Line
                type="monotone"
                dataKey="criticas"
                stroke="#dc2626"
                strokeWidth={2}
                name="Críticas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por tipo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribución por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  const entry = typeDistribution[props.index];
                  if (entry) {
                    return `${entry.name} ${(entry.percent * 100).toFixed(0)}%`;
                  }
                  return '';
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry) => (
                  <Cell key={`type-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por prioridad */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribución por Prioridad
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Alertas">
                {priorityDistribution.map((entry) => (
                  <Cell key={`priority-${entry.name}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top vías afectadas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Vías Más Afectadas
          </h3>
          <TopAffectedRoads alerts={alerts} />
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de estadística
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  trend?: number;
  highlight?: boolean;
}

function StatCard({ title, value, icon, bgColor, trend, highlight }: Readonly<StatCardProps>) {
  const getTrendDisplay = () => {
    if (trend === undefined) return null;

    if (trend > 0) {
      return (
        <>
          <TrendingUp size={16} className="text-red-600" />
          <span className="text-sm text-red-600">+{trend}%</span>
        </>
      );
    }

    if (trend < 0) {
      return (
        <>
          <TrendingDown size={16} className="text-green-600" />
          <span className="text-sm text-green-600">{trend}%</span>
        </>
      );
    }

    return <span className="text-sm text-gray-600">Sin cambios</span>;
  };

  return (
    <div className={`${bgColor} rounded-lg shadow p-6 ${highlight ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendDisplay()}
              <span className="text-xs text-gray-500 ml-1">vs semana anterior</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Top vías afectadas
function TopAffectedRoads({ alerts }: Readonly<{ alerts: Alert[] }>) {
  const roadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const alert of alerts) {
      for (const road of alert.affectedRoads) {
        counts[road] = (counts[road] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([road, count]) => ({ road, count }));
  }, [alerts]);

  if (roadCounts.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No hay datos de vías afectadas
      </p>
    );
  }

  const maxCount = roadCounts[0].count;

  return (
    <div className="space-y-4">
      {roadCounts.map(({ road, count }) => (
        <div key={road}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{road}</span>
            <span className="text-sm font-bold text-gray-900">{count}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}