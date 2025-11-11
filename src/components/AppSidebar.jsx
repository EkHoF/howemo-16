// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, Users, Clock, Shield, MessageCircle, Calendar, Settings, Globe, ChevronLeft, ChevronRight } from 'lucide-react';

export function AppSidebar({
  currentPage,
  onPageChange,
  collapsed,
  onToggleCollapse
}) {
  const menuItems = [{
    id: 'dashboard',
    label: '仪表板',
    icon: Home
  }, {
    id: 'accounts',
    label: '账号管理',
    icon: Users
  }, {
    id: 'tasks',
    label: '任务管理',
    icon: Clock
  }, {
    id: 'risk',
    label: '风控管理',
    icon: Shield
  }, {
    id: 'chat',
    label: '聊天管理',
    icon: MessageCircle
  }, {
    id: 'cron',
    label: '定时任务',
    icon: Calendar
  }, {
    id: 'proxy',
    label: '代理IP管理',
    icon: Globe
  }, {
    id: 'system',
    label: '系统管理',
    icon: Settings
  }];
  return <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-lg">管理系统</span>
            </div>}
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="p-2">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map(item => {
          const Icon = item.icon;
          return <Button key={item.id} variant={currentPage === item.id ? 'default' : 'ghost'} className={`w-full justify-start ${collapsed ? 'px-2' : 'px-4'}`} onClick={() => onPageChange(item.id)}>
                <Icon className="w-4 h-4" />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>;
        })}
        </div>
      </nav>
    </div>;
}