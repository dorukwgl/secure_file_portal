import { EStatus, Prisma } from "@prisma/client";
import ModelReturnTypes from "../../entities/ModelReturnTypes";
import formatValidationErrors from "../../utils/formatValidationErrors";
import { hashPassword } from "../../utils/hash";
import prismaClient from "../../utils/prismaClient";
import User, { UserType } from "../../validations/User";
import PaginationParams, { PaginationParamsType } from "../../validations/PaginationParams";
import Paginator from "../../utils/paginator";
import PaginationReturnTypes from "../../entities/PaginationReturnTypes";
import { z } from "zod";

const registerUser = async (body: UserType) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const validation = User.safeParse(body);
    const error = formatValidationErrors(validation);
    if (error) return error;

    const data = validation.data!;
    data.password = await hashPassword(data.password);

    // check if user alredy exists
    const user = await prismaClient.users.findUnique({
        where: {
            username: data.username
        }
    });
    if (user) {
        res.error = {error: "User alrady exists"};
        return res;
    }

    res.data = await prismaClient.users.create({
        data,
        omit: { password: true },
    });

    res.statusCode = 200;
    return res;
};

const getUser = async (userId: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const user = await prismaClient.users.findUnique({
        where: {
            userId,
        },
        omit: { password: true },
    });

    if (!user) {
        res.error = "User not found";
        return res;
    }

    res.data = user;
    res.statusCode = 200;
    return res;
};

const disableUser = async (userId: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const user = await getUser(userId);
    if (!user) {
        res.error = "User not found";
        return res;
    }

    res.data = await prismaClient.users.update({
        where: {
            userId,
        },
        data: {
            status: EStatus.Disabled,
        },
    });

    return res;
};

const enableUser = async (userId: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const user = await getUser(userId);
    if (!user) {
        res.error = "User not found";
        return res;
    }

    res.data = await prismaClient.users.update({
        where: {
            userId,
        },
        data: {
            status: EStatus.Active,
        },
    });

    return res;
};

const searchUsers = async (params: PaginationParamsType) => {
    const res = { statusCode: 200 } as PaginationReturnTypes;

  const validation = PaginationParams.extend({
    accountStatus: z.nativeEnum(EStatus).optional(),
    expired: z.coerce.boolean().optional(),
  }).safeParse(params);
  const errRes = formatValidationErrors<PaginationParamsType>(validation);
  if (errRes) {
    res.error = errRes.error;
    return res;
  }

  const data = validation.data!;
  const seed = data.seed;

  return new Paginator<Prisma.UsersFindManyArgs>(
    "users",
    {
      where: {
        AND: [
          {
            OR: [
              { fullName: seed ? { contains: seed } : undefined },
              { username: seed ? { contains: seed } : undefined },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    },
    params
  ).get();
};

const changePassword = async (userId: string, password: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const user = await getUser(userId);
    if (!user) {
        res.error = "User not found";
        return res;
    }

    res.data = await prismaClient.users.update({
        where: {
            userId,
        },
        data: {
            password: await hashPassword(password),
        },
    });

    res.statusCode = 200;
    return res;
};

export {
    registerUser,
    getUser,
    disableUser,
    enableUser,
    searchUsers,
    changePassword
}