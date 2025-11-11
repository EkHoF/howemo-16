// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload, RefreshCw, Globe, Shield, Activity, AlertCircle, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function ProxyManagementPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const fetchProxies = async () => {
    try {
      setLoading(true);
      // 模拟数据，实际应该调用数据源
      setTimeout(() => {
        const mockProxies = [{
          _id: '1',
          ip_address: '192.168.1.100',
          port: 8080,
          type: 'http',
          status: 'active',
          location: '美国',
          speed: '1.2ms',
          last_check: new Date(),
          usage_count: 156
        }, {
          _id: '2',
          ip_address: '192.168.1.101',
          port: 8080,
          type: 'https',
          status: 'inactive',
          location: '英国',
          speed: '2.5ms',
          last_check: new Date(Date.now() - 3600000),
          usage_count: 89
        }, {
          _id: '3',
          ip_address: '192.168.1.102',
          port: 8080,
          type: 'socks5',
          status: 'error',
          location: '日本',
          speed: 'N/A',
          last_check: new Date(Date.now() - 7200000),
          usage_count: 0
        }];
        setProxies(mockProxies);
        setTotalPages(Math.ceil(mockProxies.length / pageSize));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('获取代理IP数据失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取代理IP数据',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProxies();
  }, [currentPage]);
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
    if (pageMap[pageId] && pageMap[pageId] !== 'proxy-management') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  const handleSearch = () => {
    fetchProxies();
  };
  const handleDelete = async proxyId => {
    if (confirm('确定要删除这个代理IP吗？')) {
      try {
        // 模拟删除操作
        setProxies(proxies.filter(p => p._id !== proxyId));
        toast({
          title: '删除成功',
          description: '代理IP已成功删除'
        });
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除代理IP时出错',
          variant: 'destructive'
        });
      }
    }
  };
  const handleTestProxy = async proxyId => {
    try {
      // 模拟测试操作
      toast({
        title: '测试完成',
        description: '代理IP连接测试成功'
      });
    } catch (error) {
      toast({
        title: '测试失败',
        description: error.message || '代理IP连接测试失败',
        variant: 'destructive'
      });
    }
  };
  const getStatusBadge = status => {
    const statusConfig = {
      'active': {
        label: '活跃',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      'inactive': {
        label: '非活跃',
        className: 'bg-gray-100 text-gray-800',
        icon: Activity
      },
      'error': {
        label: '错误',
        className: 'bg-red-100 text-red-800',
        icon: AlertCircle
      }
    };
    const config = statusConfig[status] || statusConfig['inactive'];
    const Icon = config.icon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>;
  };
  const getTypeBadge = type => {
    const typeConfig = {
      'http': {
        label: 'HTTP',
        className: 'bg-blue-100 text-blue-800'
      },
      'https': {
        label: 'HTTPS',
        className: 'bg-green-100 text-green-800'
      },
      'socks5': {
        label: 'SOCKS5',
        className: 'bg-purple-100 text-purple-800'
      }
    };
    const config = typeConfig[type] || typeConfig['http'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };
  if (loading) {
    return <AppLayout currentPage="proxy" onPageChange={handlePageChange} title="代理IP管理" subtitle="管理和监控代理IP服务">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="proxy" onPageChange={handlePageChange} title="代理IP管理" subtitle="管理和监控代理IP服务" onRefresh={fetchProxies}>
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="搜索IP地址或位置..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">非活跃</SelectItem>
                  <SelectItem value="error">错误</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="socks5">SOCKS5</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                添加代理
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总代理数</p>
                  <p className="text-2xl font-bold text-gray-900">{proxies.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃代理</p>
                  <p className="text-2xl font-bold text-gray-900">{proxies.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">错误代理</p>
                  <p className="text-2xl font-bold text-gray-900">{proxies.filter(p => p.status === 'error').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总使用次数</p>
                  <p className="text-2xl font-bold text-gray-900">{proxies.reduce((sum, p) => sum + (p.usage_count || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 代理列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>代理IP列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  导入
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  批量测试
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">IP地址</th>
                    <th className="text-left py-3 px-4">端口</th>
                    <th className="text-left py-3 px-4">类型</th>
                    <th className="text-left py-3 px-4">位置</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">速度</th>
                    <th className="text-left py-3 px-4">使用次数</th>
                    <th className="text-left py-3 px-4">最后检查</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {proxies.map(proxy => <tr key={proxy._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{proxy.ip_address}</td>
                      <td className="py-3 px-4">{proxy.port}</td>
                      <td className="py-3 px-4">{getTypeBadge(proxy.type)}</td>
                      <td className="py-3 px-4">{proxy.location}</td>
                      <td className="py-3 px-4">{getStatusBadge(proxy.status)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${proxy.status === 'active' ? 'text-green-600' : proxy.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                          {proxy.speed}
                        </span>
                      </td>
                      <td className="py-3 px-4">{proxy.usage_count}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(proxy.last_check).toLocaleString('zh-CN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleTestProxy(proxy._id)}>
                            测试
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(proxy._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, proxies.length)} 条，共 {proxies.length} 条
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  上一页
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
}