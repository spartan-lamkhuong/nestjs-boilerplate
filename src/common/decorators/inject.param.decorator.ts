import { applyDecorators, UseInterceptors } from '@nestjs/common';

import { InjectParamInterceptor } from '../interceptors/inject.param.interceptor';

export const InjectParamToBody = () => {
  return applyDecorators(UseInterceptors(new InjectParamInterceptor()));
};
