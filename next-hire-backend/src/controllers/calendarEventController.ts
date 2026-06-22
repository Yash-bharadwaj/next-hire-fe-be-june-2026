import { Response } from "express";
import { Op } from "sequelize";
import { CalendarEvent } from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

// List the current user's calendar events, optionally within a date range
export const listCalendarEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { from, to } = req.query;

  const whereConditions: any = { created_by: userId };
  if (from || to) {
    whereConditions.date = {};
    if (from) whereConditions.date[Op.gte] = from;
    if (to) whereConditions.date[Op.lte] = to;
  }

  const events = await CalendarEvent.findAll({
    where: whereConditions,
    order: [["date", "ASC"], ["start_time", "ASC"]],
  });

  res.json({ success: true, data: { events } });
});

export const createCalendarEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { title, description, date, start_time, end_time, event_type, task_type, status } = req.body;

  const event = await CalendarEvent.create({
    title,
    description,
    date,
    start_time,
    end_time,
    event_type: event_type || "other",
    task_type: task_type || "my-task",
    status: status || "pending",
    created_by: userId!,
  });

  res.status(201).json({ success: true, message: "Event created successfully", data: { event } });
});

export const updateCalendarEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { eventId } = req.params;

  const event = await CalendarEvent.findOne({ where: { id: eventId, created_by: userId } });
  if (!event) {
    throw createError("Event not found", 404);
  }

  const { title, description, date, start_time, end_time, event_type, task_type, status } = req.body;
  await event.update({
    title: title !== undefined ? title : event.title,
    description: description !== undefined ? description : event.description,
    date: date !== undefined ? date : event.date,
    start_time: start_time !== undefined ? start_time : event.start_time,
    end_time: end_time !== undefined ? end_time : event.end_time,
    event_type: event_type !== undefined ? event_type : event.event_type,
    task_type: task_type !== undefined ? task_type : event.task_type,
    status: status !== undefined ? status : event.status,
  });

  res.json({ success: true, message: "Event updated successfully", data: { event } });
});

export const deleteCalendarEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { eventId } = req.params;

  const event = await CalendarEvent.findOne({ where: { id: eventId, created_by: userId } });
  if (!event) {
    throw createError("Event not found", 404);
  }

  await event.destroy();

  res.json({ success: true, message: "Event deleted successfully" });
});
