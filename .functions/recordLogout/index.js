
// 云函数：记录退出登录
// 功能：记录用户退出登录事件，用于安全审计

exports.main = async (event, context) => {
  try {
    // 使用原生云开发API
    const db = cloud.database();
    
    // 获取客户端信息
    const clientIP = event.clientIP || 
                     context.clientIP || 
                     event.headers?.['x-forwarded-for']?.split(',')[0] || 
                     event.headers?.['x-real-ip'] || 
                     event.headers?.['x-client-ip'] ||
                     '127.0.0.1';
    
    const timestamp = event.timestamp || Date.now();
    const userAgent = event.userAgent || context.userAgent || 'unknown';
    
    // 从请求中获取用户信息（如果有的话）
    let userInfo = null;
    try {
      const authToken = event.authToken || event.headers?.['authorization'];
      if (authToken) {
        // 这里可以解析token获取用户信息
        // 简单示例：假设token是base64编码的用户信息
        const decoded = Buffer.from(authToken, 'base64').toString();
        const [username] = decoded.split(':');
        userInfo = { username };
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
    
    // 记录退出登录日志
    await db.collection('security_logs')
      .add({
        event_type: 'logout',
        ip_address: clientIP,
        username: userInfo?.username || 'unknown',
        timestamp: timestamp,
        user_agent: userAgent,
        session_duration: userInfo ? timestamp - (userInfo.loginTime || timestamp) : 0,
        created_at: timestamp
      });
    
    // 更新用户最后活动时间（如果有用户信息）
    if (userInfo) {
      try {
        await db.collection('user_sessions')
          .where({
            username: userInfo.username,
            ip_address: clientIP
          })
          .update({
            logout_time: timestamp,
            session_status: 'ended',
            updated_at: timestamp
          });
      } catch (error) {
        console.error('更新用户会话失败:', error);
      }
    }
    
    return {
      success: true,
      result: {
        logged_out: true,
        timestamp: timestamp,
        ip_address: clientIP
      }
    };
    
  } catch (error) {
    console.error('记录退出登录失败:', error);
    return {
      success: false,
      error: error.message,
      result: {
        logged_out: false
      }
    };
  }
};
