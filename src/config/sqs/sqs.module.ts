import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';

import { SQSService } from './sqs.service';

@Module({
  providers: [SQSService, ConfigService, DiscoveryService],
  exports: [SQSService],
})
export class SqsModule {}
