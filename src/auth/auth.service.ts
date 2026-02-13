import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, userRole } from './entities/user.entitie';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import bcrypt from 'bcrypt'
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) { }
    async register(registerData: RegisterDto) {
        const user = await this.userRepository.findOne({
            where: { email: registerData.email }
        })
        if (user) {
            throw new ConflictException('User already exist with this cridencials')
        }
        const hasePass = await bcrypt.hash(registerData.password, 12)
        const newUser = this.userRepository.create({
            name: registerData.name,
            email: registerData.email,
            role: userRole.USER,
            password: hasePass
        })
        const saveUser = await this.userRepository.save(newUser)
        const { password, ...result } = saveUser
        return {
            user: result,
            message: "user register successfully!"
        }
    }

    async createAdmin(registerData: RegisterDto) {
        const user = await this.userRepository.findOne({
            where: { email: registerData.email }
        })
        if (user) {
            throw new ConflictException('User already exist with this cridencials')
        }
        const hasePass = await bcrypt.hash(registerData.password, 12)
        const newUser = this.userRepository.create({
            name: registerData.name,
            email: registerData.email,
            role: userRole.ADMIN,
            password: hasePass
        })
        const saveUser = await this.userRepository.save(newUser)
        const { password, ...result } = saveUser
        return {
            user: result,
            message: "Admin registered successfully!"
        }
    }

    async login(loginData: LoginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginData.email }
        })
        if (!user) {
            throw new UnauthorizedException('wrong email or password!')
        }

        const isMatch = await bcrypt.compare(loginData.password, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('wrong email or password!')
        }
        const tokens = this.generateTokens(user)
        const { password, ...result } = user
        return {
            user: result,
            tokens
        }
    }

    async getUserById(userId: number){
        const user = await this.userRepository.findOne({
            where: {id: userId}
        })
        if (!user) {
            throw new UnauthorizedException('False cridencials!')
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }
    
    async refreshToken(refreshtoken: string) {
        try {
            const payload = await this.jwtService.verify(refreshtoken, { secret: process.env.JWT_SECRET })
            const user = await this.userRepository.findOne({
                where: {id: payload.sub}
            })
            if (!user) {
                throw new UnauthorizedException('Invalid Token!')
            }
            const access_token = this.generateAccessToken(user)
            return{
                access_token
            }
        } catch (e) {
            throw new UnauthorizedException('Invalid Token!')
        }
    }

    private generateTokens(user: User) {
        return {
            access_token: this.generateAccessToken(user),
            refresh_token: this.generateRefreshToken(user),
        }
    }

    private generateAccessToken(user: User): string {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        }
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m'
        })
    }

    private generateRefreshToken(user: User): string {
        const payload = {
            sub: user.id
        }
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '2d'
        })
    }
}
