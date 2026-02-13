import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";

@Injectable()
export class LoginThrotllerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        const email = req.body?.email || 'unknown'
        return `login-${email}`
    }

    protected getLimit(): Promise<number> {
        return Promise.resolve(5)
    }

    protected getTtl(): Promise<number> {
        return Promise.resolve(5 * 60000)
    }

    protected async throwThrottlingException(): Promise<void> {
        throw new ThrottlerException('Too Meny request! please try again after 5 munit!')
    }
}