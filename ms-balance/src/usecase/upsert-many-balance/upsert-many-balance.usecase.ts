import { Balance } from "../../entity/balance.entity";
import { IBalanceGateway } from "../../gateway/balance.gateway";

export interface IRequest {
  amount: number;
  accountId: string;
}

export class UpsertManyBalanceUseCase {
  constructor(private readonly balanceGateway: IBalanceGateway) {}

  async execute(input: IRequest): Promise<void> {
    const balance = new Balance({
      amount: input.amount,
      accountId: input.accountId
    })

    await this.balanceGateway.upsert(balance);
  }
}
