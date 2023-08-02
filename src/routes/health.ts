import Router from "express-promise-router";

const router = Router();

// Check system health
router.get("/health", async (req, res) => {
  res.status(204).send();
});

export default router;
