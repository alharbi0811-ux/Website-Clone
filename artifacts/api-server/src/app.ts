import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
      return {
        method: req.method,
        url: req.url,
        headers: req.headers,
      };
      },
    res(res: any) {
      return { statusCode: res.statusCode };
    },
    },
  });

app.use(cors());

export default app;







import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import {
  logger
} from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) {
        return {
          method: req.method,
          url: req.url,
          headers: req.headers,
        };
      },
      res(res: Response) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(cors());

export default app;































