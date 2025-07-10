import mongoose from "mongoose";

export default function connectDB() {
    mongoose
        .connect(`${process.env.MONGODB_URI}/mern-auth`)
        .then(() => console.log("Database connected"))
        .catch((err) => console.error(err));
}
