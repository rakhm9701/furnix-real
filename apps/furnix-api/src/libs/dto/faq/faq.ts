// src/components/faq/faq.model.ts
import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';
import { FaqStatus } from '../../enums/faq.enum';

@ObjectType()
export class Faq {
	@Field(() => String)
	id: string;

	@Field(() => String)
	noticeCategory: string; // Changed

	@Field(() => String)
	noticeStatus: string; // Changed from status to noticeStatus

	@Field(() => String)
	noticeTitle: string; // Changed from title to noticeTitle

	@Field(() => String)
	noticeContent: string; // Changed from content to noticeContent

	@Field(() => String)
	memberId: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@InputType()
export class CreateFaqInput {
	@Field(() => String)
	title: string;

	@Field(() => String)
	content: string;
}

@InputType()
export class UpdateFaqInput {
	@Field(() => String, { nullable: true })
	title?: string;

	@Field(() => String, { nullable: true })
	content?: string;

	@Field(() => FaqStatus, { nullable: true })
	status?: FaqStatus;
}

@InputType()
export class FaqFilterInput {
	@Field(() => String, { nullable: true })
	search?: string;

	@Field(() => FaqStatus, { nullable: true })
	status?: FaqStatus;
}

@ObjectType()
export class FaqPagination {
	@Field(() => [Faq])
	items: Faq[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}
