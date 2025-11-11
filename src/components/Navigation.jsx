// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, Users, Clock, Shield, Settings, MessageCircle, LogOut, Calendar } from 'lucide-react';

export function Navigation({
  currentPage,
  onPageChange
}) {
  const menuItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home
  }, {
    id: 'accounts',
    label: 'Accounts',
    icon: Users
  }, {
    id: 'tasks',
    label: 'Tasks',
    icon: Clock
  }, {
    id: 'risk',
    label: 'Risk Management',
    icon: Shield
  }, {
    id: 'chat',
    label: 'Chat Management',
    icon: MessageCircle
  }, {
    id: 'system',
    label: 'System Management',
    icon: Settings
  }, {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];
  return <nav className="bg-white shadow-sm border-b">
          <div className="px-6">
            <div className="flex space-x-8">
              {menuItems.map(item => {
          const Icon = item.icon;
          return <Button key={item.id} variant={currentPage === item.id ? 'default' : 'ghost'} className="flex items-center space-x-2 py-6" onClick={() => onPageChange(item.id)}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>;
        })}
            </div>
          </div>
        </nav>;
}