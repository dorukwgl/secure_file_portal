import ModelReturnTypes from "../../entities/ModelReturnTypes";
import PaginationReturnTypes from "../../entities/PaginationReturnTypes";
import formatValidationErrors from "../../utils/formatValidationErrors";
import prismaClient from "../../utils/prismaClient";
import Sample, { SampleType } from "../../validations/Sample";
import PaginationParams, { PaginationParamsType } from "../../validations/PaginationParams";
import paginateItems from "../../utils/paginator";
import { Prisma } from "@prisma/client";
import Paginator from "../../utils/paginator";


const createSample = async (userId: string, body: SampleType) => {
    const res = { statusCode: 201 } as ModelReturnTypes;

    const validation = Sample.safeParse(body);

    const error = formatValidationErrors(validation);
    if (error) return error;

    const data = validation.data!;

    res.data = await prismaClient.samples.create({
        data: {
            ...data,
            userId,
        },
    });

    return res;
};

const deleteSample = async (userId: string, sampleId: string) => {
    await prismaClient.samples.update({
        where: {
            userId,
            sampleId,
        },
        data: {
            deletedAt: new Date(),
        }
    });
};

const paginateSamples = async (userId: string, params: PaginationParamsType): Promise<PaginationReturnTypes> => {
    const res = { statusCode: 400 } as PaginationReturnTypes;

    const validation = PaginationParams.safeParse(params);
    const error = formatValidationErrors(validation);
    if (error) {
        res.error = error.error;
        return res;
    }

    const data = validation.data!;

    return new Paginator<Prisma.SamplesFindManyArgs>("samples", {
        where: {
            userId,
        },
        select: {
            sampleId: true,
            title: true,
            body: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            createdAt: "desc",
        }
    }, data).get();
};

export { createSample, deleteSample, paginateSamples };
