import {
  Router,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import express from "express";
import multer from "multer";
import {
  createAdminToken,
  createAuthCookie,
  createLogoutCookie,
  verifyPasscode,
} from "../services/auth.service";
import {
  createBackground,
  createDonation,
  createDonationPayment,
  createGalleryImage,
  createMember,
  deleteBackground,
  deleteDonation,
  deleteEvent,
  deleteGalleryImage,
  deleteMember,
  getActiveBackground,
  getAllBackgrounds,
  getAllDonationPayments,
  getAllDonations,
  getAllGalleryImages,
  getAllMembers,
  getAllSiteSettings,
  getDonationById,
  getDonationPaymentById,
  getEventById,
  getGalleryImageById,
  getMemberById,
  resetDonationsToSeed,
  setActiveBackground,
  setSiteSetting,
  updateDonation,
  updateDonationPaymentStatus,
  updateGalleryImage,
  updateMember,
} from "../services/data.service";
import type {
  Donation,
  GalleryImage,
  Member,
  TrustEvent,
} from "../models/db/types";
import { requireAdmin } from "../middleware/admin.middleware";
import {
  deleteImage,
  getImage,
  uploadImage,
} from "../services/storage.service";
import {
  createManagedEvent,
  getEventWithStatus,
  listEventsWithStatus,
  updateManagedEvent,
} from "../services/events.service";

type JsonBody = Record<string, unknown>;

function isJsonBody(value: unknown): value is JsonBody {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] || "" : id;
}

function paramKey(req: Request): string {
  const key = req.params.key;
  return Array.isArray(key) ? key[0] || "" : key;
}

function asyncRoute(
  handler: (req: Request, res: Response) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res).catch(next);
  };
}

function bodyOf(req: Request): JsonBody | null {
  return isJsonBody(req.body) ? req.body : null;
}

function failed(res: Response, message: string): void {
  res.status(400).json({ success: false, message, error: message });
}

const admin = requireAdmin;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

export const apiRouter = Router();

apiRouter.post(
  "/auth/login",
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const passcode = stringValue(body?.passcode) || "";
    if (!(await verifyPasscode(passcode))) {
      res.status(401).json({ error: "Incorrect passcode. Access denied." });
      return;
    }
    const token = await createAdminToken();
    res.setHeader("Set-Cookie", createAuthCookie(token));
    res.json({
      success: true,
      token,
      user: { role: "admin" },
      message: "Authenticated successfully.",
    });
  }),
);

apiRouter.post("/auth/logout", (_req, res) => {
  res.setHeader("Set-Cookie", createLogoutCookie());
  res.json({ success: true, message: "Logged out successfully." });
});

apiRouter.get("/auth/verify", admin, (_req, res) => {
  res.json({ authenticated: true, user: { role: "admin" } });
});

apiRouter.get(
  "/events/",
  asyncRoute(async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
    res.json(await listEventsWithStatus());
  }),
);
apiRouter.post(
  "/events/",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const title = stringValue(body?.title);
    const description = stringValue(body?.description);
    const eventDate = stringValue(body?.eventDate);
    if (!title?.trim() || !description?.trim() || !eventDate?.trim()) {
      failed(res, "Title, description, and event date are required.");
      return;
    }
    res.status(201).json(
      await createManagedEvent({
        title,
        description,
        eventDate,
        image: stringValue(body?.image),
        location: stringValue(body?.location),
        startTime: stringValue(body?.startTime),
        endTime: stringValue(body?.endTime),
        endDate: stringValue(body?.endDate),
        registrationLink: stringValue(body?.registrationLink),
        contactInfo: stringValue(body?.contactInfo),
      }),
    );
  }),
);
apiRouter.get(
  "/events/:id",
  asyncRoute(async (req, res) => {
    const event = await getEventWithStatus(paramId(req));
    if (!event) {
      res.status(404).json({ error: "Event not found." });
      return;
    }
    res.json(event);
  }),
);
apiRouter.put(
  "/events/:id",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    if (!body) {
      failed(res, "Invalid request payload.");
      return;
    }
    const patch: Partial<TrustEvent> = {};
    for (const key of [
      "title",
      "description",
      "image",
      "location",
      "eventDate",
      "startTime",
      "endTime",
      "endDate",
      "registrationLink",
      "contactInfo",
    ] as const) {
      const value = stringValue(body[key]);
      if (value !== undefined) patch[key] = value;
    }
    const event = await updateManagedEvent(paramId(req), patch);
    if (!event) {
      res.status(404).json({ error: "Event not found." });
      return;
    }
    res.json(event);
  }),
);
apiRouter.delete(
  "/events/:id",
  admin,
  asyncRoute(async (req, res) => {
    if (!(await deleteEvent(paramId(req)))) {
      res.status(404).json({ error: "Event not found or already deleted." });
      return;
    }
    res.json({ success: true, message: "Event deleted successfully." });
  }),
);

