import { model, Schema, Model, Document, Types } from "mongoose";

export interface IQRInquiry {
  qrCode: string;
  ttl: number;
  user: Types.ObjectId;
}
export interface QRInquiryDocument extends IQRInquiry, Document {}

const QRInquirySchema: Schema = new Schema({
  ttl: { type: Number, required: true },
  qrCode: { type: String, required: true },
  user: { type: Types.ObjectId, required: true, ref:"User" },
  createdAt: { type: Date, required: true, default: Date.now() },
  updatedAt: { type: Date, required: true, default: Date.now() },
});
export const QRInquiry: Model<QRInquiryDocument> = model(
  "qrinquiry",
  QRInquirySchema
);
