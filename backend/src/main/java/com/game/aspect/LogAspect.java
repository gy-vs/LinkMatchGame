package com.game.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class LogAspect {

    @Autowired
    private ObjectMapper objectMapper;

    @Pointcut("execution(* com.game.controller..*.*(..))")
    public void controllerPointcut() {}

    @Around("controllerPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        String params = "";
        try {
            params = objectMapper.writeValueAsString(args);
        } catch (Exception e) {
            params = "无法序列化参数";
        }
        
        log.info(">>> 请求开始: {}.{}, 参数: {}", className, methodName, params);
        
        Object result = null;
        try {
            result = joinPoint.proceed();
            return result;
        } finally {
            long endTime = System.currentTimeMillis();
            log.info("<<< 请求结束: {}.{}, 耗时: {}ms", className, methodName, (endTime - startTime));
        }
    }
}
