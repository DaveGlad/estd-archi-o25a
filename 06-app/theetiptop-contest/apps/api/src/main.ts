// Must come first: it populates process.env, which the DI container reads while building.
import './config/load-env.js';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app/app.module.js';
import { APP_CONFIG, type AppConfig } from './config/env.js';
import { AUTH_BASE_PATH } from './modules/auth/auth.config.js';

/** Business endpoints live under `/v1`; see `ARCHITECTURE.md`. */
const API_VERSION_PREFIX = 'v1';

/**
 * Paths kept outside the versioned prefix:
 *   - `/api/auth/*` is the base path Better Auth builds its own URLs and OAuth callbacks
 *     from, and it must stay stable across API versions;
 *   - `/health` is operational plumbing consumed by Docker, Prometheus and Jenkins;
 *   - `/docs` is the Swagger UI.
 */
const UNVERSIONED_PATHS = ['api/auth/{*splat}', 'health', 'docs/{*splat}'];

function configureSwagger(app: NestExpressApplication, config: AppConfig): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API Thé Tip Top — jeu-concours')
      .setDescription(
        [
          'API REST versionnée du jeu-concours organisé pour l’ouverture de la 10e boutique Thé Tip Top.',
          '',
          'Elle sert **trois consommateurs** :',
          '- le site public du jeu-concours (session) ;',
          '- le back-office administrateur et employé boutique (session) ;',
          '- les **caisses des 10 boutiques** et le **futur site e-commerce** (clé d’API, en-tête `x-api-key`).',
          '',
          'Les points d’entrée d’authentification sont servis par Better Auth sous `/api/auth` et ne figurent pas ici.',
        ].join('\n')
      )
      .setVersion('1.0')
      .addCookieAuth('better-auth.session_token', {
        type: 'apiKey',
        in: 'cookie',
        description: 'Session déposée par Better Auth à la connexion.',
      })
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
          description: 'Clé d’API des caisses et du futur site e-commerce.',
        },
        'api-key'
      )
      .addServer(config.auth.baseUrl)
      .build()
  );

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: { persistAuthorization: true },
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Better Auth consumes the raw request stream itself. Nest's default body parser
    // would drain it before the handler sees it, so parsing is disabled here and
    // re-applied below for every path except `/api/auth`.
    bodyParser: false,
    bufferLogs: true,
  });

  const config = app.get<AppConfig>(APP_CONFIG);
  const logger = new Logger('Bootstrap');

  // --- Body parsing, everywhere but the auth handler ---------------------------
  const skipAuthPath =
    (parser: express.RequestHandler): express.RequestHandler =>
    (request, response, next) =>
      request.path.startsWith(AUTH_BASE_PATH)
        ? next()
        : parser(request, response, next);

  // 100 kB: the largest legitimate body is a sign-up form. The default 100 kB is already
  // generous for this API, and an explicit limit beats an implicit one.
  app.use(skipAuthPath(express.json({ limit: '100kb' })));
  app.use(skipAuthPath(express.urlencoded({ extended: true, limit: '100kb' })));

  // --- Security headers --------------------------------------------------------
  app.use(
    helmet({
      // The API serves JSON, not pages; a restrictive CSP here would only break the
      // Swagger UI, which does need inline styles.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // --- CORS --------------------------------------------------------------------
  app.enableCors({
    origin: config.corsOrigins,
    // Required: the session travels in a cookie, and a cross-origin request does not send
    // cookies without it. This is also why the origin list is explicit rather than `*` —
    // the two are mutually exclusive by specification.
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  app.setGlobalPrefix(API_VERSION_PREFIX, { exclude: UNVERSIONED_PATHS });

  // Trust the reverse proxy in front of the containers, otherwise every participation
  // records the proxy's IP instead of the client's and the anti-fraud hash is worthless.
  app.set('trust proxy', 1);

  configureSwagger(app, config);

  app.enableShutdownHooks();

  await app.listen(config.port, '0.0.0.0');

  logger.log(`API v1          http://localhost:${config.port}/${API_VERSION_PREFIX}`);
  logger.log(`Swagger         http://localhost:${config.port}/docs`);
  logger.log(`Health          http://localhost:${config.port}/health`);
  logger.log(
    `Auth providers  form${config.auth.google ? ' + google' : ''}${
      config.auth.facebook ? ' + facebook' : ''
    }`
  );
}

void bootstrap();
