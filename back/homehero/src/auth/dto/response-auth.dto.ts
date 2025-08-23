import { Role } from "src/users/assets/roles";

export class ResponseLoginDTO{
    token: string;

    message: string;

    user:{
        isActive?: boolean,

        isVerified?: boolean,

        role?: Role

        id: string,

        name: string,

        isMembresyActive?: boolean
    }
}