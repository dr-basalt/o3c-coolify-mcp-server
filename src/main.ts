import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Check if running in MCP mode (stdio) or HTTP mode
  const isMcpMode = process.argv.includes('--mcp') || !process.env.PORT;

  if (isMcpMode) {
    // MCP mode - create app without listening on HTTP
    logger.log('Starting in MCP mode (stdio)...');
    const app = await NestFactory.createApplicationContext(AppModule);

    // The McpService will handle stdio communication
    logger.log('Coolify MCP Server is ready');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.log('Shutting down...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.log('Shutting down...');
      await app.close();
      process.exit(0);
    });
  } else {
    // HTTP mode - for health checks and metrics
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Coolify MCP Server HTTP endpoint listening on port ${port}`);
    logger.log(`Health check available at http://localhost:${port}/health`);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start Coolify MCP Server:', error);
  process.exit(1);
});
