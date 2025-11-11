// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Calendar, Play, Pause, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function CronJobsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'cron_jobs',
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
        setJobs(response.records);
        setTotalPages(Math.ceil(response.total / pageSize));
      }
    } catch (error) {
      console.error('获取定时任务数据失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取定时任务数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobs();
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
    if (pageMap[pageId] && pageMap[pageId] !== 'cron-jobs') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  const handleSearch = () => {
    fetchJobs();
  };
  const handleDelete = async jobId => {
    if (confirm('确定要删除这个定时任务吗？')) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'cron_jobs',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: jobId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '定时任务已成功删除'
        });
        fetchJobs();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除定时任务时出错',
          variant: 'destructive'
        });
      }
    }
  };
  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await $w.cloud.callDataSource({
        dataSourceName: 'cron_jobs',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: newStatus
          },
          filter: {
            where: {
              _id: {
                $eq: jobId
              }
            }
          }
        }
      });
      toast({
        title: '状态更新成功',
        description: `任务已${newStatus === 'active' ? '启用' : '禁用'}`
      });
      fetchJobs();
    } catch (error) {
      toast({
        title: '状态更新失败',
        description: error.message || '更新任务状态时出错',
        variant: 'destructive'
      });
    }
  };
  const getStatusBadge = status => {
    const statusConfig = {
      'active': {
        label: '运行中',
        className: 'bg-green-100 text-green-800',
        icon: Play
      },
      'inactive': {
        label: '已停止',
        className: 'bg-gray-100 text-gray-800',
        icon: Pause
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
  if (loading) {
    return <AppLayout currentPage="cron" onPageChange={handlePageChange} title="定时任务" subtitle="配置和管理定时任务">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="cron" onPageChange={handlePageChange} title="定时任务" subtitle="配置和管理定时任务" onRefresh={fetchJobs}>
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
                  <SelectItem value="active">运行中</SelectItem>
                  <SelectItem value="inactive">已停止</SelectItem>
                  <SelectItem value="error">错误</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="data_sync">数据同步</SelectItem>
                  <SelectItem value="report">报告生成</SelectItem>
                  <SelectItem value="cleanup">清理任务</SelectItem>
                  <SelectItem value="notification">通知任务</SelectItem>
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
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">运行中</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已停止</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'inactive').length}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Pause className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">错误任务</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'error').length}</p>
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
              <CardTitle>定时任务列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
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
                    <th className="text-left py-3 px-4">任务名称</th>
                    <th className="text-left py-3 px-4">类型</th>
                    <th className="text-left py-3 px-4">调度规则</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">下次执行</th>
                    <th className="text-left py-3 px-4">最后执行</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => <tr key={job._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{job.job_name || 'Unknown Job'}</div>
                          <div className="text-gray-500 text-xs">{job.description || 'No description'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {job.job_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {job.cron_expression || 'N/A'}
                        </code>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {job.next_run_time ? new Date(job.next_run_time).toLocaleString('zh-CN') : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {job.last_run_time ? new Date(job.last_run_time).toLocaleString('zh-CN') : '从未执行'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(job._id, job.status)}>
                            {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(job._id)}>
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
                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, jobs.length)} 条，共 {jobs.length} 条
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