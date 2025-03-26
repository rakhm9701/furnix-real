import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Products, Product } from '../../libs/dto/product/product';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import {
	AgentProductsInquiry,
	AllProductsInquiry,
	OrdinaryInquiry,
	ProductsInquiry,
	ProductInput,
} from '../../libs/dto/product/poduct.input';
import {  ProductStatus } from '../../libs/enums/product.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ProductUpdate } from '../../libs/dto/product/product.update';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeOfMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../../notification/notification.service';
import { NotificationT } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@Inject('SOCKET_GATEWAY') private readonly socketGateway: SocketGateway,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
		private notificationService: NotificationService,
	) {}

	// createProduct
	public async createProduct(input: ProductInput): Promise<Product> {
		try {
			console.log('result:', input);
			const result: Product = await this.productModel.create(input);
			//  increase memberProducts
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProducts',
				modifier: 1,
			});
			console.log('result:', result);
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	// getProduct
	public async getProduct(memberId: ObjectId, productId: ObjectId): Promise<Product> {
		const search: T = {
			_id: productId,
			productStatus: ProductStatus.ACTIVE,
		};

		const targetProduct: Product = await this.productModel.findOne(search).exec();
		if (!targetProduct) throw new InternalServerErrorException(Message.N0_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: productId, viewGroup: ViewGroup.PRODUCT };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });
				targetProduct.productViews++;
			}

			const likeInput = { memberId: memberId, likeRefId: productId, likeGroup: LikeGroup.PRODUCT };
			targetProduct.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}
		targetProduct.memberData = await this.memberService.getMember(null, targetProduct.memberId);
		return targetProduct;
	}

	//productStatsEditor
	public async productStatsEditor(input: StatisticModifier): Promise<Product> {
		const { _id, targetKey, modifier } = input;
		return await this.productModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}

	// updateProduct
	public async updateProduct(memberId: ObjectId, input: ProductUpdate): Promise<Product> {
		let { productStatus: productStatus, soldAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			productStatus: ProductStatus.ACTIVE,
		};

		if (productStatus === ProductStatus.SOLD) soldAt = moment().toDate();
		else if (productStatus === ProductStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.productModel
			.findByIdAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILE);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProducts',
				modifier: -1,
			});
		}
		return result;
	}

	// getProducts
	public async getProducts(memberId: ObjectId, input: ProductsInquiry): Promise<Products> {
		const match: T = { productStatus: ProductStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match:', match);

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId, '$_id'),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.N0_DATA_FOUND);
		return result[0];
	}

	// shapeMatchQuery
	private shapeMatchQuery(match: T, input: ProductsInquiry): void {
		const {
			memberId,
			locationList,
			colorsList,
			materialsList,
			typeList,
			periodsRange,
			pricesRange,
			squaresRange,
			options,
			text,
		} = input.search;

		if (memberId) match.memberId = shapeOfMongoObjectId(memberId);
		if (locationList && locationList.length) match.productLocation = { $in: locationList };
		if (colorsList && colorsList.length) match.productColors = { $in: colorsList };
		if (materialsList && materialsList.length) match.productMaterials = { $in: materialsList };
		if (typeList && typeList.length) match.productType = { $in: typeList };

		if (pricesRange) match.productPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (squaresRange) match.productSquare = { $gte: squaresRange.start, $lte: squaresRange.end };

		if (text) match.productTitle = { $regex: new RegExp(text, 'i') };
		if (options)
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			});
	}

	//getFavorites
	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		return await this.likeService.getFavoriteProducts(memberId, input);
	}

	//getVisited
	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		return await this.viewService.getVisitedProducts(memberId, input);
	}

	// getAgentProducts
	public async getAgentProducts(memberId: Object, input: AgentProductsInquiry): Promise<Products> {
		const { productStatus } = input.search;
		if (productStatus === ProductStatus.DELETE) throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);

		const match: T = {
			memberId: memberId,
			productStatus: productStatus ?? { $ne: ProductStatus.DELETE },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },

				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.N0_DATA_FOUND);
		return result[0];
	}

	//likeTargetProduct
	public async likeTargetProduct(memberId: ObjectId, likeRefId: ObjectId): Promise<Product> {
		const target: Product = await this.productModel
			.findOne({ _id: likeRefId, productStatus: ProductStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.N0_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PRODUCT,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		if (modifier === 1) {
			const notificationInput: NotificationInput = {
				notificationType: NotificationType.LIKE,
				notificationGroup: NotificationGroup.PRODUCT,
				notificationTitle: 'Like',
				notificationDesc: 'Product liked!',
				notificationStatus: NotificationStatus.WAIT,
				memberId: memberId,
				authorId: target.memberId,
				receiverId: target.memberId,
				productId: target._id,
			};
			const notification = await this.notificationService.createNotification(notificationInput);

			

		
				

				const clientId = target.memberId.toString(); // Ensure _id exists
				await this.socketGateway.sendNotification(clientId, [notification]);
			
		}
		const result = await this.productStatsEditor({ _id: likeRefId, targetKey: 'productLikes', modifier: modifier });
		console.log('one:', likeRefId);
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}

	/** ADMIN **/
	// getAllProductsByAdmin
	public async getAllProductsByAdmin(input: AllProductsInquiry): Promise<Products> {
		const { productStatus: productStatus, productLocationList: productLocationList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (productStatus) match.productStatus = productStatus;
		if (productLocationList) match.productLocation = { $in: productLocationList };

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.N0_DATA_FOUND);
		return result[0];
	}

	// updateProductsByAdmin
	public async updateProductByAdmin(input: ProductUpdate): Promise<Product> {
		let { productStatus: productStatus, soldAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			productStatus: ProductStatus.ACTIVE,
		};

		if (productStatus === ProductStatus.SOLD) soldAt = moment().toDate();
		else if (productStatus === ProductStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.productModel
			.findByIdAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILE);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProducts',
				modifier: -1,
			});
		}
		return result;
	}

	// removeProductByAdmin
	public async removeProductByAdmin(productId: ObjectId): Promise<Product> {
		const search: T = { _id: productId, productStatus: ProductStatus.DELETE };
		const result = await this.productModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILE);

		return result;
	}

	//notificationTargetProduct
	public async notificationTargetProduct(notificationId: ObjectId): Promise<NotificationT> {
		return await this.notificationService.readNotification(notificationId, NotificationStatus.READ);
	}

	//allNotificationsTargetProduct
	public async allNotificationsTargetProduct(memberId: ObjectId): Promise<String> {
		const result = await this.notificationService.allReadNotification(memberId, NotificationStatus.READ);
		if (result) {
			return 'Read succedd!';
		}
	}
}
