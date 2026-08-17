import Notification from "./notification.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

// ─── GET USER NOTIFICATIONS ────────────────────────────────────────────────
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, isRead } = req.query;

  const filter = { user: req.user._id };
  if (type) filter.type = type;
  if (isRead !== undefined) filter.isRead = isRead === "true";

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("relatedId");

  const total = await Notification.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Notifications fetched successfully"
    )
  );
});

// ─── GET UNREAD COUNT ─────────────────────────────────────────────────────
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, "Unread count fetched successfully")
  );
});

// ─── MARK AS READ ─────────────────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
});

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

// ─── DELETE NOTIFICATION ──────────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Notification deleted"));
});

// ─── DELETE ALL NOTIFICATIONS ──────────────────────────────────────────────
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications deleted"));
});

// ─── CREATE NOTIFICATION (Internal use) ────────────────────────────────────
export const createNotification = asyncHandler(async (data) => {
  const notification = await Notification.create(data);
  return notification;
});