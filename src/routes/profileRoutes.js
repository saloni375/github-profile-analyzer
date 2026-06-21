const express = require("express");
const router = express.Router();

const {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
  deleteProfile,
  compareProfiles,
  getStats,
} = require("../controllers/profileController");

router.post("/analyze/:username", analyzeProfile);
router.get("/profiles", getAllProfiles);
router.get("/profiles/:username", getProfileByUsername);
router.delete("/profiles/:username", deleteProfile);
router.get("/compare", compareProfiles);
router.get("/stats", getStats);

module.exports = router;