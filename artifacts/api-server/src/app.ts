import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";

import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
(req: any)          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
(res: any)        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api", router);

export default app;
