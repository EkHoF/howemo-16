// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Settings, Users, Shield, Database, Bell, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function SystemManagementPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 系统概览数据
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    systemUptime: '99.9%',
    storageUsed: '45.2%',
    lastBackup: '2024-01-15 02:00:00'
  });

  // 用户管理数据
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // 系统日志数据
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  // 系统配置数据
  const [config, setConfig] = useState({
    systemName: '账号管理系统',
    version: '1.0.0',
    maintenance: false,
    debugMode: false,
    maxFileSize: '10MB',
    sessionTimeout: '30min'
  });
  const handlePageChange = pageId => {
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
    if (pageMap[pageId] && pageMap[pageId] !== 'system-management') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };

  // 获取系统统计信息
  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      // 这里可以调用实际的系统统计API
      // const response = await $w.cloud.callDataSource({...});

      // 模拟数据
      setTimeout(() => {
        setSystemStats({
          totalUsers: 156,
          activeUsers: 89,
          totalAccounts: 1234,
          activeAccounts: 890,
          systemUptime: '99.9%',
          storageUsed: '45.2%',
          lastBackup: new Date().toLocaleString('zh-CN')
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取系统统计失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取系统统计信息',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      // 这里可以调用实际的用户管理API
      // const response = await $w.cloud.callDataSource({...});

      // 模拟数据
      setTimeout(() => {
        setUsers([{
          _id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: '管理员',
          status: 'active',
          lastLogin: new Date()
        }, {
          _id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: '操作员',
          status: 'active',
          lastLogin: new Date(Date.now() - 86400000)
        }, {
          _id: '3',
          username: 'user2',
          email: 'user2@example.com',
          role: '查看者',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 172800000)
        }]);
        setUserLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取用户列表',
        variant: 'destructive'
      });
      setUserLoading(false);
    }
  };

  // 获取系统日志
  const fetchLogs = async () => {
    try {
      setLogLoading(true);
      // 这里可以调用实际的日志API
      // const response = await $w.cloud.callDataSource({...});

      // 模拟数据
      setTimeout(() => {
        setLogs([{
          _id: '1',
          level: 'info',
          message: '系统启动成功',
          timestamp: new Date(),
          user: 'system'
        }, {
          _id: '2',
          level: 'warning',
          message: '内存使用率较高',
          timestamp: new Date(Date.now() - 3600000),
          user: 'system'
        }, {
          _id: '3',
          level: 'error',
          message: '数据库连接失败',
          timestamp: new Date(Date.now() - 7200000),
          user: 'admin'
        }]);
        setLogLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取系统日志失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取系统日志',
        variant: 'destructive'
      });
      setLogLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSystemStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);
  const getStatusBadge = status => {
    const statusConfig = {
      'active': {
        label: '活跃',
        className: 'bg-green-100 text-green-800'
      },
      'inactive': {
        label: '非活跃',
        className: 'bg-gray-100 text-gray-800'
      },
      'suspended': {
        label: '已暂停',
        className: 'bg-red-100 text-red-800'
      }
    };
    const config = statusConfig[status] || statusConfig['inactive'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };
  const getLogLevelBadge = level => {
    const levelConfig = {
      'info': {
        label: '信息',
        className: 'bg-blue-100 text-blue-800'
      },
      'warning': {
        label: '警告',
        className: 'bg-yellow-100 text-yellow-800'
      },
      'error': {
        label: '错误',
        className: 'bg-red-100 text-red-800'
      }
    };
    const config = levelConfig[level] || levelConfig['info'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };

  // 渲染系统概览
  const renderOverview = () => <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                <p className="text-sm text-green-600">活跃: {systemStats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总账号数</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalAccounts}</p>
                <p className="text-sm text-green-600">活跃: {systemStats.activeAccounts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">系统运行时间</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}</p>
                <p className="text-sm text-gray-500">过去30天</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">存储使用率</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.storageUsed}</p>
                <p className="text-sm text-yellow-600">需要关注</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              系统配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">系统名称</span>
                <span className="text-sm">{config.systemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">版本</span>
                <span className="text-sm">{config.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">维护模式</span>
                <span className={`text-sm ${config.maintenance ? 'text-red-600' : 'text-green-600'}`}>
                  {config.maintenance ? '开启' : '关闭'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">调试模式</span>
                <span className={`text-sm ${config.debugMode ? 'text-orange-600' : 'text-gray-600'}`}>
                  {config.debugMode ? '开启' : '关闭'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">最大文件大小</span>
                <span className="text-sm">{config.maxFileSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">会话超时</span>
                <span className="text-sm">{config.sessionTimeout}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">数据库连接</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-600">正常</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">缓存服务</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-600">正常</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">消息队列</span>
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-600">警告</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">文件存储</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-600">正常</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">邮件服务</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-600">正常</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">最后备份</span>
                <span className="text-sm">{systemStats.lastBackup}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;

  // 渲染用户管理
  const renderUsers = () => <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户管理</CardTitle>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              添加用户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索用户..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">用户名</th>
                  <th className="text-left py-3 px-4">邮箱</th>
                  <th className="text-left py-3 px-4">角色</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">最后登录</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.username}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-3 px-4">
                      {new Date(user.lastLogin).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>;

  // 渲染系统日志
  const renderLogs = () => <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>系统日志</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                导出日志
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">时间</th>
                  <th className="text-left py-3 px-4">级别</th>
                  <th className="text-left py-3 px-4">用户</th>
                  <th className="text-left py-3 px-4">消息</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">{getLogLevelBadge(log.level)}</td>
                    <td className="py-3 px-4">{log.user}</td>
                    <td className="py-3 px-4">{log.message}</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>;
  return <AppLayout currentPage="system" onPageChange={handlePageChange} title="系统管理" subtitle="系统配置和维护" onRefresh={() => {
    if (activeTab === 'overview') fetchSystemStats();else if (activeTab === 'users') fetchUsers();else if (activeTab === 'logs') fetchLogs();
  }}>
      <div className="space-y-6">
        {/* 标签页切换 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Button variant={activeTab === 'overview' ? 'default' : 'outline'} onClick={() => setActiveTab('overview')}>
                <Settings className="w-4 h-4 mr-2" />
                系统概览
              </Button>
              <Button variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>
                <Users className="w-4 h-4 mr-2" />
                用户管理
              </Button>
              <Button variant={activeTab === 'logs' ? 'default' : 'outline'} onClick={() => setActiveTab('logs')}>
                <Bell className="w-4 h-4 mr-2" />
                系统日志
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 内容区域 */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'logs' && renderLogs()}
      </div>
    </AppLayout>;
}