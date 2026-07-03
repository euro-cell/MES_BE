import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { MaterialHistory } from 'src/common/entities/material/material-history.entity';

@Injectable()
export class MaterialHistoryCleanupService {
  private readonly logger = new Logger(MaterialHistoryCleanupService.name);

  constructor(
    @InjectRepository(MaterialHistory)
    private readonly materialHistoryRepository: Repository<MaterialHistory>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldHistories() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await this.materialHistoryRepository.delete({
      createdAt: LessThan(sixMonthsAgo),
    });

    const sixMonthsAgoKst = sixMonthsAgo.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    this.logger.log(`원자재 이력 자동 삭제 완료: ${result.affected ?? 0}건 (기준일: ${sixMonthsAgoKst} KST)`);
  }
}
