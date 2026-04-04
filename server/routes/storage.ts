import { Router, Request, Response } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const router = Router();

// Local storage directory for uploaded files
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

function getPublicUrl(filename: string): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${filename}`;
}

// POST /api/storage/upload — upload a file
router.post("/upload", requireAuth, upload.single("file"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }
    const publicUrl = getPublicUrl(req.file.filename);
    res.json({ publicUrl, filename: req.file.filename });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// DELETE /api/storage/delete — delete a file
router.delete("/delete", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paths } = req.body as { paths: string[] };
    if (!Array.isArray(paths)) {
      res.status(400).json({ error: "paths must be an array" });
      return;
    }
    for (const filePath of paths) {
      const filename = path.basename(filePath);
      const fullPath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
