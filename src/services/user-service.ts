import { Role, User } from "@prisma/client"
import prisma from "../prisma"

export const UserService = {

    async createUser(input: {email: string, tenantId: string, role: Role}): Promise<User> {
        const {
            email,
            tenantId,
            role,
        } = input

        const user = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    tenantId,
                    role,
                },
            })

            await tx.log.create({
                data: {
                    tenantId,
                    event: 'USER_CREATED',
                    data: {
                        email,
                        role,
                    },
                },
            })

            return user
        })

        return user
    }
}