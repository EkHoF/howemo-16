
// 云函数：记录登录失败
// 功能：记录指定IP的登录失败尝试，当达到阈值时锁定该IP

const tcb = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  try {
    // 初始化云开发
    const app = tcb.init({
      env: context.TCB_ENV || process.env.TCB_ENV || 'default'
    });
    
    const db = app.database();
    
    // 配置参数
    const MAX_FAILED_ATTEMPTS = 5; // 最大失败次数
    const LOCK_TIME_MINUTES = 15; // 锁定时间（分钟）
    
    // 优先使用前端传递的IP，如果没有则尝试从请求头获取
    const clientIP = event.clientIP || 
                     context.clientIP || 
                     event.headers?.['x-forwarded-for']?.split(',')[0] || 
                     event.headers?.['x-real-ip'] || 
                     event.headers?.['x-client-ip'] ||
                     '127.0.0.1';
    
    const username = event.username || 'unknown';
    const timestamp = event.timestamp || Date.now();
    const userAgent = event.userAgent || context.userAgent || 'unknown';
    
    console.log('记录登录失败 - 客户端IP:', clientIP, '用户名:', username);
    
    // 查询该IP的现有记录
    const existingRecord = await db.collection('ip_login_attempts')
      .where({
        ip_address: clientIP
      })
      .get();
    
    let newFailedCount = 1;
    let lockUntil = null;
    let isLocked = false;
    
    if (existingRecord.data.length > 0) {
      // 更新现有记录
      const record = existingRecord.data[0];
      newFailedCount = (record.failed_count || 0) + 1;
      
      // 检查是否需要锁定
      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        lockUntil = timestamp + LOCK_TIME_MINUTES * 60 * 1000;
        isLocked = true;
        console.log(`IP ${clientIP} 达到最大失败次数，已锁定 ${LOCK_TIME_MINUTES} 分钟`);
      }
      
      // 更新记录
      await db.collection('ip_login_attempts')
        .where({
          ip_address: clientIP
        })
        .update({
          failed_count: newFailedCount,
          last_attempt: timestamp,
          lock_until: lockUntil,
          last_username: username,
          updated_at: timestamp
        });
        
    } else {
      // 创建新记录
      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        lockUntil = timestamp + LOCK_TIME_MINUTES * 60 * 1000;
        isLocked = true;
        console.log(`IP ${clientIP} 首次记录即达到最大失败次数，已锁定 ${LOCK_TIME_MINUTES} 分钟`);
      }
      
      await db.collection('ip_login_attempts')
        .add({
          ip_address: clientIP,
          failed_count: newFailedCount,
          last_attempt: timestamp,
          lock_until: lockUntil,
          last_username: username,
          created_at: timestamp,
          updated_at: timestamp
        });
    }
    
    // 记录安全日志
    try {
      await db.collection('security_logs')
        .add({
          event_type: 'login_failed',
          ip_address: clientIP,
          username: username,
          timestamp: timestamp,
          failed_count: newFailedCount,
          is_locked: isLocked,
          user_agent: userAgent,
          created_at: timestamp
        });
    } catch (logError) {
      console.error('记录安全日志失败:', logError);
      // 不影响主流程，继续执行
    }
    
    console.log(`IP ${clientIP} 登录失败记录已更新，当前失败次数: ${newFailedCount}`);
    
    return {
      success: true,
      result: {
        count: newFailedCount,
        isLocked: isLocked,
        lockUntil: lockUntil,
        lockTimeRemaining: isLocked ? LOCK_TIME_MINUTES : 0
      }
    };
    
  } catch (error) {
    console.error('记录登录失败失败:', error);
    return {
      success: false,
      error: error.message,
      result: {
        count: 1,
        isLocked: false,
        lockUntil: null,
        lockTimeRemaining: 0
      }
    };
  }
};
