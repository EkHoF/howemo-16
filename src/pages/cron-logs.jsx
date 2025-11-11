// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Download, Calendar, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function CronLogsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'cron_job_exec_logs',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            exec_time: 'desc'
          }],
          pageSize: pageSize,
          pageNumber: currentPage,
          getCount: true
        }
      });
      if (response.records) {
        setLogs(response.records);
        setTotalPages(Math.ceil(response.total / pageSize));
      }
    } catch (error) {
      console.error('获取执行日志失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取执行日志',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLogs();
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
    fetchLogs();
  };
  const getStatusBadge = status => {
    const statusConfig = {
      'success': {
        label: '成功',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      'failed': {
        label: '失败',
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      'running': {
        label: '运行中',
        className: 'bg-blue-100 text-blue-800',
        icon: Clock
      },
      'timeout': {
        label: '超时',
        className: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle
      }
    };
    const config = statusConfig[status] || statusConfig['failed'];
    const Icon = config.icon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>;
  };
  const formatDuration = duration => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };
  if (loading) {
    return <AppLayout currentPage="cron" onPageChange={handlePageChange} title="执行日志" subtitle="查看定时任务执行记录">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="cron" onPageChange={handlePageChange} title="执行日志" subtitle="查看定时任务执行记录" onRefresh={fetchLogs}>
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="搜索任务名称或日志..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="running">运行中</SelectItem>
                  <SelectItem value="timeout">超时</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="任务筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部任务</SelectItem>
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
                <Download className="w-4 h-4 mr-2" />
                导出日志
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
                  <p className="text-sm font-medium text-gray-600">总执行次数</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">成功执行</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.filter(l => l.status === 'success').length}</p>
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
                  <p className="text-sm font-medium text-gray-600">执行失败</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.filter(l => l.status === 'failed').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均耗时</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {logs.length > 0 ? formatDuration(logs.reduce((sum, log) => sum + (log.duration || 0), 0) / logs.length) : '0ms'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 日志列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>执行日志</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
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
                    <th className="text-left py-3 px-4">执行时间</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">耗时</th>
                    <th className="text-left py-3 px-4">执行结果</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => <tr key={log._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{log.job_name || 'Unknown Job'}</div>
                          <div className="text-gray-500 text-xs">ID: {log.job_id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(log.exec_time).toLocaleString('zh-CN')}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatDuration(log.duration)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <div className="text-sm truncate">{log.result_message || log.error_message || 'No result'}</div>
                          {log.error_message && <div className="text-red-600 text-xs mt-1">Error: {log.error_message}</div>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            查看详情
                          </Button>
                          {log.status === 'failed' && <Button variant="outline" size="sm">
                              重试
                            </Button>}
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, logs.length)} 条，共 {logs.length} 条
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