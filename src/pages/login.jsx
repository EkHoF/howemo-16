// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Lock, User, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export default function LoginPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState({
    isLocked: false,
    lockTimeRemaining: 0,
    failedAttempts: 0
  });

  // 获取客户端IP地址
  const getClientIP = async () => {
    try {
      // 尝试通过第三方服务获取IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('获取IP失败:', error);
      // 如果获取失败，返回一个默认IP
      return '127.0.0.1';
    }
  };

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const clientIP = await getClientIP();
      const response = await $w.cloud.callFunction({
        name: 'checkLoginStatus',
        data: {
          clientIP: clientIP
        }
      });
      if (response.result && response.result.success) {
        setLoginStatus(response.result.result);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  // 记录登录失败
  const recordFailedLogin = async () => {
    try {
      const clientIP = await getClientIP();
      await $w.cloud.callFunction({
        name: 'recordFailedLogin',
        data: {
          clientIP: clientIP,
          username: formData.username,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }
      });

      // 重新检查登录状态
      await checkLoginStatus();
    } catch (error) {
      console.error('记录登录失败失败:', error);
    }
  };

  // 重置登录失败记录
  const resetFailedLogin = async () => {
    try {
      const clientIP = await getClientIP();
      await $w.cloud.callFunction({
        name: 'resetFailedLogin',
        data: {
          clientIP: clientIP,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('重置登录失败记录失败:', error);
    }
  };

  // 处理登录
  const handleLogin = async e => {
    e.preventDefault();
    if (loginStatus.isLocked) {
      toast({
        title: '账号已锁定',
        description: `请等待 ${loginStatus.lockTimeRemaining} 分钟后再试`,
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      // 模拟登录验证（实际应该调用后端API）
      const isValidLogin = await validateLogin(formData.username, formData.password);
      if (isValidLogin) {
        // 登录成功，重置失败记录
        await resetFailedLogin();
        toast({
          title: '登录成功',
          description: '欢迎回来！'
        });

        // 跳转到仪表板
        $w.utils.navigateTo({
          pageId: 'dashboard',
          params: {}
        });
      } else {
        // 登录失败，记录失败尝试
        await recordFailedLogin();
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: error.message || '网络错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 模拟登录验证函数
  const validateLogin = async (username, password) => {
    // 这里应该调用实际的认证API
    // 暂时使用简单的验证逻辑
    if (username === 'admin' && password === 'admin123') {
      return true;
    }
    return false;
  };

  // 计算剩余尝试次数
  const getRemainingAttempts = () => {
    const MAX_ATTEMPTS = 5;
    const remaining = MAX_ATTEMPTS - loginStatus.failedAttempts;
    return Math.max(0, remaining);
  };

  // 页面加载时检查登录状态
  useEffect(() => {
    checkLoginStatus();

    // 如果账号被锁定，每分钟更新一次剩余时间
    if (loginStatus.isLocked) {
      const interval = setInterval(() => {
        checkLoginStatus();
      }, 60000); // 每分钟更新一次

      return () => clearInterval(interval);
    }
  }, [loginStatus.isLocked]);
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">安全登录</CardTitle>
          <p className="text-gray-600">请输入您的登录凭据</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 登录状态提示 */}
            {loginStatus.isLocked ? <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-red-800 font-medium">账号已锁定</p>
                    <p className="text-red-600 text-sm">
                      由于多次登录失败，账号已被锁定 {loginStatus.lockTimeRemaining} 分钟
                    </p>
                  </div>
                </div>
              </div> : loginStatus.failedAttempts > 0 ? <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-yellow-800 font-medium">登录失败警告</p>
                    <p className="text-yellow-600 text-sm">
                      已失败 {loginStatus.failedAttempts} 次，{getRemainingAttempts()} 次剩余尝试机会
                    </p>
                  </div>
                </div>
              </div> : null}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input type="text" placeholder="请输入用户名" value={formData.username} onChange={e => setFormData({
                  ...formData,
                  username: e.target.value
                })} className="pl-10" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={formData.password} onChange={e => setFormData({
                  ...formData,
                  password: e.target.value
                })} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || loginStatus.isLocked}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              测试账号：admin / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
}