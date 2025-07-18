import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// connecting database
connectDB();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// API ENDPOINT
app.get("/", (req, res, next) => {
    res.json({ message: "API WORKING" });
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.use((error, req, res, next) => {
    const status = error.statusCode;
    const message = error.message;
    const data = error.data;
    return res.status(status).json({ message: message, data: data });
});

app.listen(port, () => console.log(`Server started on PORT:${port}`));
