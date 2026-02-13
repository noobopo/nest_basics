import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { userRole } from "../entities/user.entitie";
import { ROLES_KEY } from "../decoraters/roles.decoraters";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<userRole[]>(
            ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredRoles) {
            return true
        }

        // Extract user from request which i store in jwt strategy
        const { user } = context.switchToHttp().getRequest()
        if (!user) {
            throw new ForbiddenException('User not authoanticated!')
        }
        // Extract Roles from request which i store in jwt strategy
        const hasRequiredRoles = requiredRoles.some(role => user.role === role)

        if (!hasRequiredRoles) {
            throw new ForbiddenException('Insufficiant Permissions')
        }
        return true
    }
}