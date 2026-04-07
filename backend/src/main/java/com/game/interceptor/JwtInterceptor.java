package com.game.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.game.common.Result;
import com.game.common.ResultCode;
import com.game.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (!StringUtils.hasText(token)) {
            writeError(response, ResultCode.UNAUTHORIZED);
            return false;
        }

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            if (!jwtUtil.validateToken(token)) {
                writeError(response, ResultCode.TOKEN_INVALID);
                return false;
            }
            Long adminId = jwtUtil.getAdminIdFromToken(token);
            request.setAttribute("adminId", adminId);
            return true;
        } catch (Exception e) {
            log.error("Token验证失败: {}", e.getMessage());
            writeError(response, ResultCode.TOKEN_INVALID);
            return false;
        }
    }

    private void writeError(HttpServletResponse response, ResultCode resultCode) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(objectMapper.writeValueAsString(Result.error(resultCode)));
    }
}
