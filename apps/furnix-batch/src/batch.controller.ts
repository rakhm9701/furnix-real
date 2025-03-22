import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	// @Interval(10000)
	// handleInterval() {
	// 	this.logger.debug('INTERVAL TEST');
	// }

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY');
	}

	//batchRollback
	@Cron('00 * * * * *', { name: 'BATCH_ROLLBACK' })
	public async batchRollback() {
		try {
			this.logger['context'] = 'BATCH_ROLLBACK';
			this.logger.debug('EXCUTED');
			await this.batchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	//batchNewProducts
	@Cron('20 * * * * *', { name: 'BATCH_TOP_PRODUCTS' })
	public async batchNewProducts() {
		try {
			this.logger['context'] = 'BATCH_TOP_PRDUCTS';
			this.logger.debug('EXCUTED');
			await this.batchService.batchNewProducts();
		} catch (err) {
			this.logger.error(err);
		}
	}

	//batchTopAgents
	@Cron('40 * * * * *', { name: 'BATCH_TOP_AGENTS' })
	public async batchTopAgents() {
		try {
			this.logger['context'] = 'BATCH_TOP_AGENTS';
			this.logger.debug('EXCUTED');
			await this.batchService.batchTopAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
