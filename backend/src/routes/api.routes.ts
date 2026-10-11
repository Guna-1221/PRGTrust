import { Router } from "express";
import { apiRouter } from "../controllers/api.controller";

const routes = Router();

routes.use(apiRouter);

export default routes;
