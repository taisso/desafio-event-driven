import { randomUUID } from "crypto";

export interface IBalance {
  id?: string;
  accountId: string;
  amount: number;
  createdAt?: Date
}

export class Balance implements IBalance {
  id: string;
  accountId: string;
  amount: number;
  createdAt: Date

  constructor(balance: IBalance) {
    this.id = balance.id ?? randomUUID()
    this.accountId = balance.accountId;
    this.amount = balance.amount;
    this.createdAt = new Date()
  }
}
