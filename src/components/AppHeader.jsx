// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Bell, Globe, LogOut, Activity, Clock } from 'lucide-react';

export function AppHeader({
  selectedLanguage,
  onLanguageChange,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onLogout,
  title,
  subtitle,
  showRefresh = true,
  showNotifications = true
}) {
  const languages = [{
    code: 'en-US',
    name: 'English'
  }, {
    code: 'zh-CN',
    name: '中文'
  }, {
    code: 'ja-JP',
    name: '日本語'
  }];
  return <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <Clock className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>

          {showRefresh && <Button variant="outline" size="sm" onClick={onRefresh}>
              <Activity className="w-4 h-4 mr-2" />
              刷新
            </Button>}

          {showNotifications && <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              通知
            </Button>}

          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
    </header>;
}