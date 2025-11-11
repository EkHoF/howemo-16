// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, Users, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AccountsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    platform: '',
    status: 'active',
    riskLevel: 'low'
  });

  // 获取账号数据
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'overseas_accounts',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100
        }
      });
      setAccounts(response.records || []);
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

  // 搜索和过滤账号
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username?.toLowerCase().includes(searchTerm.toLowerCase()) || account.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || account.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 添加或更新账号
  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        // 更新账号
        await $w.cloud.callDataSource({
          dataSourceName: 'overseas_accounts',
          methodName: 'wedaUpdateV2',
          params: {
            data: formData,
            filter: {
              where: {
                _id: {
                  $eq: editingAccount._id
                }
              }
            }
          }
        });
        toast({
          title: '更新成功',
          description: '账号信息已更新'
        });
      } else {
        // 添加新账号
        await $w.cloud.callDataSource({
          dataSourceName: 'overseas_accounts',
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
          description: '新账号已添加'
        });
      }
      setShowAddModal(false);
      setEditingAccount(null);
      setFormData({
        username: '',
        email: '',
        platform: '',
        status: 'active',
        riskLevel: 'low'
      });
      fetchAccounts();
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 删除账号
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
          description: '账号已删除'
        });
        fetchAccounts();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  // 编辑账号
  const handleEdit = account => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      email: account.email,
      platform: account.platform,
      status: account.status,
      riskLevel: account.riskLevel
    });
    setShowAddModal(true);
  };
  useEffect(() => {
    fetchAccounts();
  }, []);
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">账号管理</h1>
          <p className="text-gray-600">管理海外平台账号信息</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加账号
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input placeholder="搜索用户名或邮箱" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
                <SelectItem value="suspended">已暂停</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 账号列表 */}
      <Card>
        <CardHeader>
          <CardTitle>账号列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">加载中...</div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">用户名</th>
                    <th className="text-left p-4">邮箱</th>
                    <th className="text-left p-4">平台</th>
                    <th className="text-left p-4">状态</th>
                    <th className="text-left p-4">风险等级</th>
                    <th className="text-left p-4">创建时间</th>
                    <th className="text-left p-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map(account => <tr key={account._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {account.username}
                        </div>
                      </td>
                      <td className="p-4">{account.email}</td>
                      <td className="p-4">{account.platform}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${account.status === 'active' ? 'bg-green-100 text-green-800' : account.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                          {account.status === 'active' ? '活跃' : account.status === 'inactive' ? '非活跃' : '已暂停'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {account.riskLevel === 'low' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : account.riskLevel === 'medium' ? <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" /> : <XCircle className="w-4 h-4 text-red-500 mr-1" />}
                          <span className={`text-sm ${account.riskLevel === 'low' ? 'text-green-600' : account.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {account.riskLevel === 'low' ? '低' : account.riskLevel === 'medium' ? '中' : '高'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">{new Date(account.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(account)}>
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
              {filteredAccounts.length === 0 && <div className="text-center py-8 text-gray-500">
                  暂无数据
                </div>}
            </div>}
        </CardContent>
      </Card>

      {/* 添加/编辑账号模态框 */}
      {showAddModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingAccount ? '编辑账号' : '添加账号'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">用户名</label>
                <Input value={formData.username} onChange={e => setFormData({
              ...formData,
              username: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">邮箱</label>
                <Input type="email" value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">平台</label>
                <Select value={formData.platform} onValueChange={value => setFormData({
              ...formData,
              platform: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">状态</label>
                <Select value={formData.status} onValueChange={value => setFormData({
              ...formData,
              status: value
            })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">非活跃</SelectItem>
                    <SelectItem value="suspended">已暂停</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">风险等级</label>
                <Select value={formData.riskLevel} onValueChange={value => setFormData({
              ...formData,
              riskLevel: value
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
              setShowAddModal(false);
              setEditingAccount(null);
              setFormData({
                username: '',
                email: '',
                platform: '',
                status: 'active',
                riskLevel: 'low'
              });
            }}>
                  取消
                </Button>
                <Button onClick={handleSubmit}>
                  {editingAccount ? '更新' : '添加'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}