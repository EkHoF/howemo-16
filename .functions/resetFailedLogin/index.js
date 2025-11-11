
// 云函数：重置登录失败记录
// 功能：重置指定IP的登录失败计数（登录成功时调用）

const tcb = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  try {
    // 初始化云开发
    const app = tcb.init({
      env: context.TCB_ENV
    });
    
    const db = app.database();
    
    // 获取客户端IP（优先使用传入的IP，否则从请求头获取）
    const clientIP = event.clientIP || 
                     context.clientIP || 
                     event.headers?.['x-forwarded-for']?.split(',')[0] || 
                     event.headers?.['x-real-ip'] || 
                     event.requestContext?.clientIP ||
                     '127.0.0.1';
    
    const timestamp = Date.now();
    
    console.log(`重置登录失败记录 - IP: ${clientIP}, 时间戳: ${timestamp}`);
    
    // 重置该IP的失败计数
    const updateResult = await db.collection('ip_login_attempts')
      .where({
        ip_address: clientIP
      })
      .update({
        failed_count: 0,
        lock_until: null,
        last_attempt: null,
        reset_at: timestamp,
        updated_at: timestamp
      });
    
    console.log(`IP ${clientIP} 重置结果:`, updateResult);
    
    // 记录安全日志
    await db.collection('security_logs')
      .add({
        event_type: 'login_success_reset',
        ip_address: clientIP,
        timestamp: timestamp,
        user_agent: event.userAgent || context.userAgent || 'unknown',
        created_at: timestamp
      });
    
    return {
      success: true,
      result: {
        reset: true,
        ip_address: clientIP,
        timestamp: timestamp
      }
    };
    
  } catch (error) {
    console.error('重置登录失败记录失败:', error);
    return {
      success: false,
      error: error.message,
      result: {
        reset: false
      }
    };
  }
};
