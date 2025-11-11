// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Shield, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function RiskPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [rules, setRules] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'risk_rules',
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
        setRules(response.records);
        setTotalPages(Math.ceil(response.total / pageSize));
      }
    } catch (error) {
      console.error('获取风控规则失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取风控规则',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchTriggers = async () => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'risk_triggers',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            trigger_time: 'desc'
          }],
          pageSize: 50
        }
      });
      if (response.records) {
        setTriggers(response.records);
      }
    } catch (error) {
      console.error('获取风控触发记录失败:', error);
    }
  };
  useEffect(() => {
    if (activeTab === 'rules') {
      fetchRules();
    } else {
      fetchTriggers();
    }
  }, [activeTab, currentPage]);
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
    if (pageMap[pageId] && pageMap[pageId] !== 'risk') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  const handleSearch = () => {
    if (activeTab === 'rules') {
      fetchRules();
    } else {
      fetchTriggers();
    }
  };
  const handleDeleteRule = async ruleId => {
    if (confirm('确定要删除这个风控规则吗？')) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'risk_rules',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: ruleId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '风控规则已成功删除'
        });
        fetchRules();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除风控规则时出错',
          variant: 'destructive'
        });
      }
    }
  };
  const getSeverityBadge = severity => {
    const severityConfig = {
      'high': {
        label: '高',
        className: 'bg-red-100 text-red-800'
      },
      'medium': {
        label: '中',
        className: 'bg-yellow-100 text-yellow-800'
      },
      'low': {
        label: '低',
        className: 'bg-green-100 text-green-800'
      }
    };
    const config = severityConfig[severity] || severityConfig['medium'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };
  const getStatusBadge = status => {
    const statusConfig = {
      'active': {
        label: '启用',
        className: 'bg-green-100 text-green-800'
      },
      'inactive': {
        label: '禁用',
        className: 'bg-gray-100 text-gray-800'
      }
    };
    const config = statusConfig[status] || statusConfig['inactive'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };
  if (loading) {
    return <AppLayout currentPage="risk" onPageChange={handlePageChange} title="风控管理" subtitle="监控和管理风险规则">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="risk" onPageChange={handlePageChange} title="风控管理" subtitle="监控和管理风险规则" onRefresh={() => activeTab === 'rules' ? fetchRules() : fetchTriggers()}>
      <div className="space-y-6">
        {/* 标签页切换 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Button variant={activeTab === 'rules' ? 'default' : 'outline'} onClick={() => setActiveTab('rules')}>
                <Shield className="w-4 h-4 mr-2" />
                风控规则
              </Button>
              <Button variant={activeTab === 'triggers' ? 'default' : 'outline'} onClick={() => setActiveTab('triggers')}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                触发记录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder={activeTab === 'rules' ? "搜索规则名称或描述..." : "搜索触发记录..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              {activeTab === 'rules' && <>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="严重程度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部级别</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="low">低</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="状态筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </>}
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              {activeTab === 'rules' && <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  创建规则
                </Button>}
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总规则数</p>
                  <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">启用规则</p>
                  <p className="text-2xl font-bold text-gray-900">{rules.filter(r => r.status === 'active').length}</p>
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
                  <p className="text-sm font-medium text-gray-600">今日触发</p>
                  <p className="text-2xl font-bold text-gray-900">{triggers.filter(t => {
                    const today = new Date().toDateString();
                    return new Date(t.trigger_time).toDateString() === today;
                  }).length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">高风险触发</p>
                  <p className="text-2xl font-bold text-gray-900">{triggers.filter(t => t.severity === 'high').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 内容区域 */}
        {activeTab === 'rules' ? <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>风控规则列表</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    批量操作
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">规则名称</th>
                      <th className="text-left py-3 px-4">类型</th>
                      <th className="text-left py-3 px-4">严重程度</th>
                      <th className="text-left py-3 px-4">状态</th>
                      <th className="text-left py-3 px-4">触发次数</th>
                      <th className="text-left py-3 px-4">创建时间</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map(rule => <tr key={rule._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{rule.rule_name || 'Unknown Rule'}</div>
                            <div className="text-gray-500 text-xs">{rule.description || 'No description'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {rule.rule_type || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getSeverityBadge(rule.severity)}</td>
                        <td className="py-3 px-4">{getStatusBadge(rule.status)}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{rule.trigger_count || 0}</span>
                        </td>
                        <td className="py-3 px-4">{new Date(rule.created_at).toLocaleDateString('zh-CN')}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule._id)}>
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
                  显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, rules.length)} 条，共 {rules.length} 条
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
          </Card> : <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>触发记录</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    导出
                  </Button>
                  <Button variant="outline" size="sm">
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
                      <th className="text-left py-3 px-4">规则名称</th>
                      <th className="text-left py-3 px-4">触发对象</th>
                      <th className="text-left py-3 px-4">严重程度</th>
                      <th className="text-left py-3 px-4">触发时间</th>
                      <th className="text-left py-3 px-4">处理状态</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {triggers.map(trigger => <tr key={trigger._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{trigger.rule_name || 'Unknown Rule'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{trigger.target_account || 'Unknown'}</div>
                            <div className="text-gray-500 text-xs">{trigger.target_platform || 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getSeverityBadge(trigger.severity)}</td>
                        <td className="py-3 px-4">{new Date(trigger.trigger_time).toLocaleString('zh-CN')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${trigger.handled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {trigger.handled ? '已处理' : '待处理'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!trigger.handled && <Button variant="outline" size="sm">
                                <CheckCircle className="w-4 h-4" />
                              </Button>}
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>}
      </div>
    </AppLayout>;
}