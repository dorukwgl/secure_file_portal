import { EUserRoles, Prisma, Samples, Sessions, Users } from "@prisma/client";


type Action = "create" | "view" | "update" | "delete" | "viewAll" | "updateAll" | "deleteAll";
interface Resource  {
    samples: {
        datatype: Samples;
    }
    users: {
        datatype: Users;
    }
}

type Role = EUserRoles;

type Permissions = {
    [key in Role]: {
        [resource in keyof Resource]?: {
            [action in Action]?: boolean | ((user: Users | Sessions, data: Resource[keyof Resource]["datatype"]) => boolean);
        }
    }
};

const UserPermissions: Permissions = {
    Admin: {
        samples: {
            create: true,
            viewAll: true,
            updateAll: true,
            deleteAll: true
        },
        users: {
            view: true,
            update: (user, profile) => user.userId === profile.userId,
        }
    },
    User: {
        samples: {
            create: true,
            view: true,
            viewAll: true,
            update: (user, sample) => user.userId === sample.userId,
            delete: true
        }
    }
}


const hasAccess = (user: Users | Sessions, resource: keyof Resource, action: Action, data?: Resource[keyof Resource]["datatype"]) => {
    const role = UserPermissions[user.role];
    if (!role) return false;
    if (!role[resource]) return false;
    if (!role[resource][action]) return false;

    if (typeof role[resource][action] === "boolean") return role[resource][action];
    if (!data) return false;

    return role[resource][action](user, data);
};


export default hasAccess;