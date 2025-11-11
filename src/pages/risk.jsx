// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, Shield, AlertTriangle, CheckCircle, XCircle, Settings, Activity } from 'lucide-react';

export default function RiskPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [rules, setRules] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddTriggerModal, setShowAddTriggerModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    type: 'login',
    condition: '',
    action: 'alert',
    severity: 'medium',
    enabled: true
  });
  const [triggerFormData, setTriggerFormData] = useState({
    name: '',
    description: '',
    ruleId: '',
    threshold: 5,
    timeWindow: 60,
    action: 'block'
  });

  // 获取风控规则数据
  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'risk_rules',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100
        }
      });
      setRules(response.records || []);
    } catch (error) {
      toast({
        title: '获取规则失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取触发器数据
  const fetchTriggers = async () => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'risk_triggers',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100
        }
      });
      setTriggers(response.records || []);
    } catch (error) {
      toast({
        title: '获取触发器失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 搜索和过滤规则
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) || rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || rule.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // 添加或更新风控规则
  const handleRuleSubmit = async () => {
    try {
      if (editingRule) {
        // 更新规则
        await $w.cloud.callDataSource({
          dataSourceName: 'risk_rules',
          methodName: 'wedaUpdateV2',
          params: {
            data: ruleFormData,
            filter: {
              where: {
                _id: {
                  $eq: editingRule._id
                }
              }
            }
          }
        });
        toast({
          title: '更新成功',
          description: '风控规则已更新'
        });
      } else {
        // 添加新规则
        await $w.cloud.callDataSource({
          dataSourceName: 'risk_rules',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              ...ruleFormData,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          }
        });
        toast({
          title: '添加成功',
          description: '新风控规则已添加'
        });
      }
      setShowAddRuleModal(false);
      setEditingRule(null);
      setRuleFormData({
        name: '',
        description: '',
        type: 'login',
        condition: '',
        action: 'alert',
        severity: 'medium',
        enabled: true
      });
      fetchRules();
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 添加或更新触发器
  const handleTriggerSubmit = async () => {
    try {
      if (editingTrigger) {
        // 更新触发器
        await $w.cloud.callDataSource({
          dataSourceName: 'risk_triggers',
          methodName: 'wedaUpdateV2',
          params: {
            data: triggerFormData,
            filter: {
              where: {
                _id: {
                  $eq: editingTrigger._id
                }
              }
            }
          }
        });
        toast({
          title: '更新成功',
          description: '触发器已更新'
        });
      } else {
        // 添加新触发器
        await $w.cloud.callDataSource({
          dataSourceName: 'risk_triggers',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              ...triggerFormData,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          }
        });
        toast({
          title: '添加成功',
          description: '新触发器已添加'
        });
      }
      setShowAddTriggerModal(false);
      setEditingTrigger(null);
      setTriggerFormData({
        name: '',
        description: '',
        ruleId: '',
        threshold: 5,
        timeWindow: 60,
        action: 'block'
      });
      fetchTriggers();
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 删除规则
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
          description: '风控规则已删除'
        });
        fetchRules();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  // 删除触发器
  const handleDeleteTrigger = async triggerId => {
    if (confirm('确定要删除这个触发器吗？')) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'risk_triggers',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: triggerId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '触发器已删除'
        });
        fetchTriggers();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  // 编辑规则
  const handleEditRule = rule => {
    setEditingRule(rule);
    setRuleFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      condition: rule.condition,
      action: rule.action,
      severity: rule.severity,
      enabled: rule.enabled
    });
    setShowAddRuleModal(true);
  };

  // 编辑触发器
  const handleEditTrigger = trigger => {
    setEditingTrigger(trigger);
    setTriggerFormData({
      name: trigger.name,
      description: trigger.description,
      ruleId: trigger.ruleId,
      threshold: trigger.threshold,
      timeWindow: trigger.timeWindow,
      action: trigger.action
    });
    setShowAddTriggerModal(true);
  };

  // 切换规则状态
  const toggleRuleStatus = async (ruleId, enabled) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'risk_rules',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            enabled: enabled,
            updatedAt: Date.now()
          },
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
        title: enabled ? '规则已启用' : '规则已禁用',
        description: `风控规则${enabled ? '启用' : '禁用'}成功`
      });
      fetchRules();
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    fetchRules();
    fetchTriggers();
  }, []);
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">风控管理</h1>
          <p className="text-gray-600">管理风险控制规则和触发器</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddRuleModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加规则
          </Button>
          <Button onClick={() => setShowAddTriggerModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加触发器
          </Button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input placeholder="搜索规则名称或描述" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="login">登录风控</SelectItem>
                <SelectItem value="operation">操作风控</SelectItem>
                <SelectItem value="content">内容风控</SelectItem>
                <SelectItem value="behavior">行为风控</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 风控规则列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            风控规则
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">加载中...</div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">规则名称</th>
                    <th className="text-left p-4">类型</th>
                    <th className="text-left p-4">严重程度</th>
                    <th className="text-left p-4">动作</th>
                    <th className="text-left p-4">状态</th>
                    <th className="text-left p-4">创建时间</th>
                    <th className="text-left p-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map(rule => <tr key={rule._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-gray-600">{rule.description}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${rule.type === 'login' ? 'bg-blue-100 text-blue-800' : rule.type === 'operation' ? 'bg-green-100 text-green-800' : rule.type === 'content' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                          {rule.type === 'login' ? '登录风控' : rule.type === 'operation' ? '操作风控' : rule.type === 'content' ? '内容风控' : '行为风控'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {rule.severity === 'low' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : rule.severity === 'medium' ? <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" /> : <XCircle className="w-4 h-4 text-red-500 mr-1" />}
                          <span className={`text-sm ${rule.severity === 'low' ? 'text-green-600' : rule.severity === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {rule.severity === 'low' ? '低' : rule.severity === 'medium' ? '中' : '高'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${rule.action === 'alert' ? 'bg-yellow-100 text-yellow-800' : rule.action === 'block' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {rule.action === 'alert' ? '告警' : rule.action === 'block' ? '阻止' : '记录'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button variant={rule.enabled ? "default" : "outline"} size="sm" onClick={() => toggleRuleStatus(rule._id, !rule.enabled)}>
                          {rule.enabled ? '已启用' : '已禁用'}
                        </Button>
                      </td>
                      <td className="p-4">{new Date(rule.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
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
              {filteredRules.length === 0 && <div className="text-center py-8 text-gray-500">
                  暂无数据
                </div>}
            </div>}
        </CardContent>
      </Card>

      {/* 触发器列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            触发器
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">触发器名称</th>
                  <th className="text-left p-4">关联规则</th>
                  <th className="text-left p-4">阈值</th>
                  <th className="text-left p-4">时间窗口</th>
                  <th className="text-left p-4">动作</th>
                  <th className="text-left p-4">创建时间</th>
                  <th className="text-left p-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {triggers.map(trigger => <tr key={trigger._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{trigger.name}</div>
                        <div className="text-sm text-gray-600">{trigger.description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {rules.find(r => r._id === trigger.ruleId)?.name || '未知规则'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {trigger.threshold} 次
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {trigger.timeWindow} 分钟
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${trigger.action === 'block' ? 'bg-red-100 text-red-800' : trigger.action === 'alert' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {trigger.action === 'block' ? '阻止' : trigger.action === 'alert' ? '告警' : '记录'}
                      </span>
                    </td>
                    <td className="p-4">{new Date(trigger.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditTrigger(trigger)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTrigger(trigger._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
            {triggers.length === 0 && <div className="text-center py-8 text-gray-500">
                暂无数据
              </div>}
          </div>
        </CardContent>
      </Card>

      {/* 添加/编辑规则模态框 */}
      {showAddRuleModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingRule ? '编辑规则' : '添加规则'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">规则名称</label>
                <Input value={ruleFormData.name} onChange={e => setRuleFormData({
              ...ruleFormData,
              name: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">规则描述</label>
                <Input value={ruleFormData.description} onChange={e => setRuleFormData({
              ...ruleFormData,
              description: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">规则类型</label>
                <Select value={ruleFormData.type} onValueChange={value => setRuleFormData({
              ...ruleFormData,
              type: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="login">登录风控</SelectItem>
                    <SelectItem value="operation">操作风控</SelectItem>
                    <SelectItem value="content">内容风控</SelectItem>
                    <SelectItem value="behavior">行为风控</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">触发条件</label>
                <Input value={ruleFormData.condition} onChange={e => setRuleFormData({
              ...ruleFormData,
              condition: e.target.value
            })} placeholder="例如：登录失败次数 > 5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">动作</label>
                <Select value={ruleFormData.action} onValueChange={value => setRuleFormData({
              ...ruleFormData,
              action: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">告警</SelectItem>
                    <SelectItem value="block">阻止</SelectItem>
                    <SelectItem value="log">记录</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">严重程度</label>
                <Select value={ruleFormData.severity} onValueChange={value => setRuleFormData({
              ...ruleFormData,
              severity: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="enabled" checked={ruleFormData.enabled} onChange={e => setRuleFormData({
              ...ruleFormData,
              enabled: e.target.checked
            })} />
                <label htmlFor="enabled" className="text-sm font-medium">启用规则</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
              setShowAddRuleModal(false);
              setEditingRule(null);
              setRuleFormData({
                name: '',
                description: '',
                type: 'login',
                condition: '',
                action: 'alert',
                severity: 'medium',
                enabled: true
              });
            }}>
                  取消
                </Button>
                <Button onClick={handleRuleSubmit}>
                  {editingRule ? '更新' : '添加'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}

      {/* 添加/编辑触发器模态框 */}
      {showAddTriggerModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingTrigger ? '编辑触发器' : '添加触发器'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">触发器名称</label>
                <Input value={triggerFormData.name} onChange={e => setTriggerFormData({
              ...triggerFormData,
              name: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">触发器描述</label>
                <Input value={triggerFormData.description} onChange={e => setTriggerFormData({
              ...triggerFormData,
              description: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">关联规则</label>
                <Select value={triggerFormData.ruleId} onValueChange={value => setTriggerFormData({
              ...triggerFormData,
              ruleId: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rules.map(rule => <SelectItem key={rule._id} value={rule._id}>
                        {rule.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">阈值</label>
                <Input type="number" value={triggerFormData.threshold} onChange={e => setTriggerFormData({
              ...triggerFormData,
              threshold: parseInt(e.target.value)
            })} placeholder="触发次数" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">时间窗口（分钟）</label>
                <Input type="number" value={triggerFormData.timeWindow} onChange={e => setTriggerFormData({
              ...triggerFormData,
              timeWindow: parseInt(e.target.value)
            })} placeholder="时间窗口" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">动作</label>
                <Select value={triggerFormData.action} onValueChange={value => setTriggerFormData({
              ...triggerFormData,
              action: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">阻止</SelectItem>
                    <SelectItem value="alert">告警</SelectItem>
                    <SelectItem value="log">记录</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
              setShowAddTriggerModal(false);
              setEditingTrigger(null);
              setTriggerFormData({
                name: '',
                description: '',
                ruleId: '',
                threshold: 5,
                timeWindow: 60,
                action: 'block'
              });
            }}>
                  取消
                </Button>
                <Button onClick={handleTriggerSubmit}>
                  {editingTrigger ? '更新' : '添加'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}