apiRouter.get(
  "/donations/",
  asyncRoute(async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
    res.json(await getAllDonations());
  }),
);
apiRouter.post(
  "/donations/",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const title = stringValue(body?.title);
    const description = stringValue(body?.description);
    const image = stringValue(body?.image);
    if (!title?.trim() || !description?.trim() || !image?.trim()) {
      failed(res, "Title, description, and image are required.");
      return;
    }
    res.status(201).json(
      await createDonation({
        title,
        description,
        image,
        date: stringValue(body?.date),
      }),
    );
  }),
);
apiRouter.get(
  "/donations/:id",
  asyncRoute(async (req, res) => {
    const donation = await getDonationById(paramId(req));
    if (!donation) {
      res.status(404).json({ error: "Donation entry not found." });
      return;
    }
    res.json(donation);
  }),
);
apiRouter.put(
  "/donations/:id",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    if (!body) {
      failed(res, "Invalid request payload.");
      return;
    }
    const patch: Partial<Donation> = {};
    for (const key of ["title", "description", "image", "date"] as const) {
      const value = stringValue(body[key]);
      if (value !== undefined) patch[key] = value;
    }
    const donation = await updateDonation(paramId(req), patch);
    if (!donation) {
      res.status(404).json({ error: "Donation entry not found." });
      return;
    }
    res.json(donation);
  }),
);
apiRouter.delete(
  "/donations/:id",
  admin,
  asyncRoute(async (req, res) => {
    if (!(await deleteDonation(paramId(req)))) {
      res
        .status(404)
        .json({ error: "Donation entry not found or already deleted." });
      return;
    }
    res.json({
      success: true,
      message: "Donation entry deleted successfully.",
    });
  }),
);
apiRouter.post(
  "/donations/seed",
  admin,
  asyncRoute(async (_req, res) => {
    res.json({
      success: true,
      items: await resetDonationsToSeed(),
      message: "Reset to default seed entries.",
    });
  }),
);

apiRouter.get(
  "/gallery/",
  asyncRoute(async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
    res.json(await getAllGalleryImages());
  }),
);
apiRouter.post(
  "/gallery/",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const image = stringValue(body?.image);
    if (!image?.trim()) {
      failed(res, "Image is required.");
      return;
    }
    const title =
      stringValue(body?.title) || stringValue(body?.caption) || "Gallery image";
    res.status(201).json(
      await createGalleryImage({
        title,
        description: stringValue(body?.description),
        image,
        displayOrder:
          typeof body?.displayOrder === "number"
            ? body.displayOrder
            : undefined,
      }),
    );
  }),
);
apiRouter.get(
  "/gallery/:id",
  asyncRoute(async (req, res) => {
    const image = await getGalleryImageById(paramId(req));
    if (!image) {
      res.status(404).json({ error: "Gallery image not found." });
      return;
    }
    res.json(image);
  }),
);
apiRouter.put(
  "/gallery/:id",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    if (!body) {
      failed(res, "Invalid request payload.");
      return;
    }
    const patch: Partial<GalleryImage> = {};
    const title = stringValue(body.title) || stringValue(body.caption);
    if (title !== undefined) patch.title = title;
    for (const key of ["description", "image"] as const) {
      const value = stringValue(body[key]);
      if (value !== undefined) patch[key] = value;
    }
    if (typeof body.displayOrder === "number")
      patch.displayOrder = body.displayOrder;
    const image = await updateGalleryImage(paramId(req), patch);
    if (!image) {
      res.status(404).json({ error: "Gallery image not found." });
      return;
    }
    res.json(image);
  }),
);
apiRouter.delete(
  "/gallery/:id",
  admin,
  asyncRoute(async (req, res) => {
    if (!(await deleteGalleryImage(paramId(req)))) {
      res
        .status(404)
        .json({ error: "Gallery image not found or already deleted." });
      return;
    }
    res.json({ success: true, message: "Gallery image deleted successfully." });
  }),
);

