
// 云函数：重置登录失败记录
// 功能：重置指定IP的登录失败计数（登录成功时调用）

exports.main = async (event, context) => {
  try {
    // 使用云函数内置的数据库API
    const db = cloud.database();
    
    // 优先使用前端传递的IP，如果没有则尝试从请求头获取
    const clientIP = event.clientIP || 
                     context.clientIP || 
                     event.headers?.['x-forwarded-for']?.split(',')[0] || 
                     event.headers?.['x-real-ip'] || 
                     event.headers?.['x-client-ip'] ||
                     '127.0.0.1';
    
    const timestamp = Date.now();
    const userAgent = event.userAgent || context.userAgent || 'unknown';
    
    console.log('重置登录失败记录 - 客户端IP:', clientIP);
    
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
    
    // 记录安全日志
    await db.collection('security_logs')
      .add({
        event_type: 'login_success_reset',
        ip_address: clientIP,
        timestamp: timestamp,
        user_agent: userAgent,
        created_at: timestamp
      });
    
    console.log(`IP ${clientIP} 登录失败记录已重置`);
    
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
