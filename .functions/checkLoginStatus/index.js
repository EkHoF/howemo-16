
// 云函数：检查登录状态
// 功能：检查当前IP的登录状态，包括是否被锁定、剩余锁定时间、失败次数等

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
    
    console.log('检查登录状态 - 客户端IP:', clientIP);
    
    const now = Date.now();
    
    // 查询该IP的登录失败记录
    const result = await db.collection('ip_login_attempts')
      .where({
        ip_address: clientIP
      })
      .get();
    
    let loginStatus = {
      isLocked: false,
      lockTimeRemaining: 0,
      failedAttempts: 0,
      clientIP: clientIP
    };
    
    if (result.data.length > 0) {
      const record = result.data[0];
      
      // 检查是否在锁定期内
      if (record.lock_until && record.lock_until > now) {
        loginStatus.isLocked = true;
        loginStatus.lockTimeRemaining = Math.ceil((record.lock_until - now) / 1000 / 60);
        loginStatus.failedAttempts = record.failed_count || 0;
        console.log(`IP ${clientIP} 已被锁定，剩余时间: ${loginStatus.lockTimeRemaining}分钟`);
      } else if (record.lock_until && record.lock_until <= now) {
        // 锁定时间已过，重置计数
        console.log(`IP ${clientIP} 锁定时间已过，重置计数`);
        await db.collection('ip_login_attempts')
          .where({
            ip_address: clientIP
          })
          .update({
            failed_count: 0,
            lock_until: null,
            last_attempt: null
          });
      } else {
        loginStatus.failedAttempts = record.failed_count || 0;
        console.log(`IP ${clientIP} 失败次数: ${loginStatus.failedAttempts}`);
      }
    } else {
      console.log(`IP ${clientIP} 无失败记录`);
    }
    
    return {
      success: true,
      result: loginStatus
    };
    
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return {
      success: false,
      error: error.message,
      result: {
        isLocked: false,
        lockTimeRemaining: 0,
        failedAttempts: 0,
        clientIP: event.clientIP || '127.0.0.1'
      }
    };
  }
};
