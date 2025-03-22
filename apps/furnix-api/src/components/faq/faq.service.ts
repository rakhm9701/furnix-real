// src/modules/faq/faq.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FaqStatus } from '../../libs/enums/faq.enum';
import { CreateFaqInput, FaqFilterInput, UpdateFaqInput } from '../../libs/dto/faq/faq';

@Injectable()
export class FaqService {
  private readonly logger = new Logger('FaqService');

  constructor(
    @InjectModel('Notice') private readonly noticeModel: Model<any>,
  ) {}

  async create(createFaqInput: CreateFaqInput, memberId: string) {
    try {
      this.logger.log(`Creating FAQ with input: ${JSON.stringify(createFaqInput)}`);
      
      const memberObjectId = new mongoose.Types.ObjectId(memberId);
      
      const faq = await this.noticeModel.create({
        noticeCategory: 'FAQ',
        noticeTitle: createFaqInput.title,
        noticeContent: createFaqInput.content,
        noticeStatus: FaqStatus.ACTIVE,
        memberId: memberObjectId,
      });

      this.logger.log(`FAQ created successfully with id: ${faq._id}`);
      return faq;
    } catch (error) {
      this.logger.error(`Error creating FAQ: ${error.message}`);
      throw error;
    }
  }

  // src/components/faq/faq.service.ts
async findAll(filter: FaqFilterInput, pagination: { page: number; limit: number }) {
  try {
    const { search, status } = filter || {};
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = {
      noticeCategory: 'FAQ',
    };

    if (status) {
      query['noticeStatus'] = status;
    }

    if (search) {
      query['$or'] = [
        { noticeTitle: { $regex: search, $options: 'i' } },
        { noticeContent: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.noticeModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.noticeModel.countDocuments(query),
    ]);

    return {
      items: items.map(item => ({
        ...item,
        id: item._id.toString(),  // Ensure _id is converted to string id
      })),
      total,
      page,
      limit,
    };
  } catch (error) {
    this.logger.error(`Error finding FAQs: ${error.message}`);
    throw error;
  }
}

  async findOne(id: string) {
    try {
      return await this.noticeModel.findById(id).lean();  // Changed from faqModel to noticeModel
    } catch (error) {
      this.logger.error(`Error finding FAQ: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateFaqInput: UpdateFaqInput) {
    try {
      const updateData = {
        ...(updateFaqInput.title && { noticeTitle: updateFaqInput.title }),
        ...(updateFaqInput.content && { noticeContent: updateFaqInput.content }),
        ...(updateFaqInput.status && { noticeStatus: updateFaqInput.status }),
      };

      return await this.noticeModel.findByIdAndUpdate(  // Changed from faqModel to noticeModel
        id,
        { $set: updateData },
        { new: true },
      ).lean();
    } catch (error) {
      this.logger.error(`Error updating FAQ: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.noticeModel.findByIdAndUpdate(  // Changed from faqModel to noticeModel
        id,
        {
          noticeStatus: FaqStatus.DELETE,
        }
      );
      return true;
    } catch (error) {
      this.logger.error(`Error removing FAQ: ${error.message}`);
      throw error;
    }
  }
}