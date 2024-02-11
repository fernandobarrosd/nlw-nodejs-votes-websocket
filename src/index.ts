import fastify from "fastify";
import { createPool } from "./routes/http/createPool";
import { getPoolByID } from "./routes/http/getPoolByID";
import { voteOnPoll } from "./routes/http/voteOnPoll";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { pollResults } from "./routes/ws/pollResults";

const app = fastify();
const PORT = 3000;

app.register(cookie, {
    secret: "@nlw-nodejs-votes-websocket/secret-cookie",
    hook: "onRequest"
});
app.register(websocket);
app.register(createPool);
app.register(getPoolByID);
app.register(voteOnPoll);
app.register(pollResults);

app.get("/", _ => {
    return { message: "Server is on", statusCode: 201 }
});

app.listen({ port: PORT }).then(() => {
    console.log(`Server is starting on http://localhost:${PORT}`);
});