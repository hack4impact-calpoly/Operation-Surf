import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AdminSchema = new Schema(
  {
    adminId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    role: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
  },
  {
    timestamps: true,
  },
);

export type AdminDocument = InferSchemaType<typeof AdminSchema>;

const Admin: Model<AdminDocument> =
  (mongoose.models.Admin as Model<AdminDocument>) || mongoose.model<AdminDocument>("Admin", AdminSchema);

export default Admin;
