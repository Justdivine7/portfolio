import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../core/log/event_log.dart';
import '../features/chat/presentation/chat_bloc.dart';
import '../features/devtools/dev_settings_cubit.dart';
import '../features/orders/presentation/orders_bloc.dart';
import '../features/payments/presentation/payment_bloc.dart';
import '../shell/home_shell.dart';
import 'di.dart';
import 'theme.dart';

class RelayApp extends StatelessWidget {
  const RelayApp({super.key});

  @override
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (_) => DevSettingsCubit(sl(), sl())),
          BlocProvider(create: (_) => SyncStatusCubit(sl(), sl())),
          BlocProvider(create: (_) => OrdersBloc(sl())..add(const OrdersStarted())),
          BlocProvider(create: (_) => ChatBloc(sl())..add(const ChatStarted())),
          BlocProvider(create: (_) => PaymentBloc(sl(), sl<EventLog>())),
        ],
        child: MaterialApp(
          title: 'Relay — live Flutter demo',
          debugShowCheckedModeBanner: false,
          theme: buildRelayTheme(),
          // Opened directly in a wide browser, keep a phone-shaped column.
          builder: (context, child) => ColoredBox(
            color: const Color(0xFFE9E4D9),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: child,
              ),
            ),
          ),
          home: const HomeShell(),
        ),
      );
}
