// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, RefreshCw, Clock, CheckCircle, AlertCircle, PlayCircle, PauseCircle } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function TasksPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'nurturing_tasks',
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
        setTasks(response.records);
        setTotalPages(Math.ceil(response.total / pageSize));
      }
    } catch (error) {
      console.error('获取任务数据失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取任务数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
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
    if (pageMap[pageId] && pageMap[pageId] !== 'tasks') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  const handleSearch = () => {
    // 实现搜索逻辑
    fetchTasks();
  };
  const handleDelete = async taskId => {
    if (confirm('确定要删除这个任务吗？')) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'nurturing_tasks',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: taskId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '任务已成功删除'
        });
        fetchTasks();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除任务时出错',
          variant: 'destructive'
        });
      }
    }
  };
  const getStatusBadge = status => {
    const statusConfig = {
      'pending': {
        label: '待执行',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      'running': {
        label: '执行中',
        className: 'bg-blue-100 text-blue-800',
        icon: PlayCircle
      },
      'completed': {
        label: '已完成',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      'failed': {
        label: '失败',
        className: 'bg-red-100 text-red-800',
        icon: AlertCircle
      },
      'paused': {
        label: '已暂停',
        className: 'bg-gray-100 text-gray-800',
        icon: PauseCircle
      }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>;
  };
  if (loading) {
    return <AppLayout currentPage="tasks" onPageChange={handlePageChange} title="任务管理" subtitle="查看和管理任务执行情况">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="tasks" onPageChange={handlePageChange} title="任务管理" subtitle="查看和管理任务执行情况" onRefresh={fetchTasks}>
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="搜索任务名称或描述..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待执行</SelectItem>
                  <SelectItem value="running">执行中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="nurturing">养号任务</SelectItem>
                  <SelectItem value="posting">发帖任务</SelectItem>
                  <SelectItem value="interaction">互动任务</SelectItem>
                  <SelectItem value="monitoring">监控任务</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                创建任务
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
                  <p className="text-sm font-medium text-gray-600">总任务数</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">执行中</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'running').length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已完成</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</p>
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
                  <p className="text-sm font-medium text-gray-600">失败任务</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'failed').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 任务列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>任务列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新状态
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">任务名称</th>
                    <th className="text-left py-3 px-4">类型</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">进度</th>
                    <th className="text-left py-3 px-4">创建时间</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => <tr key={task._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{task.task_name || 'Unknown Task'}</div>
                          <div className="text-gray-500 text-xs">{task.description || 'No description'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {task.task_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{
                          width: `${task.progress || 0}%`
                        }}></div>
                          </div>
                          <span className="text-xs">{task.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{new Date(task.created_at).toLocaleDateString('zh-CN')}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(task._id)}>
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
                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, tasks.length)} 条，共 {tasks.length} 条
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