import chalk from "chalk";

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
    console.error(chalk.red(formattedMessage));
    if (error) {
      console.error(chalk.red(error.stack ?? error.message));
    }
  }

  warn(message: string): void {
    const formattedMessage = this.formatMessage("WARN", message);
    console.warn(chalk.yellow(formattedMessage));
  }

  info(message: string): void {
    const formattedMessage = this.formatMessage("INFO", message);
    console.info(chalk.cyan(formattedMessage));
  }

  debug(message: string, data?: any): void {
    const formattedMessage = this.formatMessage("DEBUG", message);
    console.debug(chalk.gray(formattedMessage));
    if (data) {
      console.debug(chalk.gray(data));
    }
  }
}

const logger = new Logger();

export const createLogger = () => new Logger();

export { Logger, LogLevel, logger };
