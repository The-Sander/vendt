import { Request, Response } from "express";
import { CrudController } from "../CrudController";
import { Types } from "mongoose";
import { Alert, IAlert } from "../../model/Alert";
import filter from "../../helpers/filter";
import { Machine } from "../../model/Machine";
class AlertController extends CrudController {
  constructor() {
    super();
  }
  public async create(req: Request, res: Response) {
    const { qry } = req.body;
    const company = req.body?.user?.company?._id
    if(!company) throw new Error("Company not found")
    const { msg, urgency, tag, user, machine } = qry;
    let alert: IAlert = {
      msg,
      tag,
      urgency,
      company
    };
    if (req.body?.machineId || machine) {
      const machineId = req.body?.machineId || machine;
      if (!Types.ObjectId.isValid(machineId))
        throw new Error("MachineId not valid");
      alert = { ...alert, machine: machineId };
    }
    if (user) {
      if (!Types.ObjectId.isValid(user)) throw new Error("user not valid");
      alert = { ...alert, user };
    }

    const response = await Alert.create(alert);
    res.json(response);
  }

  public async createFromMachine(req:Request, res:Response){
    const { qry } = req.body;
    const {machineId} = req.body
    if(!machineId) throw new Error("machineId not found")
    const machine = await Machine.findOne({_id:machineId});
    if(!machine) throw new Error("machine not found")
    const company = machine.company
    const { msg, urgency, tag, user } = qry;
    let alert: IAlert = {
      msg,
      tag,
      urgency,
      company,
      machine:machineId
    };
    
    if (user) {
      if (!Types.ObjectId.isValid(user)) throw new Error("user not valid");
      alert = { ...alert, user };
    }

    const response = await Alert.create(alert);
    res.json(response);
  }
  public async read(req: Request, res: Response) {
    const { machine, id, user, tag } = req.query;
    const company = req.body?.user?.company?._id
    if(!company) throw new Error("Company not found")
    const query = {
      machine,
      _id: id,
      user,
      tag,
      company
    };

    const toSearch = filter(query);

    const response = await Alert.find(toSearch);
    res.json(response);
  }
  public async update(req: Request, res: Response) {
    const { qry } = req.body;
    const { msg, urgency, tag, user, machine, id } = qry;
    let alert: IAlert = {
      msg,
      tag,
      urgency,
      user,
      machine,
    };

    const update = filter(alert);
    const response = await Alert.findByIdAndUpdate({_id:id}, {...update}, {new:true, useFindAndModify:false})
    res.json(response)

  }
  public async delete(req: Request, res: Response) {
    const { qry } = req.body;
    const {  id } = qry;
    const response = await Alert.findOneAndDelete({_id:id});
    res.json(response)
  }
}
export const alertController = new AlertController();
