import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"

export class LoginDto {
        @IsNotEmpty()
        @IsEmail()
        email: string
    
        @IsNotEmpty()
        @IsString()
        @IsStrongPassword({minLength: 8, minUppercase: 1, minSymbols: 1, minNumbers: 1, minLowercase: 1})
        password: string
}