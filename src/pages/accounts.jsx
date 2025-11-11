// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload, RefreshCw, Users, Globe, Shield, Activity } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function AccountsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'overseas_accounts',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            created_at: 'desc'
          }],
          pageSize: pageSize,
          pageNumber: currentPage,
          getCount: true
        }
      });
      if (response.records) {
        setAccounts(response.records);
        setTotalPages(Math.ceil(response.total / pageSize));
      }
    } catch (error) {
      console.error('获取账号数据失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取账号数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAccounts();
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
    if (pageMap[pageId] && pageMap[pageId] !== 'accounts') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  const handleSearch = () => {
    // 实现搜索逻辑
    fetchAccounts();
  };
  const handleDelete = async accountId => {
    if (confirm('确定要删除这个账号吗？')) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'overseas_accounts',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: accountId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '账号已成功删除'
        });
        fetchAccounts();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除账号时出错',
          variant: 'destructive'
        });
      }
    }
  };
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
      },
      'pending': {
        label: '待审核',
        className: 'bg-yellow-100 text-yellow-800'
      }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };
  if (loading) {
    return <AppLayout currentPage="accounts" onPageChange={handlePageChange} title="账号管理" subtitle="管理海外账号信息">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="accounts" onPageChange={handlePageChange} title="账号管理" subtitle="管理海外账号信息" onRefresh={fetchAccounts}>
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="搜索账号名称、邮箱或平台..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
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
                  <SelectItem value="suspended">已暂停</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="平台筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                添加账号
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
                  <p className="text-sm font-medium text-gray-600">总账号数</p>
                  <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">活跃账号</p>
                  <p className="text-2xl font-bold text-gray-900">{accounts.filter(a => a.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平台覆盖</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">风险账号</p>
                  <p className="text-2xl font-bold text-gray-900">{accounts.filter(a => a.status === 'suspended').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 账号列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>账号列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  导入
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">账号名称</th>
                    <th className="text-left py-3 px-4">平台</th>
                    <th className="text-left py-3 px-4">邮箱</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">创建时间</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => <tr key={account._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">{account.account_name || 'Unknown'}</div>
                            <div className="text-gray-500 text-xs">@{account.username || 'unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {account.platform || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{account.email || 'N/A'}</td>
                      <td className="py-3 px-4">{getStatusBadge(account.status)}</td>
                      <td className="py-3 px-4">{new Date(account.created_at).toLocaleDateString('zh-CN')}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(account._id)}>
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
                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, accounts.length)} 条，共 {accounts.length} 条
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