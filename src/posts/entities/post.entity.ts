import { User } from "src/auth/entities/user.entitie";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false})
    title: string

    @Column({ type: 'text', nullable: false})
    content: string

    @Column({type: 'text', nullable: true})
    image?: string

    @ManyToOne(()=>User, (user)=>user.posts)
    auther: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}