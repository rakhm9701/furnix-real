// src/libs/enums/faq.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum FaqCategory {
	GENERAL = 'GENERAL',
	ACCOUNT = 'ACCOUNT',
	PAYMENT = 'PAYMENT',
	SERVICE = 'SERVICE',
	TECHNICAL = 'TECHNICAL',
	OTHER = 'OTHER',
}

registerEnumType(FaqCategory, {
	name: 'FaqCategory',
	description: 'The category of FAQ',
});

export enum FaqStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

registerEnumType(FaqStatus, {
	name: 'FaqStatus',
	description: 'The status of FAQ',
});
