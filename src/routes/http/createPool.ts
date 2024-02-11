import { FastifyInstance } from "fastify";
import z from "zod";
import { prismaClient } from "../../lib/prismaClient";

export async function createPool(app: FastifyInstance) {
    app.post("/polls", async (req, reply) => {
        const createPoolBody = z.object({
            title: z.string(),
            options: z.array(z.string())
        });
        const { title, options } = createPoolBody.parse(req.body);
        const { id } = await prismaClient.poll.create({
            data: {
                title,
                options: {
                    createMany: {
                        data: options.map(option => {
                            return { title: option }
                        })
                    }
                }
            }
        })
        return reply.status(201).send({
            poolID: id
        })
    });
}