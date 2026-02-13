export interface IPost {
    id: number,
    title: string
    content: string
    auther: string
    createdAt: Date
    updatedAt?: Date
}