{{flutter_js}}
{{flutter_build_config}}

// No service worker: Flutter's default one is deprecated and reloads the page
// on first activation, which would make the embedded demo load twice.
_flutter.loader.load();
