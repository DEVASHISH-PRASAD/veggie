import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "driver", "admin"],
      default: "customer",
    },
    avatarSecureUrl: {
      type: String,
      default: "https://res.cloudinary.com/placeholder/avatar.png",
    },
    isVerified: { type: Boolean, default: false },
    addresses: [
      {
        flatAndBuilding: { type: String, required: true },
        areaLandmark: { type: String, required: true },
        pincode: { type: String, required: true },
        zone: {
          type: String,
          required: true,
          enum: [
            "Civil Lines",
            "Katra",
            "Mundera",
            "Jhalwa",
            "Teliyarganj",
            "Naini",
          ],
        },
      },
    ],
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
