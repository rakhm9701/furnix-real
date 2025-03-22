// src/libs/inputs/faq.input.ts
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FaqCategory, FaqStatus } from './faq.update';

@InputType()
export class CreateFaqInput {
	@Field(() => String)
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	title: string;

	@Field(() => String)
	@IsString()
	@MinLength(10)
	@MaxLength(5000)
	content: string;

	@Field(() => FaqCategory)
	@IsEnum(FaqCategory)
	category: FaqCategory;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	order?: number;
}

@InputType()
export class UpdateFaqInput {
	@Field(() => String, { nullable: true })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	@IsOptional()
	title?: string;

	@Field(() => String, { nullable: true })
	@IsString()
	@MinLength(10)
	@MaxLength(5000)
	@IsOptional()
	content?: string;

	@Field(() => FaqCategory, { nullable: true })
	@IsEnum(FaqCategory)
	@IsOptional()
	category?: FaqCategory;

	@Field(() => FaqStatus, { nullable: true })
	@IsEnum(FaqStatus)
	@IsOptional()
	status?: FaqStatus;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	order?: number;
}

@InputType()
export class FaqFilterInput {
	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	search?: string;

	@Field(() => FaqCategory, { nullable: true })
	@IsEnum(FaqCategory)
	@IsOptional()
	category?: FaqCategory;

	@Field(() => FaqStatus, { nullable: true })
	@IsEnum(FaqStatus)
	@IsOptional()
	status?: FaqStatus;

	@Field(() => Int, { nullable: true, defaultValue: 1 })
	@IsOptional()
	page?: number;

	@Field(() => Int, { nullable: true, defaultValue: 10 })
	@IsOptional()
	limit?: number;
}

@InputType()
export class FaqIdInput {
	@Field(() => String)
	id: string;
}
