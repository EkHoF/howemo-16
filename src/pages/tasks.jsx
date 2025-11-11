// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, Calendar, Clock, User, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';

export default function TasksPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAccount: '',
    taskType: 'content',
    priority: 'medium',
    scheduledTime: '',
    status: 'pending'
  });

  // 获取任务数据
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'nurturing_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100
        }
      });
      setTasks(response.records || []);
    } catch (error) {
      toast({
        title: '获取数据失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 搜索和过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase()) || task.targetAccount?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 添加或更新任务
  const handleSubmit = async () => {
    try {
      if (editingTask) {
        // 更新任务
        await $w.cloud.callDataSource({
          dataSourceName: 'nurturing_tasks',
          methodName: 'wedaUpdateV2',
          params: {
            data: formData,
            filter: {
              where: {
                _id: {
                  $eq: editingTask._id
                }
              }
            }
          }
        });
        toast({
          title: '更新成功',
          description: '任务信息已更新'
        });
      } else {
        // 添加新任务
        await $w.cloud.callDataSource({
          dataSourceName: 'nurturing_tasks',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              ...formData,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          }
        });
        toast({
          title: '添加成功',
          description: '新任务已添加'
        });
      }
      setShowAddModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        targetAccount: '',
        taskType: 'content',
        priority: 'medium',
        scheduledTime: '',
        status: 'pending'
      });
      fetchTasks();
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 删除任务
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
          description: '任务已删除'
        });
        fetchTasks();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  // 执行任务
  const handleExecute = async taskId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'nurturing_tasks',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'running',
            executedAt: Date.now()
          },
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
        title: '任务已启动',
        description: '任务正在执行中'
      });
      fetchTasks();
    } catch (error) {
      toast({
        title: '启动失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 暂停任务
  const handlePause = async taskId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'nurturing_tasks',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'paused',
            pausedAt: Date.now()
          },
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
        title: '任务已暂停',
        description: '任务执行已暂停'
      });
      fetchTasks();
    } catch (error) {
      toast({
        title: '暂停失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 编辑任务
  const handleEdit = task => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      targetAccount: task.targetAccount,
      taskType: task.taskType,
      priority: task.priority,
      scheduledTime: task.scheduledTime,
      status: task.status
    });
    setShowAddModal(true);
  };
  useEffect(() => {
    fetchTasks();
  }, []);
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">任务管理</h1>
          <p className="text-gray-600">管理账号养号任务</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          创建任务
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input placeholder="搜索任务标题、描述或目标账号" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待执行</SelectItem>
                <SelectItem value="running">执行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">加载中...</div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">任务标题</th>
                    <th className="text-left p-4">目标账号</th>
                    <th className="text-left p-4">任务类型</th>
                    <th className="text-left p-4">优先级</th>
                    <th className="text-left p-4">状态</th>
                    <th className="text-left p-4">计划时间</th>
                    <th className="text-left p-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => <tr key={task._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-600">{task.description}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {task.targetAccount}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${task.taskType === 'content' ? 'bg-blue-100 text-blue-800' : task.taskType === 'interaction' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                          {task.taskType === 'content' ? '内容发布' : task.taskType === 'interaction' ? '互动任务' : '数据采集'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {task.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : task.status === 'running' ? <Play className="w-4 h-4 text-blue-500 mr-1" /> : task.status === 'paused' ? <Pause className="w-4 h-4 text-yellow-500 mr-1" /> : task.status === 'failed' ? <AlertCircle className="w-4 h-4 text-red-500 mr-1" /> : <Clock className="w-4 h-4 text-gray-400 mr-1" />}
                          <span className={`text-sm ${task.status === 'completed' ? 'text-green-600' : task.status === 'running' ? 'text-blue-600' : task.status === 'paused' ? 'text-yellow-600' : task.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                            {task.status === 'pending' ? '待执行' : task.status === 'running' ? '执行中' : task.status === 'completed' ? '已完成' : task.status === 'paused' ? '已暂停' : '失败'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {task.scheduledTime ? new Date(task.scheduledTime).toLocaleString() : '未设置'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {task.status === 'pending' && <Button variant="outline" size="sm" onClick={() => handleExecute(task._id)}>
                              <Play className="w-4 h-4" />
                            </Button>}
                          {task.status === 'running' && <Button variant="outline" size="sm" onClick={() => handlePause(task._id)}>
                              <Pause className="w-4 h-4" />
                            </Button>}
                          <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
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
              {filteredTasks.length === 0 && <div className="text-center py-8 text-gray-500">
                  暂无数据
                </div>}
            </div>}
        </CardContent>
      </Card>

      {/* 添加/编辑任务模态框 */}
      {showAddModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingTask ? '编辑任务' : '创建任务'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">任务标题</label>
                <Input value={formData.title} onChange={e => setFormData({
              ...formData,
              title: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">任务描述</label>
                <Input value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">目标账号</label>
                <Input value={formData.targetAccount} onChange={e => setFormData({
              ...formData,
              targetAccount: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">任务类型</label>
                <Select value={formData.taskType} onValueChange={value => setFormData({
              ...formData,
              taskType: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">内容发布</SelectItem>
                    <SelectItem value="interaction">互动任务</SelectItem>
                    <SelectItem value="data_collection">数据采集</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">优先级</label>
                <Select value={formData.priority} onValueChange={value => setFormData({
              ...formData,
              priority: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">计划执行时间</label>
                <Input type="datetime-local" value={formData.scheduledTime} onChange={e => setFormData({
              ...formData,
              scheduledTime: e.target.value
            })} />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
              setShowAddModal(false);
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                targetAccount: '',
                taskType: 'content',
                priority: 'medium',
                scheduledTime: '',
                status: 'pending'
              });
            }}>
                  取消
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTask ? '更新' : '创建'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}