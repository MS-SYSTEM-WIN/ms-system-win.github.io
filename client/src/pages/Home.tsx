import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface DataPoint {
  timestamp: string;
  pilot: number;
  mileage: number;
  avoid: number;
  time?: string; // 用于图表显示
}

interface CurrentData {
  timestamp: string;
  pilot: number;
  mileage: number;
  avoid: number;
}

export default function Home() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentValues, setCurrentValues] = useState({
    pilot: 0,
    mileage: 0,
    avoid: 0,
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [dataSource, setDataSource] = useState<'github' | 'local'>('github');
  const [isLoading, setIsLoading] = useState(true);

  // 从 GitHub 仓库加载数据
  const loadDataFromGitHub = async () => {
    try {
      // 加载当前数据
      const currentResponse = await fetch('/public/data/current.json');
      if (currentResponse.ok) {
        const current: CurrentData = await currentResponse.json();
        setCurrentValues({
          pilot: current.pilot,
          mileage: current.mileage,
          avoid: current.avoid,
        });
        setLastUpdateTime(new Date(current.timestamp).toLocaleTimeString('zh-CN'));
        setDataSource('github');
      }

      // 加载历史数据
      const historyResponse = await fetch('/public/data/history.json');
      if (historyResponse.ok) {
        const history: CurrentData[] = await historyResponse.json();
        
        // 转换数据格式用于图表显示
        const chartData: DataPoint[] = history.map((item, index) => ({
          ...item,
          time: `${Math.floor(index / 2)}:${String((index % 2) * 30).padStart(2, '0')}`,
        }));
        
        setData(chartData);
      }
    } catch (error) {
      console.error('加载 GitHub 数据失败:', error);
      setDataSource('local');
      loadDataFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // 从本地存储加载数据（备用方案）
  const loadDataFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('huawei-ads-history');
      if (saved) {
        setData(JSON.parse(saved));
      }
      
      const currentSaved = localStorage.getItem('huawei-ads-current');
      if (currentSaved) {
        setCurrentValues(JSON.parse(currentSaved));
      }
    } catch (error) {
      console.error('加载本地数据失败:', error);
    }
  };

  // 初始化和定时刷新
  useEffect(() => {
    loadDataFromGitHub();

    // 每 30 秒刷新一次数据
    const interval = setInterval(loadDataFromGitHub, 30000);

    return () => clearInterval(interval);
  }, []);

  // 保存数据到本地存储（备用）
  useEffect(() => {
    if (data.length > 0) {
      try {
        localStorage.setItem('huawei-ads-history', JSON.stringify(data));
      } catch (error) {
        console.error('保存历史数据失败:', error);
      }
    }
  }, [data]);

  useEffect(() => {
    if (currentValues.pilot > 0 || currentValues.mileage > 0 || currentValues.avoid > 0) {
      try {
        localStorage.setItem('huawei-ads-current', JSON.stringify(currentValues));
      } catch (error) {
        console.error('保存当前数据失败:', error);
      }
    }
  }, [currentValues]);

  const handleClearData = () => {
    if (confirm('确定要清空所有本地存储的数据吗？')) {
      localStorage.removeItem('huawei-ads-history');
      localStorage.removeItem('huawei-ads-current');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* 背景网格 */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px',
      }} />

      {/* 顶部导航 */}
      <header className="relative z-10 border-b border-blue-900/30 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">华为乾崑智驾</h1>
              <p className="text-blue-300 text-sm mt-1">实时数据监控仪表板</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">最后更新: {lastUpdateTime || '--:--:--'}</p>
              <p className="text-blue-300 text-sm mt-1">
                数据源: {dataSource === 'github' ? 'GitHub Actions' : '本地存储'}
                {isLoading && ' (加载中...)'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* 实时数值卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: '累计辅助驾驶里程', value: currentValues.pilot, unit: '公里', color: 'from-cyan-500 to-blue-500' },
            { label: '累计行驶总里程', value: currentValues.mileage, unit: '公里', color: 'from-orange-500 to-red-500' },
            { label: '累计主动避险次数', value: currentValues.avoid, unit: '次', color: 'from-purple-500 to-pink-500' },
          ].map((item, idx) => (
            <Card key={idx} className="bg-slate-900/50 border-blue-900/30 backdrop-blur-sm overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${item.color}`} />
              <div className="p-6">
                <p className="text-gray-400 text-sm font-medium mb-2">{item.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white font-mono">
                    {item.value.toLocaleString('zh-CN')}
                  </p>
                  <span className="text-gray-500 text-sm">{item.unit}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 图表卡片 */}
        <Card className="bg-slate-900/50 border-blue-900/30 backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold text-white mb-6">实时数据趋势</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.5)" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)" 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => value.toLocaleString('zh-CN')}
                  labelFormatter={(label) => `时间: ${label}`}
                />
                <Legend 
                  wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pilot" 
                  stroke="#00D4AA" 
                  dot={false}
                  strokeWidth={2}
                  name="辅助驾驶里程"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="mileage" 
                  stroke="#FF9500" 
                  dot={false}
                  strokeWidth={2}
                  name="总行驶里程"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="avoid" 
                  stroke="#E91E63" 
                  dot={false}
                  strokeWidth={2}
                  name="避险次数"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <p>{isLoading ? '加载数据中...' : '暂无数据'}</p>
            </div>
          )}
        </Card>

        {/* 底部说明 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>数据每 30 秒自动更新一次 (GitHub Actions) • 最多保留 2880 个数据点（24 小时）</p>
          <p className="mt-2 text-xs text-gray-600">
            数据来源: 华为乾崑智驾 API • GitHub Actions 自动爬取 • 历史数据保存在仓库中
          </p>
          <button 
            onClick={handleClearData}
            className="mt-4 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-md text-xs transition-colors"
          >
            清空本地缓存
          </button>
        </div>
      </main>
    </div>
  );
}
