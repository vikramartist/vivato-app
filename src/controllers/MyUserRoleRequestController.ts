import type { Request, Response } from "express";
import User from "../models/user.js";
import RoleRequest from "../models/roleRequest.js";
import { inngest } from "../inngest/index.js";

const getRoleRequest = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingRequest = await RoleRequest.findOne({
      userId: user._id,
    }).sort({ createdAt: -1 });

    if (!existingRequest) {
      return res.status(200).json({ exists: false });
    }

    if (existingRequest.status === "declined") {
      return res.status(200).json({
        exists: false,
        request: {
          userId: existingRequest._id,
          status: existingRequest.status,
          requestedRole: existingRequest.requestedRole,
          currentRole: existingRequest.currentRole,
        },
      });
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
    const {
      fullAddress,
      reason,
      documents,
      requestedRole,
      feedback,
      name,
      email,
    } = req.body;

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

    await roleRequest.save();

    // send email to user once they send the request
    inngest
      .send({
        name: "role/requested",
        data: {
          email: email as string,
          name: name as string,
          currentRole: existingUser.role as string,
          requestedRole: roleRequest.requestedRole as string,
        },
      })
      .catch((error) => {
        console.error(`[INNGEST_ERROR] in role request mailer:${error}`);
      });

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

const getRoleRequestById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (user?.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorised access!" });
    }

    const { requestId } = req.params;

    const roleRequest = await RoleRequest.findById(requestId).populate(
      "userId",
      "name email role",
    );

    if (!roleRequest) {
      return res.status(404).json({ message: "Role Request not found" });
    }

    res.status(200).json({ data: roleRequest });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error while fetching role request for id ${req.params.requestId}`,
    });
  }
};

export const approveRoleRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const { comments } = req.body;

    console.log(req.body);
    console.log(req.params);

    const updatedRequest = await RoleRequest.findByIdAndUpdate(
      requestId,
      {
        status: "approved",
        currentRole: "Owner",
        updatedAt: new Date(),
        comments,
      },
      { new: true },
    );

    console.log("updatedRequest:", updatedRequest);

    if (!updatedRequest) {
      return res.status(404).json({
        message: `Role request with the request ID:${requestId} not found`,
      });
    }

    console.log(updatedRequest);

    const user = await User.findByIdAndUpdate(
      updatedRequest.userId,
      {
        role: updatedRequest.requestedRole,
      },
      { returnDocument: "after" },
    ).lean();

    // send email to user once they send the request
    inngest
      .send({
        name: "role/approve",
        data: {
          email: user?.email as string,
          name: user?.name as string,
          requestedRole: user?.role as string,
          status: updatedRequest.status,
          comments: updatedRequest.comments,
        },
      })
      .catch((error) => {
        console.error(`[INNGEST_ERROR] in role request mailer:${error}`);
      });

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error approving role request" });
  }
};

export const rejectRoleRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;

    const { comments } = req.body;

    const rejectedRequest = await RoleRequest.findByIdAndUpdate(
      requestId,
      {
        status: "declined",
        currentRole: "Customer",
        updatedAt: new Date(),
        comments,
      },
      { new: true },
    );

    if (!rejectedRequest) {
      return res.status(404).json({
        message: `Role request with the request ID:${requestId} not found`,
      });
    }

    const user = await User.findByIdAndUpdate(rejectedRequest.userId, {
      role: rejectedRequest.currentRole,
    });

    // send email to user once they send the request
    inngest
      .send({
        name: "role/decline",
        data: {
          email: user?.email as string,
          name: user?.name as string,
          requestedRole: user?.role as string,
          status: rejectedRequest.status,
          comments: rejectedRequest.comments,
        },
      })
      .catch((error) => {
        console.error(`[INNGEST_ERROR] in role request mailer:${error}`);
      });
    res.status(200).json(rejectedRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error rejecting role request!" });
  }
};

export default {
  createRoleRequest,
  getRoleRequest,
  getAllRoleRequests,
  getRoleRequestById,
  approveRoleRequest,
  rejectRoleRequest,
};
