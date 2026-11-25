// Renders src/cv/cv.html → divine-ajayi-cv.pdf (two A4 pages, selectable text, live links).
// Run from the repo root:  swift scripts/cv.swift
// Optional: swift scripts/cv.swift <preview-dir>   also writes page PNGs for review.
import AppKit
import PDFKit
import WebKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let source = root.appendingPathComponent("src/cv/cv.html")
let output = root.appendingPathComponent("divine-ajayi-cv.pdf")
let previewDir = CommandLine.arguments.count > 1 ? URL(fileURLWithPath: CommandLine.arguments[1]) : nil
let pageSize = CGSize(width: 794, height: 1123) // A4 at 96 dpi (CSS px)

final class Renderer: NSObject, WKNavigationDelegate {
  let web = WKWebView(frame: CGRect(origin: .zero, size: CGSize(width: pageSize.width, height: pageSize.height * 2)))

  func start() {
    web.navigationDelegate = self
    web.loadFileURL(source, allowingReadAccessTo: source.deletingLastPathComponent())
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    // Wait for web fonts, then check that neither page overflows.
    let js = """
      document.fonts.ready.then(() => JSON.stringify([...document.querySelectorAll('.page')].map(p => {
        const last = [...p.children].filter(c => !c.classList.contains('folio')).pop();
        const folio = p.querySelector('.folio');
        return { id: p.id, contentBottom: Math.round(last.getBoundingClientRect().bottom - p.getBoundingClientRect().top),
                 folioTop: Math.round(folio.getBoundingClientRect().top - p.getBoundingClientRect().top),
                 fonts: [...document.fonts].filter(f => f.status === 'loaded').length };
      })))
      """
    webView.callAsyncJavaScript("return await (\(js))", arguments: [:], in: nil, in: .page) { result in
      switch result {
      case .success(let value):
        let report = value as? String ?? "?"
        print("layout:", report)
        if let data = report.data(using: .utf8),
           let pages = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
          for p in pages {
            let bottom = p["contentBottom"] as? Int ?? 0, folio = p["folioTop"] as? Int ?? 0
            if bottom > folio - 8 { print("ERROR: \(p["id"] ?? "?") overflows (\(bottom)px > \(folio - 8)px)"); exit(2) }
          }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { self.export(page: 0, into: PDFDocument()) }
      case .failure(let error):
        print("JS error:", error); exit(1)
      }
    }
  }

  func export(page: Int, into doc: PDFDocument) {
    if page == 2 { finish(doc); return }
    let config = WKPDFConfiguration()
    config.rect = CGRect(x: 0, y: CGFloat(page) * pageSize.height, width: pageSize.width, height: pageSize.height)
    web.createPDF(configuration: config) { result in
      switch result {
      case .success(let data):
        guard let part = PDFDocument(data: data), let p = part.page(at: 0) else { print("bad PDF data"); exit(1) }
        doc.insert(p, at: doc.pageCount)
        self.export(page: page + 1, into: doc)
      case .failure(let error):
        print("PDF error:", error); exit(1)
      }
    }
  }

  func finish(_ doc: PDFDocument) {
    doc.documentAttributes = [
      PDFDocumentAttribute.titleAttribute: "Divine Ajayi — CV",
      PDFDocumentAttribute.authorAttribute: "Divine Ajayi",
      PDFDocumentAttribute.subjectAttribute: "Lead Mobile Developer — Flutter & Dart",
      PDFDocumentAttribute.keywordsAttribute: ["Flutter", "Dart", "Mobile", "iOS", "Android"],
    ]
    guard doc.write(to: output) else { print("write failed"); exit(1) }
    let links = (0..<doc.pageCount).flatMap { doc.page(at: $0)!.annotations.compactMap { $0.url?.absoluteString } }
    print("wrote \(output.lastPathComponent): \(doc.pageCount) pages, \(links.count) links")
    if let dir = previewDir {
      try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
      for i in 0..<doc.pageCount {
        let p = doc.page(at: i)!, b = p.bounds(for: .mediaBox), s: CGFloat = 2
        let img = NSImage(size: NSSize(width: b.width * s, height: b.height * s))
        img.lockFocus()
        NSColor.white.set(); NSRect(origin: .zero, size: img.size).fill()
        let ctx = NSGraphicsContext.current!.cgContext
        ctx.scaleBy(x: s, y: s); p.draw(with: .mediaBox, to: ctx)
        img.unlockFocus()
        let png = NSBitmapImageRep(data: img.tiffRepresentation!)!.representation(using: .png, properties: [:])!
        try? png.write(to: dir.appendingPathComponent("cv-page\(i + 1).png"))
      }
    }
    exit(0)
  }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let renderer = Renderer()
renderer.start()
DispatchQueue.main.asyncAfter(deadline: .now() + 60) { print("timed out"); exit(1) }
app.run()
