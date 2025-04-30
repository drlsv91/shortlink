enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  error(message: string, error?: Error): void {
    const formattedMessage = this.formatMessage("ERROR", message);
    console.error(formattedMessage);
    if (error) {
      console.error(error.stack ?? error.message);
    }
  }

  warn(message: string): void {
    const formattedMessage = this.formatMessage("WARN", message);
    console.warn(formattedMessage);
  }

  info(message: string): void {
    console.log(message);

    const formattedMessage = this.formatMessage("INFO", message);
    console.info(formattedMessage);
  }

  debug(message: string, data?: any): void {
    const formattedMessage = this.formatMessage("DEBUG", message);
    console.debug(formattedMessage);
    if (data) {
      console.debug(data);
    }
  }
}

const logger = new Logger();

export const createLogger = () => new Logger();

export { Logger, LogLevel, logger };
