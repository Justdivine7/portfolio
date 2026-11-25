import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../domain/message.dart';

sealed class ChatEvent {
  const ChatEvent();
}

final class ChatStarted extends ChatEvent {
  const ChatStarted();
}

final class ChatMessageSent extends ChatEvent {
  const ChatMessageSent(this.text);
  final String text;
}

final class ChatRetryRequested extends ChatEvent {
  const ChatRetryRequested(this.id);
  final String id;
}

final class ChatState extends Equatable {
  const ChatState({this.messages = const []});

  final List<Message> messages;

  @override
  List<Object?> get props => [messages];
}

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  ChatBloc(this._repository) : super(const ChatState()) {
    on<ChatStarted>(
      (event, emit) => emit.forEach<List<Message>>(
        _repository.watch(),
        onData: (messages) => ChatState(messages: messages),
      ),
    );
    on<ChatMessageSent>((event, emit) => _repository.send(event.text));
    on<ChatRetryRequested>((event, emit) => _repository.retry(event.id));
  }

  final ChatRepository _repository;
}
