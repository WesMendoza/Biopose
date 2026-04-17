import { Activity, Users, Video, AlertTriangle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard General</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Usuarios Activos"
          value="1,245"
          icon={<Users className="w-8 h-8 text-blue-500" />}
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          title="Análisis Realizados"
          value="8,531"
          icon={<Activity className="w-8 h-8 text-green-500" />}
          trend="+5%"
          trendUp={true}
        />
        <StatCard 
          title="Sesiones de Video"
          value="432"
          icon={<Video className="w-8 h-8 text-purple-500" />}
          trend="-2%"
          trendUp={false}
        />
        <StatCard 
          title="Eventos Multipersona"
          value="89"
          icon={<AlertTriangle className="w-8 h-8 text-orange-500" />}
          trend="+18%"
          trendUp={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500">Gráfico de actividad en construcción...</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Últimos Eventos</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Detección completada</p>
                  <p className="text-xs text-gray-500">Hace {i * 15} minutos en Cámara {i}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <span className={`text-sm font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trend}
      </span>
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;