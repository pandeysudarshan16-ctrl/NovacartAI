import { config } from "@/core/config";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? (meta instanceof Error ? { message: meta.message, stack: meta.stack } : meta) : undefined;
    
    if (config.NODE_ENV === "production") {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(formattedMeta ? { meta: formattedMeta } : {}),
      });
    }

    const color = {
      info: "\x1b[36m",  // Cyan
      warn: "\x1b[33m",  // Yellow
      error: "\x1b[31m", // Red
      debug: "\x1b[35m", // Magenta
    }[level];
    const reset = "\x1b[0m";

    return `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}${
      formattedMeta ? `\n${JSON.stringify(formattedMeta, null, 2)}` : ""
    }`;
  }

  public info(message: string, meta?: unknown) {
    console.log(this.formatMessage("info", message, meta));
  }

  public warn(message: string, meta?: unknown) {
    console.warn(this.formatMessage("warn", message, meta));
  }

  public error(message: string, error?: unknown, meta?: unknown) {
    console.error(
      this.formatMessage("error", message, {
        ...(error instanceof Error ? { error: { message: error.message, stack: error.stack } } : { error }),
        ...(meta ? { meta } : {}),
      })
    );
  }

  public debug(message: string, meta?: unknown) {
    if (config.NODE_ENV !== "production") {
      console.log(this.formatMessage("debug", message, meta));
    }
  }
}

export const logger = new Logger();
