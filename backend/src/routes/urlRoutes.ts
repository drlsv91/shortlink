import { Router } from "express";
import { UrlController } from "../controllers/urlController";
import {
  validateEncodeRequest,
  validateDecodeRequest,
  validateStatisticRequest,
  validateListRequest,
} from "../middlewares/validation.middleware";

const router: Router = Router();
const urlController = new UrlController();

router.post("/api/encode", validateEncodeRequest, (req, res) => urlController.encode(req, res));
router.post("/api/decode", validateDecodeRequest, (req, res) => urlController.decode(req, res));
router.get("/api/statistic/:url_path", validateStatisticRequest, (req, res) => urlController.getStatistics(req, res));
router.get("/api/list", validateListRequest, (req, res) => urlController.listUrls(req, res));

router.get("/:url_path", (req, res) => urlController.redirect(req, res));

export default router;
