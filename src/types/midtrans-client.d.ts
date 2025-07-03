// declare module 'midtrans-client' {
//   export class CoreApi {
//     constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
//     transaction: {
//       notification(payload: unknown): Promise<{
//         order_id: string;
//         transaction_status: string;
//         fraud_status: string;
//       }>;
//     };
//   }

//   export class Snap {
//     constructor(options: { isProduction: boolean; serverKey: string; clientKey: string });
//     createTransaction(parameter: {
//       transaction_details: {
//         order_id: string;
//         gross_amount: number;
//       };
//       customer_details?: {
//         first_name?: string;
//         email?: string;
//       };
//       item_details?: Array<{
//         id: string;
//         price: number;
//         quantity: number;
//         name: string;
//         category?: string;
//       }>;
//     }): Promise<{ token: string }>;
//   }
// } 