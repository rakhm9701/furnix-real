import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Products, Product } from '../../libs/dto/product/product';
import {
	AgentProductsInquiry,
	AllProductsInquiry,
	OrdinaryInquiry,
	ProductsInquiry,
	ProductInput,
} from '../../libs/dto/product/poduct.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeOfMongoObjectId } from '../../libs/config';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import { AuthGuard } from '../auth/guards/auth.guard';
import { NotificationT } from '../../libs/dto/notification/notification';


@Resolver()
export class ProductResolver {
	constructor(private readonly productService: ProductService) {}

	// createProduct
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async createProduct(
		@Args('input') input: ProductInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('mutation: createProduct');
		console.log('input:', input);
		input.memberId = memberId;
		return await this.productService.createProduct(input);
	}

	// getProduct
	@UseGuards(WithoutGuard)
	@Query((returns) => Product)
	public async getProduct(@Args('productId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Product> {
		console.log('Query: getProduct');
		const productId = shapeOfMongoObjectId(input);
		return await this.productService.getProduct(memberId, productId);
	}

	// updateProduct
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Product)
	public async updateProduct(
		@Args('input') input: ProductUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('Mutation: updateProduct');
		input._id = shapeOfMongoObjectId(input._id);
		return await this.productService.updateProduct(memberId, input);
	}

	// getProducts
	@UseGuards(WithoutGuard)
	@Query((returns) => Products)
	public async getProducts(
		@Args('input') input: ProductsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getProducts');
		return await this.productService.getProducts(memberId, input);
	}

	// getFavorites
	@UseGuards(AuthGuard)
	@Query((returns) => Products)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getFavorites');
		return await this.productService.getFavorites(memberId, input);
	}

	// getVisited
	@UseGuards(AuthGuard)
	@Query((returns) => Products)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getVisited');
		return await this.productService.getVisited(memberId, input);
	}

	// getAgentProducts
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query((returns) => Products)
	public async getAgentProducts(
		@Args('input') input: AgentProductsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getAgentProducts');
		return await this.productService.getAgentProducts(memberId, input);
	}

	//likeTargetProduct
	@UseGuards(AuthGuard)
	@Mutation(() => Product)
	public async likeTargetProduct(
		@Args('productId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('Mutation: likeTargetProduct');
		const likeRefId = shapeOfMongoObjectId(input);
		return await this.productService.likeTargetProduct(memberId, likeRefId);
	}

	/** ADMIN **/
	// getAllProductsByAdmin
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Products)
	public async getAllProductsByAdmin(
		@Args('input') input: AllProductsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getAllProductsByAdmin');
		return await this.productService.getAllProductsByAdmin(input);
	}

	// updateProductByAdmin
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Product)
	public async updateProductByAdmin(@Args('input') input: ProductUpdate): Promise<Product> {
		console.log('Mutation: updateProductByAdmin');
		return await this.productService.updateProductByAdmin(input);
	}

	// removeProductByAdmin
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Product)
	public async removeProductByAdmin(@Args('productId') input: string): Promise<Product> {
		console.log('Mutation: removeProductByAdmin');
		const productId = shapeOfMongoObjectId(input);
		return await this.productService.removeProductByAdmin(productId);
	}

	/** Notification **/
	//notificationTargetProduct
	@UseGuards(AuthGuard)
	@Mutation(() => NotificationT)
	public async notificationTargetProduct(
		@Args('input') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<NotificationT> {
		console.log('Mutation: notificationTargetProduct');
		const notificationId = shapeOfMongoObjectId(input);
		return await this.productService.notificationTargetProduct(notificationId);
	}

	//notificationsTargetProduct
	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async notificationsTargetProduct(
		@Args('input') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<String> {
		console.log('Mutation: notificationsTargetProduct');
		return await this.productService.allNotificationsTargetProduct(memberId);
	}
}
