// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Send, Bot, User, Paperclip, Smile, MoreVertical } from 'lucide-react';

// @ts-ignore;
import { AppLayout } from '@/components/AppLayout';
export default function ChatDetailPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const conversationId = props.$w.page.dataset.params.conversationId;
  const fetchConversation = async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'chat_conversations',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: conversationId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (response) {
        setConversation(response);
        await fetchMessages();
      }
    } catch (error) {
      console.error('获取对话详情失败:', error);
      toast({
        title: '数据加载失败',
        description: error.message || '无法获取对话详情',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'chat_messages',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          filter: {
            where: {
              conversation_id: {
                $eq: conversationId
              }
            }
          },
          orderBy: [{
            created_at: 'asc'
          }],
          pageSize: 100
        }
      });
      if (response.records) {
        setMessages(response.records);
      }
    } catch (error) {
      console.error('获取消息失败:', error);
    }
  };
  useEffect(() => {
    fetchConversation();
  }, [conversationId]);
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
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'chat_messages',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            conversation_id: conversationId,
            message_content: newMessage.trim(),
            sender_type: 'human',
            sender_name: 'User'
          }
        }
      });
      setNewMessage('');
      await fetchMessages();
      toast({
        title: '发送成功',
        description: '消息已发送'
      });
    } catch (error) {
      toast({
        title: '发送失败',
        description: error.message || '发送消息时出错',
        variant: 'destructive'
      });
    }
  };
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return <AppLayout currentPage="chat" onPageChange={handlePageChange} title="对话详情" subtitle={conversation?.title || '加载中...'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">数据加载中...</p>
          </div>
        </div>
      </AppLayout>;
  }
  return <AppLayout currentPage="chat" onPageChange={handlePageChange} title="对话详情" subtitle={conversation?.title || '未知对话'} showNotifications={false}>
      <div className="h-full flex flex-col" style={{
      height: 'calc(100vh - 200px)'
    }}>
        {/* 对话头部 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => $w.utils.navigateTo({
                pageId: 'chat-list',
                params: {}
              })}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
                <div>
                  <h3 className="font-semibold">{conversation?.title || '未知对话'}</h3>
                  <p className="text-sm text-gray-500">
                    {conversation?.type === 'bot' ? '机器人对话' : '人工对话'} • {messages.length} 条消息
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 消息列表 */}
        <Card className="flex-1 mb-4">
          <CardContent className="p-4 h-full overflow-y-auto">
            <div className="space-y-4">
              {messages.map(message => <div key={message._id} className={`flex ${message.sender_type === 'human' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.sender_type === 'human' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender_type === 'human' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                      {message.sender_type === 'human' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div>
                      <div className={`px-4 py-2 rounded-lg ${message.sender_type === 'human' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        <p className="text-sm">{message.message_content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {message.sender_name || 'Unknown'} • {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>)}
              {messages.length === 0 && <div className="text-center text-gray-500 py-8">
                  <p>暂无消息</p>
                  <p className="text-sm">开始发送第一条消息吧</p>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* 输入区域 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input placeholder="输入消息..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }} className="flex-1" />
              <Button variant="ghost" size="sm">
                <Smile className="w-4 h-4" />
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4 mr-2" />
                发送
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
}