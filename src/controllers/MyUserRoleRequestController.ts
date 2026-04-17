import type { Request, Response } from "express";
import User from "../models/user.js";
import RoleRequest from "../models/roleRequest.js";
import { sendEmail } from "../services/resend.js";
import { ADMIN_ID } from "../constants.js";
import { newRoleRequest } from "../services/template.js";

const getRoleRequest = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingRequest = await RoleRequest.findOne({ userId: user._id });

    if (!existingRequest) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({
      exists: true,
      request: {
        userId: existingRequest._id,
        status: existingRequest.status,
        requestedRole: existingRequest.requestedRole,
        currentRole: existingRequest.currentRole,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while fetching role request!" });
  }
};

const createRoleRequest = async (req: Request, res: Response) => {
  try {
    const { fullAddress, reason, documents, requestedRole, feedback } =
      req.body;

    const existingUser = await User.findById(req.userId);

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingPending = await RoleRequest.findOne({
      userId: existingUser._id,
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending request",
      });
    }

    const roleRequest = new RoleRequest({
      userId: existingUser._id,
      requestedRole: requestedRole,
      reason,
      status: "pending",
      userFeedback: feedback,
      address: fullAddress,
      documents,
      currentRole: existingUser.role,
    });

    // send email to user once they send the request
    await sendEmail({
      from: "onboarding@resend.dev",
      to: [existingUser.email],
      cc: [ADMIN_ID],
      subject: `Request for Role Change | ${roleRequest.currentRole} - ${roleRequest.requestedRole}`,
      template: newRoleRequest({
        name: existingUser.name!,
        currentRole: existingUser.role!,
      }),
    });

    await roleRequest.save();

    res.status(201).json({
      id: roleRequest._id,
      status: roleRequest.status,
      requestRole: roleRequest.requestedRole,
      currentRole: roleRequest.currentRole,
      reason: roleRequest.reason,
      userFeedback: roleRequest.userFeedback,
      address: roleRequest.address,
      documents: roleRequest.documents,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while creating role request" });
  }
};

const getAllRoleRequests = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (user?.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorised access!" });
    }

    const roleRequests = await RoleRequest.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    if (roleRequests.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: roleRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while fetching role requests" });
  }
};

export default {
  createRoleRequest,
  getRoleRequest,
  getAllRoleRequests,
};
