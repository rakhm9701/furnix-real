// src/faq/entities/faq.entity.ts

import { NoticeStatus } from "../../libs/enums/notice.enum";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('faqs')
export class FaqEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  writer: string;

  @Column({
    type: 'enum',
    enum: NoticeStatus,
    default: NoticeStatus.HOLD
  })
  status: NoticeStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}