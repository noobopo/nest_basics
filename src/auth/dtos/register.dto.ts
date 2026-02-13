import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";


export class RegisterDto{

    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({minLength: 8, minUppercase: 1, minSymbols: 1, minNumbers: 1, minLowercase: 1})
    password: string
}
