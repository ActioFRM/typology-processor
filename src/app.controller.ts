/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CustomerCreditTransferInitiation } from './classes/iPain001Transaction';
import { NetworkMap } from './classes/network-map';
import { RuleResult } from './classes/rule-result';
import { LoggerService } from './logger.service';
import { handleTransaction } from './app.service';
import { Context } from 'koa';

export const handleExecute = async (ctx: Context): Promise<string> => {
  LoggerService.log('Start - Handle execute request');
  const request = ctx.request.body;

  let networkMap: NetworkMap = new NetworkMap();
  let ruleResult: RuleResult = new RuleResult();
  let req: CustomerCreditTransferInitiation = new CustomerCreditTransferInitiation({});

  try {
    networkMap = request.networkMap;
    ruleResult = request.ruleResult;
    req = request.transaction;
  } catch (parseError) {
    const failMessage = 'Failed to parse execution request';

    LoggerService.error(failMessage, parseError as Error, 'typology.server.ts');
    LoggerService.log('End - Handle execute request');
  }

  try {
    await handleTransaction(req, networkMap, ruleResult, ctx);

    ctx.status = 200;
    ctx.body = {
      message: 'Successfully executed transaction',
    };
  } catch (err) {
    const failMessage = 'Failed to process execution request.';
    LoggerService.error(failMessage, err as Error, 'ApplicationService');
  } finally {
    LoggerService.log('End - Handle execute request');
  }
};
