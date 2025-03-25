// src/libs/enums/faq.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum FaqCategory {
	GENERAL = 'GENERAL',
	ACCOUNT = 'ACCOUNT',
	PAYMENT = 'PAYMENT',
	SERVICE = 'SERVICE',
	SECURITY = 'SECURITY',
	POLICY = 'POLICY',
	OTHER = 'OTHER',
}

// Register enums for GraphQL schema
registerEnumType(FaqCategory, {
	name: 'FaqCategory',
});

export enum FaqStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

// Register enums for GraphQL schema
registerEnumType(FaqStatus, {
	name: 'FaqStatus',
});
