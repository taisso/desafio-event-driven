import { Balance } from "../entity/balance.entity";

export interface IBalanceGateway {
   upsert(input: Balance): Promise<void>
   findMany(accountId: string): Promise<Balance[]>
}