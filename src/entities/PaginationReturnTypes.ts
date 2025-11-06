import ModelReturnTypes from "./ModelReturnTypes";

interface Info {
    hasNextPage: boolean;
    total: number;
    lastPage: number;
    next: number | null;
    prev: number | null;
}

interface PaginationReturnTypes<D={}, E={}> extends ModelReturnTypes<D, E> {
    info: Info
}

export default PaginationReturnTypes;