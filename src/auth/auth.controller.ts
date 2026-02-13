import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decoraters/current-user.decorater';
import { Roles } from './decoraters/roles.decoraters';
import { userRole } from './entities/user.entitie';
import { RolesGuard } from './guards/roles.guard';
import { LoginThrotllerGuard } from './guards/login-throtller.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('register')
    async registerUser(@Body() registerData: RegisterDto){
        return await this.authService.register(registerData)
    }

    @UseGuards(LoginThrotllerGuard)
    @Post('login')
    async loginUser(@Body() loginData: LoginDto){
        return await this.authService.login(loginData)
    }

    @Post('token')
    async refresh(@Body('refreshtoken') refreshToken: string){
        return await this.authService.refreshToken(refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async profile(@CurrentUser() user: any){
        return user
    }

    @Post('create-admin')
    @Roles(userRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createAdmin(@Body() registerData: RegisterDto){
        return await this.authService.createAdmin(registerData)
    }
    
}
