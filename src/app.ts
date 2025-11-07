import express from "express";
import "express-async-errors";
import cors from "cors";
import initializeRoutes from "./startup/routes";
import errorHandler from "./middlewares/errorHandler";
import routesLogger from "./utils/routesLogger";
import "./utils/bigintSerializer"
import prod from "./startup/production";

const app = express();

const corsConfig = cors({
    credentials: true,
    origin: (origin, callback) => {
        const allowedOrigins = ["http://10.42.0.1:3000", "http://localhost:5173", "http://localhost:3000", "http://localhost:8080"];
        // just for testing
        // callback(null, true);
        // return;
        if (!origin || allowedOrigins.includes(origin))
            callback(null, true);
        else
            callback(new Error("Whoa Whoa Whoa, Not allowed by cors"));
    },
});

app.use(corsConfig);

// increase the payload size
app.use(express.json({limit: "2048mb"}));

// apply production settings and protections
if (process.env.NODE_ENV === "production") 
    prod(app);

if (process.env.NODE_ENV === "development")
    app.use(routesLogger);

initializeRoutes(app);

app.get("/", (req, res) => {
    res.json({"message": "Welcome to my app"});
});

// handle and log async errors
app.use(errorHandler);

export default app;
