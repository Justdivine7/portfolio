import 'package:flutter_test/flutter_test.dart';
import 'package:relay/features/chat/data/chat_repository_impl.dart';
import 'package:relay/features/chat/data/fake_chat_api.dart';
import 'package:relay/features/chat/domain/message.dart';

import 'helpers.dart';

void main() {
  ChatRepositoryImpl build(Harness h) => ChatRepositoryImpl(
        api: FakeChatApi(h.network, h.log, replyDelay: const Duration(hours: 1)),
        outbox: h.outbox,
        network: h.network,
        log: h.log,
      );

  Future<Message> latestMine(ChatRepositoryImpl repo) async =>
      (await repo.watch().first).lastWhere((m) => m.fromMe);

  test('shows a message instantly as sending, then marks it delivered', () async {
    final h = Harness();
    final repo = build(h);
    final seen = <MessageStatus>[];
    final sub = repo.watch().listen((messages) {
      final mine = messages.where((m) => m.fromMe);
      if (mine.isNotEmpty) seen.add(mine.last.status);
    });
    await pumpEventQueue();
    repo.send('hello');
    await pumpEventQueue();
    expect(seen.toSet().toList(), [MessageStatus.sending, MessageStatus.sent]);
    await sub.cancel();
  });

  test('a failed send waits for the user, and retry delivers it', () async {
    final h = Harness(random: 0.0);
    final repo = build(h);
    h.goFlaky();
    repo.send('hello');
    await pumpEventQueue();
    final failed = await latestMine(repo);
    expect(failed.status, MessageStatus.failed);

    h.goOnline();
    repo.retry(failed.id);
    await pumpEventQueue();
    expect((await latestMine(repo)).status, MessageStatus.sent);
  });

  test('a message written offline is queued and sent when back online', () async {
    final h = Harness();
    final repo = build(h);
    h.goOffline();
    repo.send('later');
    expect((await latestMine(repo)).status, MessageStatus.queued);
    expect(h.outbox.pending, hasLength(1));

    h.goOnline();
    await pumpEventQueue();
    expect((await latestMine(repo)).status, MessageStatus.sent);
  });
}
