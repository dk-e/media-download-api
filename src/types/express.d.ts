import { Request } from "express";

declare module "express" {
    interface Request {
        locals: {
            user: JSONData<UsersRecord>;
        };
    }
}
