import { Balance } from "../../entity/balance.entity";
import { IBalanceGateway } from "../../gateway/balance.gateway";

export class FindManyBalanceUseCase {
    constructor(private readonly balanceGateway: IBalanceGateway) {}

    async execute(accountId: string): Promise<Balance[]> {
        return this.balanceGateway.findMany(accountId);
    }
}