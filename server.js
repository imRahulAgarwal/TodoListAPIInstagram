import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDatabase from "./config/connectDatabase.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import router from "./routes/routes.js";

const PORT = process.env.PORT || 3000;
const ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || "*";

const app = express();

connectDatabase();

app.use(
    cors({
        origin: ORIGINS,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use(errorMiddleware);

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
