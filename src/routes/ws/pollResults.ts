import { FastifyInstance } from "fastify";
import z from "zod";
import { votingPubSub } from "../../utils/votingPubSub";

export async function pollResults(app: FastifyInstance) {
    app.get("/polls/:pollID/results", { websocket: true }, (connection, req) => {
        const pollResultsParams = z.object({
            pollID: z.string().uuid()
        });
        const { pollID } = pollResultsParams.parse(req.params);
        
        votingPubSub.subscribe(pollID, (message) => {
            connection.socket.send(JSON.stringify(message))
        })
    });
}