// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// @ts-ignore;
import { AppSidebar } from './AppSidebar';
// @ts-ignore;
import { AppHeader } from './AppHeader';
// @ts-ignore;

export function AppLayout({
  children,
  currentPage,
  onPageChange,
  title,
  subtitle,
  onRefresh,
  showRefresh = true,
  showNotifications = true
}) {
  const {
    toast
  } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
  const [timeRange, setTimeRange] = useState('7d');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleLanguageChange = languageCode => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    toast({
      title: 'Language Changed',
      description: `Language changed to ${languageCode}`
    });
  };
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    window.location.href = '/login';
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('language');
    const savedLanguage = langFromUrl || localStorage.getItem('selectedLanguage') || 'zh-CN';
    setSelectedLanguage(savedLanguage);
  }, []);
  return <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar currentPage={currentPage} onPageChange={onPageChange} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} timeRange={timeRange} onTimeRangeChange={setTimeRange} onRefresh={onRefresh} onLogout={handleLogout} title={title} subtitle={subtitle} showRefresh={showRefresh} showNotifications={showNotifications} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>;
}