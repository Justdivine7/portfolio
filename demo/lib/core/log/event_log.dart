import 'dart:async';

enum LogLevel { info, success, warning, error }

final class LogEntry {
  const LogEntry({
    required this.time,
    required this.level,
    required this.tag,
    required this.message,
  });

  final DateTime time;
  final LogLevel level;
  final String tag;
  final String message;
}

/// In-memory, observable event log.
///
/// It powers the console strip and the developer menu, so a visitor can watch
/// what the app is doing under the hood: requests, retries, queue flushes.
class EventLog {
  EventLog({DateTime Function()? clock, this.capacity = 80})
      : _clock = clock ?? DateTime.now;

  final DateTime Function() _clock;
  final int capacity;
  final _entries = <LogEntry>[];
  final _controller = StreamController<List<LogEntry>>.broadcast();

  List<LogEntry> get entries => List.unmodifiable(_entries);
  Stream<List<LogEntry>> get changes => _controller.stream;

  void add(LogLevel level, String tag, String message) {
    _entries.add(
      LogEntry(time: _clock(), level: level, tag: tag, message: message),
    );
    if (_entries.length > capacity) _entries.removeAt(0);
    _controller.add(entries);
  }

  void info(String tag, String message) => add(LogLevel.info, tag, message);
  void success(String tag, String message) =>
      add(LogLevel.success, tag, message);
  void warn(String tag, String message) => add(LogLevel.warning, tag, message);
  void error(String tag, String message) => add(LogLevel.error, tag, message);

  void clear() {
    _entries.clear();
    _controller.add(entries);
  }

  Future<void> dispose() => _controller.close();
}
