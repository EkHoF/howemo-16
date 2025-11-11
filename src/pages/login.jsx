// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Globe, Shield, Users, Lock, AlertTriangle, Clock } from 'lucide-react';

export default function LoginPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'operator'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN'); // 默认中文
  const [isIPLocked, setIsIPLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // 登录限制配置
  const MAX_FAILED_ATTEMPTS = 5; // 最大失败次数
  const LOCK_TIME_MINUTES = 15; // 锁定时间（分钟）

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

  // 从后端获取客户端IP和登录状态
  const getLoginStatusFromBackend = async () => {
    try {
      const response = await $w.cloud.callFunction({
        name: 'checkLoginStatus',
        data: {}
      });
      return response.result;
    } catch (error) {
      console.error('获取登录状态失败:', error);
      // 如果后端服务不可用，返回默认状态
      return {
        isLocked: false,
        lockTimeRemaining: 0,
        failedAttempts: 0,
        clientIP: '127.0.0.1'
      };
    }
  };

  // 记录登录失败到后端
  const recordFailedLoginToBackend = async username => {
    try {
      const response = await $w.cloud.callFunction({
        name: 'recordFailedLogin',
        data: {
          username: username,
          timestamp: Date.now()
        }
      });
      return response.result;
    } catch (error) {
      console.error('记录登录失败失败:', error);
      // 如果后端服务不可用，使用本地存储作为备用
      const attempts = getLocalFailedAttempts();
      attempts.count += 1;
      attempts.lastAttempt = Date.now();
      if (attempts.count >= MAX_FAILED_ATTEMPTS) {
        attempts.lockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000;
      }
      storeLocalFailedAttempts(attempts);
      return attempts;
    }
  };

  // 重置登录失败记录到后端
  const resetFailedLoginToBackend = async () => {
    try {
      const response = await $w.cloud.callFunction({
        name: 'resetFailedLogin',
        data: {}
      });
      return response.result;
    } catch (error) {
      console.error('重置登录失败记录失败:', error);
      // 如果后端服务不可用，清除本地存储
      localStorage.removeItem('login_attempts_backup');
      return {
        success: true
      };
    }
  };

  // 本地备用存储方法（当后端不可用时使用）
  const getLocalFailedAttempts = () => {
    const attempts = localStorage.getItem('login_attempts_backup');
    return attempts ? JSON.parse(attempts) : {
      count: 0,
      lastAttempt: null,
      lockUntil: null
    };
  };
  const storeLocalFailedAttempts = attempts => {
    localStorage.setItem('login_attempts_backup', JSON.stringify(attempts));
  };

  // 检查IP锁定状态
  const checkIPLockStatus = async () => {
    const status = await getLoginStatusFromBackend();
    const now = Date.now();
    if (status.lockUntil && status.lockUntil > now) {
      setIsIPLocked(true);
      setLockTimeRemaining(Math.ceil((status.lockUntil - now) / 1000 / 60));
      setFailedAttempts(status.failedAttempts);
      return true;
    }
    if (status.lockUntil && status.lockUntil <= now) {
      // 锁定时间已过，重置计数
      await resetFailedLoginToBackend();
      setFailedAttempts(0);
      setIsIPLocked(false);
      setLockTimeRemaining(0);
    } else {
      setFailedAttempts(status.failedAttempts || 0);
      setIsIPLocked(status.isLocked || false);
      setLockTimeRemaining(status.lockTimeRemaining || 0);
    }
    return false;
  };

  // 格式化剩余锁定时间
  const formatLockTime = minutes => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  };

  // 多语言文本映射
  const getText = key => {
    const texts = {
      'en-US': {
        title: 'Overseas Account Management',
        subtitle: 'Secure platform for legal account management',
        username: 'Username',
        password: 'Password',
        role: 'Role',
        signIn: 'Sign In',
        forgotPassword: 'Forgot Password?',
        administrator: 'Administrator',
        operator: 'Operator',
        enterUsername: 'Enter username',
        enterPassword: 'Enter password',
        adminCredentials: 'Admin: admin / admin123',
        operatorCredentials: 'Operator: operator / operator123',
        loginSuccess: 'Login Successful',
        welcomeBack: 'Welcome back',
        loginFailed: 'Login Failed',
        invalidCredentials: 'Invalid username or password',
        languageChanged: 'Language Changed',
        error: 'Error',
        loginError: 'Login failed. Please try again.',
        ipLocked: 'IP Address Locked',
        tooManyAttempts: `Too many failed attempts from this IP. Access blocked for ${formatLockTime(LOCK_TIME_MINUTES)}.`,
        attemptsRemaining: 'attempts remaining',
        ipLockedUntil: 'IP access blocked until',
        pleaseTryLater: 'Please try again later',
        securityAlert: 'Security Alert',
        ipRestriction: 'For security reasons, login attempts are limited per IP address.',
        ipAccessBlocked: 'IP Access Blocked',
        securityProtection: 'This IP address has been temporarily blocked due to multiple failed login attempts.'
      },
      'zh-CN': {
        title: '海外账号管理系统',
        subtitle: '合法账号安全管理平台',
        username: '用户名',
        password: '密码',
        role: '角色',
        signIn: '登录',
        forgotPassword: '忘记密码？',
        administrator: '管理员',
        operator: '操作员',
        enterUsername: '输入用户名',
        enterPassword: '输入密码',
        adminCredentials: '管理员: admin / admin123',
        operatorCredentials: '操作员: operator / operator123',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来',
        loginFailed: '登录失败',
        invalidCredentials: '用户名或密码错误',
        languageChanged: '语言已更改',
        error: '错误',
        loginError: '登录失败，请重试。',
        ipLocked: 'IP地址已锁定',
        tooManyAttempts: `此IP登录失败次数过多，访问已阻止${formatLockTime(LOCK_TIME_MINUTES)}。`,
        attemptsRemaining: '次剩余尝试机会',
        ipLockedUntil: 'IP访问阻止至',
        pleaseTryLater: '请稍后再试',
        securityAlert: '安全提醒',
        ipRestriction: '为安全起见，每个IP地址的登录尝试次数受到限制。',
        ipAccessBlocked: 'IP访问已阻止',
        securityProtection: '由于多次登录失败，此IP地址已被暂时阻止访问。'
      },
      'ja-JP': {
        title: '海外アカウント管理システム',
        subtitle: '合法アカウントセキュリティ管理プラットフォーム',
        username: 'ユーザー名',
        password: 'パスワード',
        role: '役割',
        signIn: 'ログイン',
        forgotPassword: 'パスワードを忘れた？',
        administrator: '管理者',
        operator: 'オペレーター',
        enterUsername: 'ユーザー名を入力',
        enterPassword: 'パスワードを入力',
        adminCredentials: '管理者: admin / admin123',
        operatorCredentials: 'オペレーター: operator / operator123',
        loginSuccess: 'ログイン成功',
        welcomeBack: 'おかえりなさい',
        loginFailed: 'ログイン失敗',
        invalidCredentials: 'ユーザー名またはパスワードが間違っています',
        languageChanged: '言語が変更されました',
        error: 'エラー',
        loginError: 'ログインに失敗しました。もう一度お試しください。',
        ipLocked: 'IPアドレスがロックされました',
        tooManyAttempts: `このIPからのログイン失敗回数が多すぎます。アクセスは${formatLockTime(LOCK_TIME_MINUTES)}ブロックされます。`,
        attemptsRemaining: '回の残り試行',
        ipLockedUntil: 'IPアクセスブロック解除時間',
        pleaseTryLater: '後でもう一度お試しください',
        securityAlert: 'セキュリティアラート',
        ipRestriction: 'セキュリティ上の理由により、IPアドレスごとのログイン試行回数が制限されています。',
        ipAccessBlocked: 'IPアクセスがブロックされました',
        securityProtection: '複数回のログイン失敗により、このIPアドレスへのアクセスが一時的にブロックされました。'
      }
    };
    return texts[selectedLanguage]?.[key] || texts['zh-CN'][key] || key;
  };

  // 检查锁定状态的定时器
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (isIPLocked) {
        checkIPLockStatus();
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(checkInterval);
  }, [isIPLocked]);

  // 初始化时检查锁定状态和语言设置
  useEffect(() => {
    // 清除之前的认证信息
    clearAuthStorage();
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'zh-CN';
    setSelectedLanguage(savedLanguage);
    checkIPLockStatus();
  }, []);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleLanguageChange = languageCode => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    toast({
      title: getText('languageChanged'),
      description: `Language changed to ${languages.find(l => l.code === languageCode)?.name}`
    });
  };
  const handleLogin = async () => {
    if (isIPLocked) {
      toast({
        title: getText('ipLocked'),
        description: getText('pleaseTryLater'),
        variant: "destructive"
      });
      return;
    }
    if (!formData.username || !formData.password) {
      toast({
        title: getText('validationError') || "Validation Error",
        description: getText('fillAllFields') || "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    try {
      // Mock login logic - 支持多个账号
      const validCredentials = {
        'admin': {
          password: 'admin123',
          role: 'admin'
        },
        'operator': {
          password: 'operator123',
          role: 'operator'
        },
        'test': {
          password: 'test123',
          role: 'operator'
        }
      };
      const user = validCredentials[formData.username];
      if (user && user.password === formData.password) {
        // 登录成功，重置失败计数
        await resetFailedLoginToBackend();
        setFailedAttempts(0);
        setIsIPLocked(false);
        setLockTimeRemaining(0);

        // 保存登录信息到localStorage
        const loginTime = Date.now();
        const authToken = btoa(`${formData.username}:${loginTime}:${Math.random()}`);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userInfo', JSON.stringify({
          username: formData.username,
          role: user.role,
          loginTime: loginTime
        }));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('loginTime', loginTime.toString());
        localStorage.setItem('selectedLanguage', selectedLanguage);
        toast({
          title: getText('loginSuccess'),
          description: `${getText('welcomeBack')}, ${formData.username}!`
        });
        $w.utils.navigateTo({
          pageId: 'dashboard',
          params: {
            language: selectedLanguage,
            user: formData.username,
            role: user.role
          }
        });
      } else {
        // 登录失败，记录失败尝试到后端
        const result = await recordFailedLoginToBackend(formData.username);
        const remainingAttempts = MAX_FAILED_ATTEMPTS - result.count;
        if (result.count >= MAX_FAILED_ATTEMPTS) {
          setIsIPLocked(true);
          setLockTimeRemaining(LOCK_TIME_MINUTES);
          setFailedAttempts(result.count);
          toast({
            title: getText('ipLocked'),
            description: getText('tooManyAttempts'),
            variant: "destructive"
          });
        } else {
          setFailedAttempts(result.count);
          toast({
            title: getText('loginFailed'),
            description: `${getText('invalidCredentials')}. ${remainingAttempts} ${getText('attemptsRemaining')}.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: getText('error'),
        description: getText('loginError'),
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
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
          </div>

          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {getText('title')}
              </CardTitle>
              <p className="text-gray-600">
                {getText('subtitle')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 安全提醒 */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <div className="flex items-center text-amber-800 mb-1">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="font-medium">{getText('securityAlert')}</span>
                </div>
                <div className="text-amber-700">
                  {getText('ipRestriction')}
                </div>
              </div>

              {/* IP锁定提示 */}
              {isIPLocked && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <div className="flex items-center text-red-800 mb-1">
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="font-medium">{getText('ipAccessBlocked')}</span>
                  </div>
                  <div className="text-red-700">
                    {getText('securityProtection')}
                  </div>
                  <div className="text-red-700 mt-1">
                    {getText('ipLockedUntil')}: {formatLockTime(lockTimeRemaining)}
                  </div>
                  <div className="flex items-center text-red-600 mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    <span className="text-xs">{getText('pleaseTryLater')}</span>
                  </div>
                </div>}

              {/* 账号提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="font-medium text-blue-800 mb-1">测试账号：</div>
                <div className="text-blue-700 space-y-1">
                  <div>{getText('adminCredentials')}</div>
                  <div>{getText('operatorCredentials')}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('username')}
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input type="text" placeholder={getText('enterUsername')} value={formData.username} onChange={e => handleInputChange('username', e.target.value)} className="pl-10" disabled={isIPLocked} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input type={showPassword ? "text" : "password"} placeholder={getText('enterPassword')} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="pl-10 pr-10" disabled={isIPLocked} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" disabled={isIPLocked}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('role')}
                </label>
                <Select value={formData.role} onValueChange={value => handleInputChange('role', value)} disabled={isIPLocked}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{getText('administrator')}</SelectItem>
                    <SelectItem value="operator">{getText('operator')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isIPLocked}>
                {isIPLocked ? getText('ipLocked') : getText('signIn')}
              </Button>

              <div className="text-center">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  {getText('forgotPassword')}
                </a>
              </div>

              {/* 失败次数提示 */}
              {!isIPLocked && failedAttempts > 0 && <div className="text-center text-sm text-amber-600">
                  {getText('attemptsRemaining')}: {MAX_FAILED_ATTEMPTS - failedAttempts}
                </div>}
            </CardContent>
          </Card>
        </div>;
}