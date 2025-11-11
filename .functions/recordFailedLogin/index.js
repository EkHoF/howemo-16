
// 云函数：记录登录失败
// 功能：记录指定IP的登录失败尝试，当达到阈值时锁定该IP

const tcb = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  try {
    // 初始化云开发
    const app = tcb.init({
      env: context.TCB_ENV
    });
    
    const db = app.database();
    
    // 配置参数
    const MAX_FAILED_ATTEMPTS = 5; // 最大失败次数
    const LOCK_TIME_MINUTES = 15; // 锁定时间（分钟）
    
    // 获取客户端IP
    const clientIP = event.clientIP || 
                     context.clientIP || 
                     event.headers?.['x-forwarded-for']?.split(',')[0] || 
                     event.headers?.['x-real-ip'] || 
                     '127.0.0.1';
    
    const username = event.username || 'unknown';
    const timestamp = event.timestamp || Date.now();
    
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
    await db.collection('security_logs')
      .add({
        event_type: 'login_failed',
        ip_address: clientIP,
        username: username,
        timestamp: timestamp,
        failed_count: newFailedCount,
        is_locked: isLocked,
        user_agent: event.userAgent || context.userAgent || 'unknown',
        created_at: timestamp
      });
    
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
