import { Router, type IRouter } from "express";
import healthRouter from "./health";
import refundsRouter from "./refunds";

const router: IRouter = Router();

router.use(healthRouter);
router.use(refundsRouter);

export default router;
