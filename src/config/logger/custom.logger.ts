import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  private parse(message: any): string {
    if (typeof message === 'string' || message instanceof String) {
      return JSON.stringify({
        message,
        created_log: new Date().toISOString(),
      });
    }
    return JSON.stringify({
      ...message,
      created_log: new Date().toISOString(),
    });
  }

  log(message: any) {
    super.log(this.parse(message));
  }

  warn(message: any) {
    super.warn(this.parse(message));
  }

  error(message: any) {
    super.error(this.parse(message));
  }

  debug(message: any) {
    super.debug(this.parse(message));
  }
}
