import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket, 
    @MessageBody() chatId: string,    
  ) {
    this.logger.log(`Cliente ${client.id} se unió a la sala: ${chatId}`);
    client.join(chatId);
    return { event: 'joined', chatId };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    this.logger.log(`Cliente ${client.id} abandonó la sala: ${chatId}`);
    client.leave(chatId);
    return { event: 'left', chatId };
  }
  

  @OnEvent('message.created')
  handleNewMessage(payload: { chatId: string, message: any }) {
    this.logger.log(`Nuevo mensaje en chat ${payload.chatId}`);
    this.server.to(payload.chatId).emit('new_message', payload.message);
  }
  
  @OnEvent('message.read')
  handleMessagesRead(payload: { chatId: string, userId: string, count: number }) {
    this.logger.log(`${payload.count} mensajes marcados como leídos en chat ${payload.chatId}`);
    this.server.to(payload.chatId).emit('messages_read', payload);
  }
}