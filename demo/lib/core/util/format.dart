int _sequence = 0;

/// Short, unique, readable ids such as `ord-mf3k2a1`.
String newId(String prefix) {
  final time = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
  final seq = (_sequence++).toRadixString(36);
  return '$prefix-${time.substring(time.length - 5)}$seq';
}

final _thousands = RegExp(r'\B(?=(\d{3})+(?!\d))');

String naira(int amount) =>
    '₦${amount.toString().replaceAllMapped(_thousands, (_) => ',')}';

String _two(int n) => n.toString().padLeft(2, '0');

String clockTime(DateTime t) =>
    '${_two(t.hour)}:${_two(t.minute)}:${_two(t.second)}';

String shortTime(DateTime t) => '${_two(t.hour)}:${_two(t.minute)}';
