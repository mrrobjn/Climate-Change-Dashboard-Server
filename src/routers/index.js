import locationRouter from "./location.route.js";
import airQualityRouter from "./airquality.route.js";
import historicalRouter from "./historical.route.js";
import forecastRouter from "./forecast.route.js";
import articlesRouter from "./articles.route.js";
import lidaRouter from "./lida.route.js";
import authRouter from "./auth.route.js";
import checkRole from "../app/middlewares/checkRole.js";

export const route = (app) => {
  app.use("/location", locationRouter);
  app.use("/air-quality", airQualityRouter);
  app.use("/historical", historicalRouter);
  app.use("/forecast", forecastRouter);
  app.use("/articles", articlesRouter);
  app.use("/lida", checkRole, lidaRouter);
  app.use("/auth", authRouter);
};
