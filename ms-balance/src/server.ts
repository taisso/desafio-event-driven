import express from "express";
import { Kafka } from "kafkajs";
import { Knex, knex } from "knex";
import { BalanceDatabase } from "./database/balance.database";
import { FindManyBalanceUseCase } from "./usecase/find-many-balance/find-many-balance.usecase";
import { UpsertManyBalanceUseCase } from "./usecase/upsert-many-balance/upsert-many-balance.usecase";

const app = express();

const config: Knex.Config = {
  client: "mysql",
  connection: {
    host: "mysql",
    port: 3306,
    user: "root",
    database: "wallet",
    password: "root",
  },
};

const balanceDb = new BalanceDatabase(knex(config));

const kafka = new Kafka({
  brokers: ["kafka:29092"],
  retry: { retries: 30 },
});

const consumer = kafka.consumer({ groupId: "wallet" });

async function runConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "balances", fromBeginning: true });
    const upsertManyBalanceUseCase = new UpsertManyBalanceUseCase(balanceDb);

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message && message.value) {
          const data = JSON.parse(message.value.toString());
          await upsertManyBalanceUseCase.execute({
            accountId: data.Payload.account_id_from,
            amount: data.Payload.balance_account_id_from,
          });

          await upsertManyBalanceUseCase.execute({
            accountId: data.Payload.account_id_to,
            amount: data.Payload.balance_account_id_to,
          });
        }
        console.log({
          value: message?.value?.toString(),
        });
      },
    });
  } catch (err) {
    console.log(err);
  }
}

runConsumer();

app.get("/balances/:account_id", async (req, res) => {
  const findManyBalanceUseCase = new FindManyBalanceUseCase(balanceDb);

  const balances = await findManyBalanceUseCase.execute(
    req.params["account_id"]
  );

  res.json(balances);
});

app.listen("3003", () => console.log("Server listening on 3003"));
