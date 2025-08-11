import { Chat } from "src/chat/entities/chat.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'messages' })
export class Message {
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ type: 'text' })
content: string;

@CreateDateColumn({ type: 'timestamp' })
sentAt: Date;

@Column({ default: false })
isRead: boolean;

@ManyToOne(() => Chat, (chat) => chat.messages)
@JoinColumn({ name: 'chat_id' })
chat: Chat;

@ManyToOne(() => User)
@JoinColumn({ name: 'sender_id' })
sender: User;
}



