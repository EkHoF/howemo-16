// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
export const LanguageProvider = ({
  children
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');
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
  const getText = key => {
    const texts = {
      'en-US': {
        // 通用文本
        languageChanged: 'Language Changed',
        validationError: 'Validation Error',
        fillAllFields: 'Please fill in all required fields',
        error: 'Error',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        refresh: 'Refresh',
        loading: 'Loading...',
        noData: 'No data available',
        success: 'Success',
        failed: 'Failed',
        pending: 'Pending',
        active: 'Active',
        inactive: 'Inactive',
        status: 'Status',
        actions: 'Actions',
        createTime: 'Create Time',
        updateTime: 'Update Time',
        operator: 'Operator',
        remark: 'Remark'
      },
      'zh-CN': {
        // 通用文本
        languageChanged: '语言已更改',
        validationError: '验证错误',
        fillAllFields: '请填写所有必填字段',
        error: '错误',
        save: '保存',
        cancel: '取消',
        edit: '编辑',
        delete: '删除',
        view: '查看',
        add: '添加',
        search: '搜索',
        filter: '筛选',
        export: '导出',
        import: '导入',
        refresh: '刷新',
        loading: '加载中...',
        noData: '暂无数据',
        success: '成功',
        failed: '失败',
        pending: '待处理',
        active: '活跃',
        inactive: '非活跃',
        status: '状态',
        actions: '操作',
        createTime: '创建时间',
        updateTime: '更新时间',
        operator: '操作员',
        remark: '备注'
      },
      'ja-JP': {
        // 通用文本
        languageChanged: '言語が変更されました',
        validationError: '検証エラー',
        fillAllFields: 'すべての必須フィールドを入力してください',
        error: 'エラー',
        save: '保存',
        cancel: 'キャンセル',
        edit: '編集',
        delete: '削除',
        view: '表示',
        add: '追加',
        search: '検索',
        filter: 'フィルター',
        export: 'エクスポート',
        import: 'インポート',
        refresh: '更新',
        loading: '読み込み中...',
        noData: 'データがありません',
        success: '成功',
        failed: '失敗',
        pending: '保留中',
        active: 'アクティブ',
        inactive: '非アクティブ',
        status: 'ステータス',
        actions: 'アクション',
        createTime: '作成時間',
        updateTime: '更新時間',
        operator: 'オペレーター',
        remark: '備考'
      }
    };
    return texts[selectedLanguage]?.[key] || texts['zh-CN'][key] || key;
  };
  const changeLanguage = languageCode => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
  };
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'zh-CN';
    setSelectedLanguage(savedLanguage);
  }, []);
  const value = {
    selectedLanguage,
    languages,
    getText,
    changeLanguage,
    setSelectedLanguage
  };
  return <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>;
};