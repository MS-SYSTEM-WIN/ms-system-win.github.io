import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface DataPoint {
  timestamp: string;
  pilot: number;
  mileage: number;
  avoid: number;
  time?: string;
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
  const [isLoading, setIsLoading] = useState(true);

  // 从 GitHub 原始文件 URL 加载数据
  const loadDataFromGitHub = async () => {
    try {
      const owner = 'MS-SYSTEM-WIN';
      const repo = 'ms-system-win.github.io';
      const branch = 'main';

      // 使用 GitHub 原始文件 URL
      const currentUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/data/current.json?t=${Date.now()}`;
      const historyUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public/data/history.json?t=${Date.now()}`;

      // 加载当前数据
      const currentResponse = await fetch(currentUrl);
      if (currentResponse.ok) {
        const current: CurrentData = await currentResponse.json();
        setCurrentValues({
          pilot: current.pilot,
          mileage: current.mileage,
          avoid: current.avoid,
        });
        setLastUpdateTime(new Date(current.timestamp).toLocaleTimeString('zh-CN'));
      }

      // 加载历史数据
      const historyResponse = await fetch(historyUrl);
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

  const clearCache = () => {
    localStorage.removeItem('huawei-ads-history');
    localStorage.removeItem('huawei-ads-current');
    setData([]);
    setCurrentValues({ pilot: 0, mileage: 0, avoid: 0 });
    alert('本地缓存已清空');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">华为乾崑智驾</h1>
          <p className="text-slate-400 text-lg">实时数据监控仪表板</p>
        </div>

        {/* 顶部信息栏 */}
        <div className="flex justify-between items-center mb-6 text-sm text-slate-400">
          <div>最后更新: <span className="text-cyan-400 font-mono">{lastUpdateTime || '--:--:--'}</span></div>
          <div>数据源: <span className="text-cyan-400">GitHub Actions</span></div>
        </div>

        {/* 数据卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 辅助驾驶里程 */}
          <Card className="bg-slate-800 border-slate-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 group-hover:w-full transition-all duration-300 opacity-10"></div>
            <div className="relative z-10">
              <div className="text-slate-400 text-sm mb-2">累计辅助驾驶里程</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-cyan-400">{currentValues.pilot.toLocaleString()}</div>
                <div className="text-slate-400">公里</div>
              </div>
            </div>
          </Card>

          {/* 行驶总里程 */}
          <Card className="bg-slate-800 border-slate-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 group-hover:w-full transition-all duration-300 opacity-10"></div>
            <div className="relative z-10">
              <div className="text-slate-400 text-sm mb-2">累计行驶总里程</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-orange-400">{currentValues.mileage.toLocaleString()}</div>
                <div className="text-slate-400">公里</div>
              </div>
            </div>
          </Card>

          {/* 主动避险次数 */}
          <Card className="bg-slate-800 border-slate-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 group-hover:w-full transition-all duration-300 opacity-10"></div>
            <div className="relative z-10">
              <div className="text-slate-400 text-sm mb-2">累计主动避险次数</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-purple-400">{currentValues.avoid.toLocaleString()}</div>
                <div className="text-slate-400">次</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 图表 */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">实时数据趋势</h2>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="pilot"
                  stroke="#06b6d4"
                  dot={false}
                  strokeWidth={2}
                  name="辅助驾驶里程"
                />
                <Line
                  type="monotone"
                  dataKey="mileage"
                  stroke="#f97316"
                  dot={false}
                  strokeWidth={2}
                  name="行驶总里程"
                />
                <Line
                  type="monotone"
                  dataKey="avoid"
                  stroke="#d946ef"
                  dot={false}
                  strokeWidth={2}
                  name="主动避险次数"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-500">
              {isLoading ? '加载中...' : '暂无数据'}
            </div>
          )}
        </Card>

        {/* 底部信息 */}
        <div className="text-center text-slate-500 text-sm mb-6">
          <p>数据每 30 秒自动更新一次 (GitHub Actions) • 最多保留 2880 个数据点（24 小时）</p>
          <p className="mt-2">数据来源: 华为乾崑智驾 API • GitHub Actions 自动爬取 • 历史数据保存在仓库中</p>
        </div>

        {/* 清空缓存按钮 */}
        <div className="flex justify-center">
          <button
            onClick={clearCache}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            清空本地缓存
          </button>
        </div>
      </div>
    </div>
  );
}
