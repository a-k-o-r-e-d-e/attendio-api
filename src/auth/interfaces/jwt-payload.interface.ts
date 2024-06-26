import { Role } from "../../constants/enums";

interface JwtPayload {
    user_id: string,
    user_type: Role,
    username: string
}

export default JwtPayload;