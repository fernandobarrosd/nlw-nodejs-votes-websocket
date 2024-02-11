import { FastifyInstance } from "fastify";
import z from "zod";
import { prismaClient } from "../../lib/prismaClient";
import { redis } from "../../lib/redis";

export async function getPoolByID(app: FastifyInstance) {
    app.get("/polls/:pollID", async (req, reply) => {
        const poolParams = z.object({
            pollID: z.string().uuid()
        });
        
        const { pollID } = poolParams.parse(req.params);

        const poll = await prismaClient.poll.findUnique({
            include: {
                options: {
                    select: {
                        id: true,
                        title: true,
                    }
                }
            },
            where: { id: pollID }
        })

        if (!poll) {
            return reply.status(40).send({
                message: "Pool not exists",
                statusCode: 401
            })
        }

        const results = await redis.zrange(pollID, 0, -1, "WITHSCORES");
        const votesData = results.reduce((voteData, line, index) => {
            if (index %2 === 0) {
                const score = results[index + 1];
                Object.assign(voteData, { [line]: score });
            }
            return voteData;
        }, {} as Record<string, number>);

        const { id, title, options } = poll;
        
        return reply.send({
            id,
            title,
            options: options.map(option => ({
                id: option.id,
                title: option.title,
                votesCount: (option.id in votesData) ? votesData[option.id] : 0
            }))
        });
    });
}