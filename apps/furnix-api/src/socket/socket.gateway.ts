import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';
import { NotificationService } from '../notification/notification.service';
import { NotificationT as CustomNotification } from '../libs/dto/notification/notification';

interface GuestUser {
	memberNick: string;
	_id?: any;
}

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | GuestUser;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | GuestUser;
	action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryCLient: number = 0;
	private clientsAuthMap = new Map<WebSocket, Member | GuestUser>();
	private messagesList: MessagePayload[] = [];

	constructor(
		private authService: AuthService,
		private notificationService: NotificationService,
	) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket Server Initialized & total: ${this.summaryCLient}`);
	}

	private async retrieveAuth(req: any): Promise<Member> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			console.log('token:', token);
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		this.summaryCLient++;

		this.clientsAuthMap.set(client, authMember);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connecting [${clientNick}] & total [${this.summaryCLient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryCLient,
			memberData: authMember,
			action: 'joined',
		};

		this.emitMessage(infoMsg);
		client.send(JSON.stringify({ event: 'getMessages', list: this.messagesList }));

		if (authMember && authMember._id) {
			try {
				const notifications: CustomNotification[] = await this.notificationService.checkNotification(authMember._id);

				if (notifications && notifications.length > 0) {
					await this.sendNotification(authMember._id.toString(), notifications);
				}
			} catch (err) {
				this.logger.error(`Error checking notifications: ${err.message}`);
			}
		}
	}

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client);
		this.summaryCLient--;
		this.clientsAuthMap.delete(client);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`== Disconnection [${clientNick}] & total: ${this.summaryCLient} ==`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryCLient,
			memberData: authMember,
			action: 'left',
		};
		//client - disconnect
		this.broadCastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const newMessage: MessagePayload = {
			event: 'message',
			text: payload,
			memberData: authMember,
		};

		this.messagesList.push(newMessage);
		if (this.messagesList.length >= 5) this.messagesList.splice(0, this.messagesList.length - 5);

		// Faqat boshqa mijozlarga yuborish (broadCastMessage yordamida)
		this.broadCastMessage(client, newMessage);
	}
	@SubscribeMessage('sendNotification')
	async sendNotification(clientId: string, notifications: CustomNotification[]): Promise<void> {
		try {
			const clientEntry = Array.from(this.clientsAuthMap.entries()).find(
				([_, member]) => member && member._id && member._id.toString() === clientId,
			);

			if (!clientEntry) {
				this.logger.warn(`No client found for ID: ${clientId}`);
				return;
			}

			const client = clientEntry[0];
			if (!client || client.readyState !== WebSocket.OPEN) return;

			const notificationPayload = JSON.stringify({
				event: 'notification',
				data: notifications,
			});
			client.send(notificationPayload);
			this.logger.verbose(`Sent ${notifications.length} notifications to client ${clientId}`);
		} catch (error) {
			this.logger.error(`Notification send error: ${error.message}`);
		}
	}

	private broadCastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/*
 WS MESSAGES: 
   1) Client    (only Client)
   2) Broadcast (ALL Except Client) 
   3) Emission  (ALL)
**/
