import express, { NextFunction, Request, Response } from "express";
import { IUser, User, UserDocument } from "../model/User";
import RoleManager from "../manager/RoleManager";
import { Types } from "mongoose";
import { Company } from "../model/Company";

const roleManager = RoleManager.Instance;

export const hasQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.qry) throw new Error("No qry found in request body");
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const secured = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uid, company, fromCompany } = req.body;
  try {
    if (!uid) throw new Error("No uid");
    if (!company) throw new Error("no company");
    if (!Types.ObjectId.isValid(uid)) throw new Error("uid not valid");
    if (!Types.ObjectId.isValid(company)) throw new Error("uid not valid");

    //check if valid user
    const user = await User.findOne({ _id: uid });
    if (!user) throw new Error("User not found");
    req.body.role = user.role;
    //check if valid company
    const copmany = await Company.findOne({ _id: company });
    if (!copmany) throw new Error("Company not found");

    if (fromCompany) {
      const r = roleManager.getRoleById(user.role, company);
      if (!r || !r.permissions.global) {
        throw new Error("User has insufficient permissions");
      }
      if (!Types.ObjectId.isValid(fromCompany))
        throw new Error("fromCompany is not valid");
    }

    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
export const globalCompanyWrite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid, company, role } = req.body;
    const r = role
      ? roleManager.getRoleById(role, company)
      : User.findOne({ _id: uid })?.role;
    if (r && r.permissions.company == "write" && r.permissions.global) {
      next();
    } else if (r && r.permissions.company == "write" && !r.permissions.global) {
      throw new Error("user has no global write rights");
    } else if (r && r.permissions.company != "write") {
      throw new Error("user has no company write rights");
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
export const writeUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid, company, role } = req.body;
    if (role) {
      const r = roleManager.getRoleById(role, company);
      if (r && r.permissions.users == "write") {
        next();
      }
    } else {
      const user = await User.findById(uid);
      if (!user) {
        throw new Error("Uid not found");
      }
      const r = roleManager.getRoleById(user.role, company);
      if (r && r.permissions.users == "write") {
        next();
      } else {
        throw new Error("User has no access");
      }
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
export const readUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid, company, role } = req.body;
    if (role) {
      const r = roleManager.getRoleById(role, company);
      if (
        (r && r.permissions.users == "read") ||
        r?.permissions.users == "write"
      ) {
        console.log("next");
        next();
      }
    } else {
      console.log("reading user");
      const user = await User.findById(uid);
      if (!user) {
        throw new Error("Uid not found");
      }
      const r = roleManager.getRoleById(user.role, company);
      if (
        r &&
        (r.permissions.users == "read" || r.permissions.users == "write")
      ) {
        next();
      } else {
        throw new Error("User has no access");
      }
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const writeCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid, company, role } = req.body;

    const r = roleManager.getRoleById(
      role || (await User.findOne({ _id: uid, company })?.role),
      company
    );
    if (!r || r.permissions.company != "write") {
      throw new Error("User has no company write rights");
    }
    next();
  } catch (err) {
    res.json(401).json({ error: err.message });
  }
};
export const readCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid, company, role } = req.body;

    const r = roleManager.getRoleById(
      role || (await User.findOne({ _id: uid, company })?.role),
      company
    );
    if (
      !r ||
      !(r.permissions.company == "read" || r.permissions.company == "write")
    ) {
      throw new Error("User has no company read rights");
    }
    next();
  } catch (err) {
    res.json(401).json({ error: err.message });
  }
};

export const checkIfUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.body.qry;
  if (id) {
    next("route");
  } else {
    next();
  }
};

export const securedWithQuery = [secured, hasQuery];
