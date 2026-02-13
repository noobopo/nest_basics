import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStatergy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET!,
        })

    }
    async validate(payload: any) {
        try {
            const user = await this.authService.getUserById(payload.sub)
            return {
                ...user,
                role: payload.role
            }
        } catch (error) {
            throw new UnauthorizedException('Invalid Token!')
        }
    }
}