apiRouter.get(
  "/members/",
  asyncRoute(async (req, res) => {
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
    res.json(await getAllMembers(req.query.active === "true"));
  }),
);
apiRouter.post(
  "/members/",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const name = stringValue(body?.name);
    const position = stringValue(body?.position) || stringValue(body?.role);
    if (!name?.trim() || !position?.trim()) {
      failed(res, "Name and position are required.");
      return;
    }
    res.status(201).json(
      await createMember({
        name,
        position,
        biography: stringValue(body?.biography) || stringValue(body?.bio),
        image: stringValue(body?.image),
        qualification: stringValue(body?.qualification),
        experience: stringValue(body?.experience),
        phone: stringValue(body?.phone),
        email: stringValue(body?.email),
        isActive: body?.isActive === 0 || body?.active === false ? 0 : 1,
      }),
    );
  }),
);
apiRouter.get(
  "/members/:id",
  asyncRoute(async (req, res) => {
    const member = await getMemberById(paramId(req));
    if (!member) {
      res.status(404).json({ error: "Member not found." });
      return;
    }
    res.json(member);
  }),
);
apiRouter.put(
  "/members/:id",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    if (!body) {
      failed(res, "Invalid request payload.");
      return;
    }
    const patch: Partial<Member> = {};
    for (const key of [
      "name",
      "image",
      "qualification",
      "experience",
      "phone",
      "email",
    ] as const) {
      const value = stringValue(body[key]);
      if (value !== undefined) patch[key] = value;
    }
    const position = stringValue(body.position) || stringValue(body.role);
    const biography = stringValue(body.biography) || stringValue(body.bio);
    if (position !== undefined) patch.position = position;
    if (biography !== undefined) patch.biography = biography;
    if (typeof body.isLeadership === "number")
      patch.isLeadership = body.isLeadership;
    if (typeof body.isActive === "number") patch.isActive = body.isActive;
    else if (typeof body.active === "boolean")
      patch.isActive = body.active ? 1 : 0;
    if (typeof body.displayOrder === "number")
      patch.displayOrder = body.displayOrder;
    const member = await updateMember(paramId(req), patch);
    if (!member) {
      res.status(404).json({ error: "Member not found." });
      return;
    }
    res.json(member);
  }),
);
apiRouter.delete(
  "/members/:id",
  admin,
  asyncRoute(async (req, res) => {
    if (!(await deleteMember(paramId(req)))) {
      res.status(404).json({ error: "Member not found or already deleted." });
      return;
    }
    res.json({ success: true, message: "Member deleted successfully." });
  }),
);

apiRouter.get(
  "/settings/",
  asyncRoute(async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
    res.json(await getAllSiteSettings());
  }),
);
apiRouter.put(
  "/settings/",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    if (!body) {
      failed(res, "Invalid payload. Expected a dictionary of key-value pairs.");
      return;
    }
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") {
        failed(res, "Setting values must be strings.");
        return;
      }
      await setSiteSetting(key, value);
    }
    res.json(await getAllSiteSettings());
  }),
);

apiRouter.get(
  "/background/",
  asyncRoute(async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=10, s-maxage=30");
    res.json(await getActiveBackground());
  }),
);
apiRouter.get(
  "/background/all",
  admin,
  asyncRoute(async (_req, res) => {
    res.json(await getAllBackgrounds());
  }),
);
apiRouter.post(
  "/background/",
  admin,
  asyncRoute(async (req, res) => {
    const image = stringValue(bodyOf(req)?.image);
    if (!image?.trim()) {
      failed(res, "Image is required.");
      return;
    }
    const background = await createBackground(image);
    await setActiveBackground(background.id);
    res.status(201).json(background);
  }),
);
apiRouter.put(
  "/background/",
  admin,
  asyncRoute(async (req, res) => {
    const id = stringValue(bodyOf(req)?.id);
    if (!id?.trim()) {
      failed(res, "Background ID is required.");
      return;
    }
    const found = (await getAllBackgrounds()).some((item) => item.id === id);
    if (!found) {
      res.status(404).json({ error: "Background not found." });
      return;
    }
    await setActiveBackground(id);
    res.json(await getActiveBackground());
  }),
);
apiRouter.delete(
  "/background/",
  admin,
  asyncRoute(async (_req, res) => {
    const background = await getActiveBackground();
    if (!background || !(await deleteBackground(background.id))) {
      res.status(404).json({ error: "No active background image was found." });
      return;
    }
    res.json({ success: true, message: "Active background image deleted." });
  }),
);
apiRouter.delete(
  "/background/:id",
  admin,
  asyncRoute(async (req, res) => {
    if (!(await deleteBackground(paramId(req)))) {
      res
        .status(404)
        .json({ error: "Background not found or already deleted." });
      return;
    }
    res.json({ success: true, message: "Background deleted successfully." });
  }),
);

