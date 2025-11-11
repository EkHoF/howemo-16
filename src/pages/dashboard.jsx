// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Bell, Globe, LogOut, Users, Activity, CheckCircle, AlertTriangle, DollarSign, TrendingUp, Shield, Clock, BarChart3, Home, MessageCircle, Calendar, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// 侧边栏导航组件
function Sidebar({
  currentPage,
  onPageChange,
  collapsed,
  onToggleCollapse
}) {
  const menuItems = [{
    id: 'dashboard',
    label: '仪表板',
    icon: Home
  }, {
    id: 'accounts',
    label: '账号管理',
    icon: Users
  }, {
    id: 'tasks',
    label: '任务管理',
    icon: Clock
  }, {
    id: 'risk',
    label: '风控管理',
    icon: Shield
  }, {
    id: 'chat',
    label: '聊天管理',
    icon: MessageCircle
  }, {
    id: 'cron',
    label: '定时任务',
    icon: Calendar
  }, {
    id: 'proxy',
    label: '代理IP管理',
    icon: Globe
  }, {
    id: 'system',
    label: '系统管理',
    icon: Settings
  }];
  return <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-lg">管理系统</span>
            </div>}
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="p-2">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map(item => {
          const Icon = item.icon;
          return <Button key={item.id} variant={currentPage === item.id ? 'default' : 'ghost'} className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`} onClick={() => onPageChange(item.id)}>
                <Icon className="w-4 h-4" />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>;
        })}
        </div>
      </nav>
    </div>;
}

// 仪表板内容组件
function DashboardContent({
  stats,
  activityData,
  taskEfficiencyData,
  riskData,
  loading,
  getText,
  onRefresh
}) {
  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color = "blue"
  }) => <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}% from yesterday
              </p>}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>;
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{getText('loadingData')}</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} title={getText('totalAccounts')} value={stats.totalAccounts.toLocaleString()} change={5.2} color="blue" />
        <StatCard icon={Activity} title={getText('activeAccounts')} value={stats.activeAccounts.toLocaleString()} change={3.8} color="green" />
        <StatCard icon={Clock} title={getText('todayTasks')} value={stats.todayTasks} change={12.5} color="purple" />
        <StatCard icon={CheckCircle} title={getText('successTasks')} value={stats.successTasks} change={8.3} color="emerald" />
        <StatCard icon={AlertTriangle} title={getText('riskTriggers')} value={stats.riskTriggers} change={-15.2} color="red" />
        <StatCard icon={DollarSign} title={getText('todayPayments')} value={`$${stats.todayPayments.toFixed(2)}`} change={22.1} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {getText('accountActivityTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer> : <div className="h-64 flex items-center justify-center text-gray-500">
                {getText('noDataAvailable')}
              </div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {getText('taskExecutionEfficiency')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taskEfficiencyData.length > 0 ? <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={taskEfficiencyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {taskEfficiencyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {taskEfficiencyData.map(item => <div key={item.name} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2`} style={{
                  backgroundColor: item.color
                }} />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>)}
                </div>
              </> : <div className="h-64 flex items-center justify-center text-gray-500">
                {getText('noDataAvailable')}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Risk Triggers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {getText('topRiskTriggers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskData.length > 0 ? <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">{getText('ruleName')}</th>
                    <th className="text-left py-2">{getText('triggerCount')}</th>
                    <th className="text-left py-2">{getText('severity')}</th>
                    <th className="text-left py-2">{getText('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData.map((item, index) => <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2">{item.rule}</td>
                      <td className="py-2">{item.count}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${item.count >= 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.count >= 3 ? getText('high') : getText('medium')}
                        </span>
                      </td>
                      <td className="py-2">
                        <Button variant="outline" size="sm">{getText('viewDetails')}</Button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div> : <div className="text-center py-8 text-gray-500">
              {getText('noDataAvailable')}
            </div>}
        </CardContent>
      </Card>
    </div>;
}

// 占位符内容组件
function PlaceholderContent({
  title,
  description
}) {
  return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>;
}
export default function DashboardPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [timeRange, setTimeRange] = useState('7d');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    todayTasks: 0,
    successTasks: 0,
    riskTriggers: 0,
    todayPayments: 0.00
  });
  const [activityData, setActivityData] = useState([]);
  const [taskEfficiencyData, setTaskEfficiencyData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const languages = [{
    code: 'en-US',
    name: 'English'
  }, {
    code: 'zh-CN',
    name: '中文'
  }, {
    code: 'ja-JP',
    name: '日本語'
  }];

  // 多语言文本映射
  const getText = key => {
    const texts = {
      'en-US': {
        systemTitle: 'Account Management System',
        systemSubtitle: 'Overseas Legal Account Platform',
        totalAccounts: 'Total Accounts',
        activeAccounts: 'Active Accounts',
        todayTasks: "Today's Tasks",
        successTasks: 'Success Tasks',
        riskTriggers: 'Risk Triggers',
        todayPayments: "Today's Payments",
        accountActivityTrend: 'Account Activity Trend',
        taskExecutionEfficiency: 'Task Execution Efficiency',
        topRiskTriggers: 'Top Risk Triggers',
        ruleName: 'Rule Name',
        triggerCount: 'Trigger Count',
        severity: 'Severity',
        action: 'Action',
        viewDetails: 'View Details',
        completed: 'Completed',
        failed: 'Failed',
        high: 'High',
        medium: 'Medium',
        notifications: 'Notifications',
        logout: 'Logout',
        backToDashboard: 'Back to Dashboard',
        loadingData: 'Loading data...',
        dataLoadError: 'Failed to load data',
        noDataAvailable: 'No data available',
        refresh: 'Refresh'
      },
      'zh-CN': {
        systemTitle: '账号管理系统',
        systemSubtitle: '海外合法账号平台',
        totalAccounts: '总账号数',
        activeAccounts: '活跃账号数',
        todayTasks: '今日任务数',
        successTasks: '成功任务数',
        riskTriggers: '风控触发数',
        todayPayments: '今日支付金额',
        accountActivityTrend: '账号活跃度趋势',
        taskExecutionEfficiency: '任务执行效率',
        topRiskTriggers: '风控触发TOP5',
        ruleName: '规则名称',
        triggerCount: '触发次数',
        severity: '严重程度',
        action: '操作',
        viewDetails: '查看详情',
        completed: '已完成',
        failed: '失败',
        high: '高',
        medium: '中',
        notifications: '通知',
        logout: '退出登录',
        backToDashboard: '返回仪表板',
        loadingData: '数据加载中...',
        dataLoadError: '数据加载失败',
        noDataAvailable: '暂无数据',
        refresh: '刷新'
      },
      'ja-JP': {
        systemTitle: 'アカウント管理システム',
        systemSubtitle: '海外合法アカウントプラットフォーム',
        totalAccounts: '総アカウント数',
        activeAccounts: 'アクティブアカウント数',
        todayTasks: '今日のタスク数',
        successTasks: '成功タスク数',
        riskTriggers: 'リスクトリガー数',
        todayPayments: '今日の支払金額',
        accountActivityTrend: 'アカウント活動トレンド',
        taskExecutionEfficiency: 'タスク実行効率',
        topRiskTriggers: 'リストトリガーTOP5',
        ruleName: 'ルール名',
        triggerCount: 'トリガー回数',
        severity: '深刻度',
        action: 'アクション',
        viewDetails: '詳細を表示',
        completed: '完了',
        failed: '失敗',
        high: '高',
        medium: '中',
        notifications: '通知',
        logout: 'ログアウト',
        backToDashboard: 'ダッシュボードに戻る',
        loadingData: 'データ読み込み中...',
        dataLoadError: 'データの読み込みに失敗しました',
        noDataAvailable: 'データがありません',
        refresh: '更新'
      }
    };
    return texts[selectedLanguage]?.[key] || texts['zh-CN'][key] || key;
  };

  // 从dashboard_stats数据模型获取统计数据
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'dashboard_stats',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            date: 'desc'
          }],
          pageSize: 30,
          getCount: true
        }
      });
      if (response.records && response.records.length > 0) {
        const latestRecord = response.records[0];
        setStats({
          totalAccounts: latestRecord.total_accounts || 0,
          activeAccounts: latestRecord.active_accounts || 0,
          todayTasks: latestRecord.today_tasks || 0,
          successTasks: latestRecord.success_tasks || 0,
          riskTriggers: latestRecord.risk_triggers || 0,
          todayPayments: latestRecord.today_payments || 0.00
        });
        const activityTrend = response.records.slice(0, 7).reverse().map(record => ({
          date: new Date(record.date).toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
          }),
          active: record.active_accounts || 0,
          new: record.new_accounts || 0
        }));
        setActivityData(activityTrend);
        const taskData = [{
          name: getText('completed'),
          value: latestRecord.success_tasks || 0,
          color: '#10b981'
        }, {
          name: getText('failed'),
          value: (latestRecord.today_tasks || 0) - (latestRecord.success_tasks || 0),
          color: '#ef4444'
        }];
        setTaskEfficiencyData(taskData);
        await fetchRiskTriggers();
      } else {
        setStats({
          totalAccounts: 0,
          activeAccounts: 0,
          todayTasks: 0,
          successTasks: 0,
          riskTriggers: 0,
          todayPayments: 0.00
        });
        setActivityData([]);
        setTaskEfficiencyData([]);
        setRiskData([]);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      toast({
        title: getText('dataLoadError'),
        description: error.message || getText('dataLoadError'),
        variant: "destructive"
      });
      setStats({
        totalAccounts: 0,
        activeAccounts: 0,
        todayTasks: 0,
        successTasks: 0,
        riskTriggers: 0,
        todayPayments: 0.00
      });
      setActivityData([]);
      setTaskEfficiencyData([]);
      setRiskData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchRiskTriggers = async () => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'risk_triggers',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            trigger_count: 'desc'
          }],
          pageSize: 5
        }
      });
      if (response.records && response.records.length > 0) {
        const riskData = response.records.map(record => ({
          rule: record.rule_name || 'Unknown Rule',
          count: record.trigger_count || 0
        }));
        setRiskData(riskData);
      } else {
        setRiskData([]);
      }
    } catch (error) {
      console.error('获取风险触发数据失败:', error);
      setRiskData([]);
    }
  };

  // 页面切换处理
  const handlePageChange = pageId => {
    setCurrentPage(pageId);

    // 根据页面ID导航到对应页面
    const pageMap = {
      'dashboard': 'dashboard',
      'accounts': 'accounts',
      'tasks': 'tasks',
      'risk': 'risk',
      'chat': 'chat-list',
      'cron': 'cron-jobs',
      'proxy': 'proxy-management',
      'system': 'system-management'
    };
    if (pageMap[pageId] && pageMap[pageId] !== 'dashboard') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('language');
    const savedLanguage = langFromUrl || localStorage.getItem('selectedLanguage') || 'zh-CN';
    setSelectedLanguage(savedLanguage);
    if (currentPage === 'dashboard') {
      fetchDashboardStats();
    }
  }, [currentPage]);
  const handleLanguageChange = languageCode => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    toast({
      title: 'Language Changed',
      description: `Language changed to ${languages.find(l => l.code === languageCode)?.name}`
    });
  };
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    $w.utils.navigateTo({
      pageId: 'login',
      params: {}
    });
  };
  const handleRefresh = () => {
    if (currentPage === 'dashboard') {
      fetchDashboardStats();
    }
    toast({
      title: "Refreshed",
      description: "Data has been refreshed"
    });
  };

  // 渲染当前页面内容
  const renderCurrentPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent stats={stats} activityData={activityData} taskEfficiencyData={taskEfficiencyData} riskData={riskData} loading={loading} getText={getText} onRefresh={handleRefresh} />;
      case 'accounts':
        return <PlaceholderContent title="账号管理" description="管理海外账号信息" />;
      case 'tasks':
        return <PlaceholderContent title="任务管理" description="查看和管理任务执行情况" />;
      case 'risk':
        return <PlaceholderContent title="风控管理" description="监控和管理风险规则" />;
      case 'chat':
        return <PlaceholderContent title="聊天管理" description="管理聊天对话和消息" />;
      case 'cron':
        return <PlaceholderContent title="定时任务" description="配置和管理定时任务" />;
      case 'proxy':
        return <PlaceholderContent title="代理IP管理" description="管理和监控代理IP服务" />;
      case 'system':
        return <PlaceholderContent title="系统管理" description="系统配置和维护" />;
      default:
        return <PlaceholderContent title="页面未找到" description="请选择有效的菜单项" />;
    }
  };
  return <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getText('systemTitle')}</h1>
              <p className="text-sm text-gray-600">{getText('systemSubtitle')}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <Activity className="w-4 h-4 mr-2" />
                {getText('refresh')}
              </Button>

              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                {getText('notifications')}
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {getText('logout')}
              </Button>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 p-6">
          {renderCurrentPageContent()}
        </main>
      </div>
    </div>;
}