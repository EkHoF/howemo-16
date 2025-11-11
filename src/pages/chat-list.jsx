// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, MessageCircle, Users, Bot, Send } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function ChatListPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'chat_conversations',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            last_message_time: 'desc'
          }],
          pageSize: pageSize,
          pageNumber: currentPage,
          getCount: true
        }
      });
      if (response.records) {
        setConversations(response.records);
        setTotalPages(Math.ceil(response.total / pageSize));
      }
    } catch (error) {
      console.error('获取对话数据失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取对话数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchConversations();
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
    if (pageMap[pageId] && pageMap[pageId] !== 'chat-list') {
      $w.utils.navigateTo({
        pageId: pageMap[pageId],
        params: {}
      });
    }
  };
  const handleSearch = () => {
    fetchConversations();
  };
  const handleDelete = async conversationId => {
    if (confirm('确定要删除这个对话吗？')) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'chat_conversations',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: conversationId
                }
              }
            }
          }
        });
        toast({
          title: '删除成功',
          description: '对话已成功删除'
        });
        fetchConversations();
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message || '删除对话时出错',
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
      'archived': {
        label: '已归档',
        className: 'bg-yellow-100 text-yellow-800'
      }
    };
    const config = statusConfig[status] || statusConfig['inactive'];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>;
  };
  const getTypeBadge = type => {
    const typeConfig = {
      'human': {
        label: '人工',
        className: 'bg-blue-100 text-blue-800',
        icon: Users
      },
      'bot': {
        label: '机器人',
        className: 'bg-purple-100 text-purple-800',
        icon: Bot
      }
    };
    const config = typeConfig[type] || typeConfig['human'];
    const Icon = config.icon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>;
  };
  if (loading) {
    return <AppLayout currentPage="chat" onPageChange={handlePageChange} title="聊天管理" subtitle="管理聊天对话和消息">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="chat" onPageChange={handlePageChange} title="聊天管理" subtitle="管理聊天对话和消息" onRefresh={fetchConversations}>
      <div className="space-y-6">
        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="搜索对话标题或参与者..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
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
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="类型筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="human">人工</SelectItem>
                  <SelectItem value="bot">机器人</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                新建对话
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
                  <p className="text-sm font-medium text-gray-600">总对话数</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃对话</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">机器人对话</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.filter(c => c.type === 'bot').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">今日消息</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 对话列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>对话列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
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
                    <th className="text-left py-3 px-4">对话标题</th>
                    <th className="text-left py-3 px-4">类型</th>
                    <th className="text-left py-3 px-4">参与者</th>
                    <th className="text-left py-3 px-4">消息数</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">最后活动</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map(conversation => <tr key={conversation._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{conversation.title || 'Untitled Conversation'}</div>
                          <div className="text-gray-500 text-xs">{conversation.last_message || 'No messages yet'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getTypeBadge(conversation.type)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
                          <span>{conversation.participants || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{conversation.message_count || 0}</span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(conversation.status)}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(conversation.last_message_time).toLocaleDateString('zh-CN')}
                          <div className="text-gray-500 text-xs">
                            {new Date(conversation.last_message_time).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => {
                        $w.utils.navigateTo({
                          pageId: 'chat-detail',
                          params: {
                            conversationId: conversation._id
                          }
                        });
                      }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(conversation._id)}>
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
                显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, conversations.length)} 条，共 {conversations.length} 条
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