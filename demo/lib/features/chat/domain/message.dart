import 'package:equatable/equatable.dart';

enum MessageStatus {
  /// Written offline; the outbox sends it when the connection returns.
  queued,
  sending,
  sent,

  /// The send failed; the user decides whether to retry.
  failed,
}

final class Message extends Equatable {
  const Message({
    required this.id,
    required this.text,
    required this.fromMe,
    required this.sentAt,
    this.status = MessageStatus.sent,
  });

  final String id;
  final String text;
  final bool fromMe;
  final DateTime sentAt;
  final MessageStatus status;

  Message copyWith({MessageStatus? status}) => Message(
        id: id,
        text: text,
        fromMe: fromMe,
        sentAt: sentAt,
        status: status ?? this.status,
      );

  @override
  List<Object?> get props => [id, text, fromMe, sentAt, status];
}

abstract interface class ChatRepository {
  /// Emits the conversation immediately, then every change (including
  /// replies pushed by the server).
  Stream<List<Message>> watch();

  /// Shows the message instantly, then delivers it.
  void send(String text);

  /// Re-sends a message that failed.
  void retry(String id);
}
