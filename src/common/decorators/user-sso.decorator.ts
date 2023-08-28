import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserSSORequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      user: request.user,
      token: request.token,
    };
  },
);
