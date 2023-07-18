import { Balance } from "../entity/balance.entity";
import { IBalanceGateway } from "../gateway/balance.gateway";
import { Knex } from "knex";

export class BalanceDatabase implements IBalanceGateway {
  constructor(private readonly knex: Knex) {}

  async findMany(accountId: string): Promise<Balance[]> {
    const balances = await this.knex("balances").where({ account_id: accountId });

    return balances.map(
      (balance) =>
        new Balance({
          accountId: balance.account_id,
          amount: balance.amount,
        })
    );
  }

  async upsert(input: Balance): Promise<void> {
    const balance = new Balance({
      accountId: input.accountId,
      amount: input.amount,
    })

    await this.knex("balances")
      .insert({
        id: balance.id,
        amount: balance.amount,
        account_id: balance.accountId,
        created_at: balance.createdAt
      })
      .onConflict('account_id')
      .merge();
  }
}
