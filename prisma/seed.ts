import { EStatus, EUserRoles } from "@prisma/client";
import prismaClient from "../src/utils/prismaClient";
import { hashPassword } from "../src/utils/hash";

async function main() {
    await prismaClient.users.createMany({
        data: [{
                fullName: "Administrator",
                username: "admin",
                password: await hashPassword("~123~456~"),
                status: EStatus.Active,
                role: EUserRoles.Admin,
            },
            {
                fullName: "System Admin",
                username: "sysadmin",
                password: await hashPassword("~~654~~321~~"),
                status: EStatus.Active,
                role: EUserRoles.User,
            }
        ]
    });
}

main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
            console.error(e)
            await prismaClient.$disconnect()
            process.exit(1)
        })