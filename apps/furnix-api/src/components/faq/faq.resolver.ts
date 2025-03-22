// src/components/faq/faq.resolver.ts
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FaqService } from './faq.service';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { CreateFaqInput, FaqPagination, FaqFilterInput, UpdateFaqInput, Faq } from '../../libs/dto/faq/faq';

@Resolver(() => Faq)
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @Mutation(() => Faq)
  @UseGuards(AuthGuard)
  async createFaq(
    @Args('input') createFaqInput: CreateFaqInput,
    @AuthMember() user: any
  ) {
    return this.faqService.create(createFaqInput, user._id);
  }

  @Query(() => FaqPagination)
  async faqs(
    @Args('filter', { nullable: true }) filter: FaqFilterInput,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    const result = await this.faqService.findAll(filter, { page, limit });
    return {
      ...result,
      items: result.items.map(item => ({
        ...item,
        id: item._id.toString(),  // Explicitly map _id to id
      }))
    };
  }

  @Mutation(() => Faq)
  @UseGuards(AuthGuard)
  async updateFaq(
    @Args('id', { type: () => String }) id: string,
    @Args('input') updateFaqInput: UpdateFaqInput,
  ) {
    return this.faqService.update(id, updateFaqInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteFaq(@Args('id', { type: () => String }) id: string) {
    return this.faqService.remove(id);
  }
}