apiRouter.get(
  "/payments/",
  admin,
  asyncRoute(async (req, res) => {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    res.json(await getAllDonationPayments(status));
  }),
);
apiRouter.post(
  "/payments/",
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const donorName = stringValue(body?.donorName);
    const amount = body?.amount;
    if (
      !donorName?.trim() ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      failed(res, "Donor name and a valid amount are required.");
      return;
    }
    res.status(201).json(
      await createDonationPayment({
        donorName,
        amount,
        donorEmail: stringValue(body?.donorEmail),
        donorPhone: stringValue(body?.donorPhone),
        message: stringValue(body?.message),
        paymentStatus: "pending",
      }),
    );
  }),
);
apiRouter.get(
  "/payments/:id",
  admin,
  asyncRoute(async (req, res) => {
    const payment = await getDonationPaymentById(paramId(req));
    if (!payment) {
      res.status(404).json({ error: "Payment not found." });
      return;
    }
    res.json(payment);
  }),
);
apiRouter.put(
  "/payments/:id",
  admin,
  asyncRoute(async (req, res) => {
    const body = bodyOf(req);
    const status =
      stringValue(body?.paymentStatus) || stringValue(body?.status);
    if (!status?.trim()) {
      failed(res, "Payment status is required.");
      return;
    }
    const payment = await updateDonationPaymentStatus(
      paramId(req),
      status,
      stringValue(body?.transactionId),
    );
    if (!payment) {
      res.status(404).json({ error: "Payment not found." });
      return;
    }
    res.json(payment);
  }),
);

apiRouter.post(
  "/upload",
  admin,
  upload.single("file"),
  express.raw({ type: "image/*", limit: "10mb" }),
  asyncRoute(async (req, res) => {
    const file = req.file;
    if (file) {
      res.json({
        success: true,
        ...(await uploadImage(
          file.buffer,
          file.mimetype,
          file.originalname,
        )),
      });
      return;
    }
    if (Buffer.isBuffer(req.body)) {
      res.json({
        success: true,
        ...(await uploadImage(
          req.body,
          req.get("content-type") || "image/jpeg",
          "upload",
        )),
      });
      return;
    }
    const body = bodyOf(req);
    if (body) {
      let mime = stringValue(body.contentType) || "image/jpeg";
      let base64 = stringValue(body.base64) || "";
      const dataUrl = stringValue(body.dataUrl);
      if (dataUrl?.startsWith("data:")) {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mime = match[1];
          base64 = match[2];
        }
      }
      if (!base64) {
        failed(res, "Missing image data in request.");
        return;
      }
      res.json({
        success: true,
        ...(await uploadImage(
          Buffer.from(base64, "base64"),
          mime,
          stringValue(body.filename),
        )),
      });
      return;
    }
    failed(res, "No file provided in form data.");
  }),
);

apiRouter.get(
  "/images/:key",
  asyncRoute(async (req, res) => {
    const image = await getImage(paramKey(req));
    if (!image) {
      res.status(404).send("Image not found.");
      return;
    }
    res.setHeader("Content-Type", image.contentType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    if (image.size) res.setHeader("Content-Length", String(image.size));
    res.send(Buffer.from(image.body));
  }),
);

apiRouter.delete(
  "/images/:key",
  admin,
  asyncRoute(async (req, res) => {
    await deleteImage(paramKey(req));
    res.json({ success: true });
  }),
);
