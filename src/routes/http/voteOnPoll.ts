import { FastifyInstance } from "fastify";
import z from "zod";
import { prismaClient } from "../../lib/prismaClient";
import { randomUUID } from "node:crypto";
import { redis } from "../../lib/redis";
import { votingPubSub } from "../../utils/votingPubSub";

export async function voteOnPoll(app: FastifyInstance) {
    app.post("/polls/:pollID/votes", async (req, reply) => {
        const voteOnPollParams = z.object({
            pollID: z.string().uuid()
        });
        const createPoolBody = z.object({
            pollOptionID: z.string().uuid(),
        });
        const { pollID } = voteOnPollParams.parse(req.params);
        const { pollOptionID } = createPoolBody.parse(req.body);

        let { sessionId } = req.cookies;

        const poll = await prismaClient.poll.findUnique({
            where: { id: pollID }
        });

        if (!poll) {
            return reply.status(400).send({
                message: "Pool not exists",
                statusCode: 401
            })
        }

        if (sessionId) {
            const userPreviousVoteOnPoll = await prismaClient.vote.findUnique({
                where: {
                    sessionID_pollID: {
                        sessionID: sessionId,
                        pollID
                    }
                }
            });
            if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionID !== pollOptionID) {
                await prismaClient.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                });
                const votes = await redis.zincrby(pollID, 1, userPreviousVoteOnPoll.pollOptionID);
                votingPubSub.publish(pollID, {
                    pollOptionID,
                    votes: parseInt(votes)
                });
            }
            else if (userPreviousVoteOnPoll) {
                return reply.status(400).send({
                    message: "You already voted on this poll",
                    statusCode: 400
                });
            }
        }

        if (!sessionId) {
            sessionId = randomUUID();

            reply.setCookie("sessionId", sessionId, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
                signed: true,
                httpOnly: true
            });
        }
        const vote = await prismaClient.vote.create({
            data: {
                sessionID: sessionId,
                pollID,
                pollOptionID
            },
            include: {
                poll: true,
                pollOption: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        
        const votes = await redis.zincrby(pollID, 1, pollOptionID);

        votingPubSub.publish(pollID, {
            pollOptionID,
            votes: parseInt(votes)
        });

        
        return reply.status(201).send({
            sessionID: sessionId,
            id: vote.id,
            createdAt: vote.createdAt,
            poll: {
                id: vote.pollID,
                title: vote.poll.title,
            },
            votedPollOption: {
                id: vote.pollOptionID,
                title: vote.pollOption.title,
                votesCount: parseInt(votes)
            }
        })
    });
}