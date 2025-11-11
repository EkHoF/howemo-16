// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Bell, Globe, LogOut, RefreshCw, Settings } from 'lucide-react';

export function AppLayout({
  children,
  currentPage,
  onPageChange,
  title,
  subtitle,
  onRefresh,
  showNotifications = true
}) {
  const {
    toast
  } = useToast();

  // 清除所有认证相关的存储
  const clearAuthStorage = () => {
    // 清除localStorage中的认证信息
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('selectedLanguage');
    localStorage.removeItem('login_attempts_backup');

    // 清除sessionStorage
    sessionStorage.clear();

    // 清除所有cookie
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;";
    });
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      // 调用后端云函数记录退出登录
      try {
        await $w.cloud.callFunction({
          name: 'recordLogout',
          data: {
            timestamp: Date.now()
          }
        });
      } catch (error) {
        console.error('记录退出登录失败:', error);
      }

      // 清除所有认证信息
      clearAuthStorage();
      toast({
        title: '退出成功',
        description: '您已安全退出登录'
      });

      // 跳转到登录页面
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    } catch (error) {
      console.error('退出登录失败:', error);
      toast({
        title: '退出失败',
        description: '退出登录时发生错误',
        variant: 'destructive'
      });
    }
  };

  // 获取用户信息
  const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  };
  const userInfo = getUserInfo();
  return <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">管理系统</span>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {[{
            id: 'dashboard',
            label: '仪表板',
            icon: '📊'
          }, {
            id: 'accounts',
            label: '账号管理',
            icon: '👥'
          }, {
            id: 'tasks',
            label: '任务管理',
            icon: '📋'
          }, {
            id: 'risk',
            label: '风控管理',
            icon: '🛡️'
          }, {
            id: 'chat',
            label: '聊天管理',
            icon: '💬'
          }, {
            id: 'cron',
            label: '定时任务',
            icon: '⏰'
          }, {
            id: 'proxy',
            label: '代理IP管理',
            icon: '🌐'
          }, {
            id: 'system',
            label: '系统管理',
            icon: '⚙️'
          }].map(item => <Button key={item.id} variant={currentPage === item.id ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => onPageChange(item.id)}>
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>)}
          </div>
        </nav>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {userInfo && <div className="text-sm text-gray-600">
                  <span className="font-medium">{userInfo.username}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {userInfo.role === 'admin' ? '管理员' : '操作员'}
                  </span>
                </div>}
              
              {onRefresh && <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>}
              
              {showNotifications && <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  通知
                </Button>}
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>;
}