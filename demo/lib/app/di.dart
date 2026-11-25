import 'package:get_it/get_it.dart';

import '../core/log/event_log.dart';
import '../core/network/network_simulator.dart';
import '../core/sync/outbox.dart';
import '../features/chat/data/chat_repository_impl.dart';
import '../features/chat/data/fake_chat_api.dart';
import '../features/chat/domain/message.dart';
import '../features/orders/data/fake_order_api.dart';
import '../features/orders/data/order_repository_impl.dart';
import '../features/orders/domain/order.dart';
import '../features/payments/data/fake_payment_api.dart';
import '../features/payments/data/payment_repository_impl.dart';
import '../features/payments/domain/payment.dart';

final sl = GetIt.instance;

/// Composition root. Presentation only ever sees the domain interfaces.
void configureDependencies() {
  sl
    // core
    ..registerLazySingleton<EventLog>(EventLog.new)
    ..registerLazySingleton<NetworkSimulator>(() => NetworkSimulator(log: sl()))
    ..registerLazySingleton<Outbox>(() => Outbox(network: sl(), log: sl()))
    // orders
    ..registerLazySingleton<FakeOrderApi>(() => FakeOrderApi(sl(), sl()))
    ..registerLazySingleton<OrderRepository>(
      () => OrderRepositoryImpl(api: sl(), outbox: sl(), log: sl()),
    )
    // chat
    ..registerLazySingleton<FakeChatApi>(() => FakeChatApi(sl(), sl()))
    ..registerLazySingleton<ChatRepository>(
      () => ChatRepositoryImpl(api: sl(), outbox: sl(), network: sl(), log: sl()),
    )
    // payments
    ..registerLazySingleton<PaymentSandbox>(PaymentSandbox.new)
    ..registerLazySingleton<FakePaymentApi>(() => FakePaymentApi(sl(), sl(), sl()))
    ..registerLazySingleton<PaymentRepository>(() => PaymentRepositoryImpl(sl()));
}
