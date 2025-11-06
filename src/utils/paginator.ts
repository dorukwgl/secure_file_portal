import { Prisma } from "@prisma/client";
import prismaClient from "./prismaClient";
import PaginationReturnTypes from "../entities/PaginationReturnTypes";
import PaginationParams, {
    PaginationParamsType,
} from "../validations/PaginationParams";
import { DEFAULT_PAGE_SIZE } from "../entities/constants";


type producer = <U>(args: U) => Promise<U>;

class Paginator<T> {
    private model: Uncapitalize<Prisma.ModelName>;
    private args: T;
    private params?: PaginationParamsType;
    private query = {};
    private where = {};
    private page = 1;
    private pageSize = 1;
    private data: any = [];
    private applyProducer: producer | null = null;

    constructor(
        model: Uncapitalize<Prisma.ModelName>,
        args: T,
        params?: PaginationParamsType
    ) {
        this.model = model;
        this.args = args;
        this.params = params;

        const validation = PaginationParams.pick({
            page: true,
            pageSize: true,
        }).safeParse(params).data;
        this.page = validation?.page || 1;
        this.pageSize = validation?.pageSize || DEFAULT_PAGE_SIZE;

        this.where = (args as any).where;
        this.query = {
            ...args,
            take: this.pageSize,
            skip: (this.page - 1) * this.pageSize,
        };
    }

    get = async () => {
        // @ts-ignore
        const count = await prismaClient[model].count({ where: this.where });

        // @ts-ignore
        this.data = await prismaClient[model].findMany(this.query);
        if (this.applyProducer) 
            this.data = await this.applyProducer(this.data);
        
        return {
            data: this.data,
            statusCode: 200,
            info: {
                total: count,
                lastPage: Math.ceil(count / this.pageSize),
                prev: this.page > 1 ? this.page - 1 : null,
                next:
                    this.page < Math.ceil(count / this.pageSize)
                        ? this.page + 1
                        : null,
            },
        } as PaginationReturnTypes;
    };

    apply = (fun: producer): Paginator<T> => {
      this.applyProducer = fun;
      return this;
    };
}

export default Paginator;
