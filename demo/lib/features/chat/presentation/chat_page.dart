import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../app/theme.dart';
import '../../../core/util/format.dart';
import '../domain/message.dart';
import 'chat_bloc.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _send() {
    final text = _controller.text;
    if (text.trim().isEmpty) return;
    context.read<ChatBloc>().add(ChatMessageSent(text));
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) => Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 8),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 18,
                  backgroundColor: RelayColors.ink,
                  child: Text('A', style: TextStyle(color: RelayColors.paper, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Agent', style: Theme.of(context).textTheme.titleMedium),
                      Text('Replies arrive over a WebSocket (simulated)', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: BlocBuilder<ChatBloc, ChatState>(
              builder: (context, state) {
                final messages = state.messages;
                return ListView.builder(
                  reverse: true,
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                  itemCount: messages.length,
                  itemBuilder: (_, i) {
                    final m = messages[messages.length - 1 - i];
                    return _Bubble(key: ValueKey(m.id), message: m);
                  },
                );
              },
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 6, 12, 10),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: InputDecoration(
                        hintText: 'Message the agent',
                        filled: true,
                        fillColor: RelayColors.card,
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: RelayColors.line),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: RelayColors.line),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ListenableBuilder(
                    listenable: _controller,
                    builder: (_, _) => IconButton.filled(
                      tooltip: 'Send',
                      onPressed: _controller.text.trim().isEmpty ? null : _send,
                      icon: const Icon(Icons.arrow_upward_rounded),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
}

class _Bubble extends StatelessWidget {
  const _Bubble({super.key, required this.message});
  final Message message;

  @override
  Widget build(BuildContext context) {
    final mine = message.fromMe;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
      builder: (context, t, child) => Opacity(
        opacity: t,
        child: Transform.translate(offset: Offset(0, (1 - t) * 8), child: child),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          crossAxisAlignment: mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.74),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: mine ? RelayColors.ink : RelayColors.card,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(mine ? 16 : 4),
                    bottomRight: Radius.circular(mine ? 4 : 16),
                  ),
                  border: mine ? null : Border.all(color: RelayColors.line),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
                  child: Text(
                    message.text,
                    style: TextStyle(color: mine ? RelayColors.paper : RelayColors.ink, fontSize: 14, height: 1.35),
                  ),
                ),
              ),
            ),
            if (mine) ...[
              const SizedBox(height: 3),
              _DeliveryStatus(message: message),
            ],
          ],
        ),
      ),
    );
  }
}

class _DeliveryStatus extends StatelessWidget {
  const _DeliveryStatus({required this.message});
  final Message message;

  @override
  Widget build(BuildContext context) {
    const small = TextStyle(fontSize: 11, color: RelayColors.ink3);
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 180),
      child: switch (message.status) {
        MessageStatus.queued => const Row(
            key: ValueKey('q'),
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.schedule_rounded, size: 12, color: RelayColors.warning),
              SizedBox(width: 4),
              Text('Queued · sends when you’re online', style: small),
            ],
          ),
        MessageStatus.sending => const Row(
            key: ValueKey('s'),
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox.square(dimension: 10, child: CircularProgressIndicator(strokeWidth: 1.4)),
              SizedBox(width: 5),
              Text('Sending…', style: small),
            ],
          ),
        MessageStatus.sent => Row(
            key: const ValueKey('d'),
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.done_all_rounded, size: 13, color: RelayColors.success),
              const SizedBox(width: 4),
              Text('Delivered ${shortTime(message.sentAt)}', style: small),
            ],
          ),
        MessageStatus.failed => InkWell(
            key: const ValueKey('f'),
            borderRadius: BorderRadius.circular(6),
            onTap: () => context.read<ChatBloc>().add(ChatRetryRequested(message.id)),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline_rounded, size: 13, color: RelayColors.danger),
                  SizedBox(width: 4),
                  Text('Not delivered · Tap to retry',
                      style: TextStyle(fontSize: 11, color: RelayColors.danger, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ),
      },
    );
  }
}
