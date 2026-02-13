import { Post } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum userRole {
    USER = 'user',
    ADMIN = 'admin'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    name: string

    @Column({nullable: false, unique: true})
    email: string

    @Column({
        type: 'enum',
        enum: userRole,
        default: userRole.USER
    })
    role: userRole

    @Column({nullable: false})
    password: string

    @OneToMany(()=> Post, (post)=>post.auther)
    posts: Post[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}