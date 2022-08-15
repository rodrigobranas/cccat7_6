import CheckoutHandler from "../../src/application/handler/CheckoutHandler";
import * as CalculateFreightGateway from "../../src/application/gateway/CalculateFreightGateway";
import * as DecrementStockGateway from "../../src/application/gateway/DecrementStockGateway";
import GetItemGateway from "../../src/application/gateway/GetItemGateway";
import Item from "../../src/domain/entities/Item";
import DomainEvent from "../../src/domain/event/DomainEvent";
import PgPromiseAdapter from "../../src/infra/database/PgPromiseAdapter";
import Queue from "../../src/infra/queue/Queue";
import OrderRepositoryDatabase from "../../src/infra/repository/database/OrderRepositoryDatabase";

test("Deve fazer um pedido", async function () {
	const queue: Queue = {
		async connect (): Promise<void> {
		},
		async close (): Promise<void> {
		},
		async consume (eventName: string, callback: Function): Promise<void> {
		},
		async publish (domainEvent: DomainEvent): Promise<void> {
		}
	}
	const connection = new PgPromiseAdapter();
	const orderRepository = new OrderRepositoryDatabase(connection);
	await orderRepository.clean();
	const calculateFreightGateway: CalculateFreightGateway.default = { 
		async calculate(input: CalculateFreightGateway.Input) {
			return {
				total: 202.09
			};
		}
	};
	const decrementStockGateway: DecrementStockGateway.default = {
		async decrement (input: DecrementStockGateway.Input): Promise<void> {
		}
	};
	const getItemGateway: GetItemGateway = {
		async execute (idItem: number): Promise<Item> {
			const items: any = {
				1: new Item(1, "Guitarra", 1000, 100, 30, 10, 3, 0.03, 100),
				2: new Item(2, "Amplificador", 5000, 50, 50, 50, 20, 1, 1),
				3: new Item(3, "Cabo", 30, 10, 10, 10, 1, 1, 1)
			};
			return items[idItem];
		}
	}
	const checkout = new CheckoutHandler(orderRepository, calculateFreightGateway, decrementStockGateway, getItemGateway, queue);
	await checkout.execute({
		from: "22060030",
		to: "88015600",
		cpf: "886.634.854-68",
		orderItems: [
			{ idItem: 1, quantity: 1 },
			{ idItem: 2, quantity: 1 },
			{ idItem: 3, quantity: 3 }
		],
		date: new Date("2022-03-01T10:00:00")
	});
	// getOrder
	// expect(output.total).toBe(6292.09);
	// expect(output.code).toBe("202200000001");
	await connection.close();
});