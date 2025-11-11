
// 云函数：获取客户端真实IP地址
// 功能：从请求头中获取真实的客户端IP地址

exports.main = async (event, context) => {
  try {
    // 获取客户端IP的优先级顺序
    const clientIP = event.clientIP || 
                     context.clientIP || 
                     event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 
                     event.headers?.['x-real-ip'] || 
                     event.headers?.['x-client-ip'] ||
                     event.headers?.['cf-connecting-ip'] || // Cloudflare
                     event.headers?.['x-cluster-client-ip'] ||
                     event.requestContext?.identity?.sourceIp || // API Gateway
                     event.requestContext?.clientIP ||
                     '127.0.0.1';
    
    console.log('获取客户端IP:', {
      'x-forwarded-for': event.headers?.['x-forwarded-for'],
      'x-real-ip': event.headers?.['x-real-ip'],
      'x-client-ip': event.headers?.['x-client-ip'],
      'cf-connecting-ip': event.headers?.['cf-connecting-ip'],
      'requestContext.sourceIp': event.requestContext?.identity?.sourceIp,
      'requestContext.clientIP': event.requestContext?.clientIP,
      'event.clientIP': event.clientIP,
      'context.clientIP': context.clientIP,
      'finalIP': clientIP
    });
    
    return {
      success: true,
      result: {
        ip: clientIP,
        headers: event.headers || {},
        requestContext: event.requestContext || {}
      }
    };
    
  } catch (error) {
    console.error('获取客户端IP失败:', error);
    return {
      success: false,
      error: error.message,
      result: {
        ip: '127.0.0.1'
      }
    };
  }
};
