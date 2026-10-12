import SwiftUI

#if os(macOS)
import AppKit

// Headless renderer: rasterises every watch state to PNG at 2x so the repo
// carries real rendered output, not just mockups. Same view code compiles
// for watchOS (see build.sh / TEST-EVIDENCE.md).

private let watchW: CGFloat = 208 // Series 10 46mm ≈ 416pt wide → half-scale for strip layout
private let watchH: CGFloat = 248

@MainActor
struct WatchStrip: View {
    var body: some View {
        HStack(spacing: 28) {
            ForEach(WatchState.allCases, id: \.self) { s in
                VStack(spacing: 10) {
                    WatchRootView(state: s)
                        .frame(width: watchW, height: watchH)
                        .clipShape(RoundedRectangle(cornerRadius: 46))
                        .overlay(RoundedRectangle(cornerRadius: 46).stroke(Color(hex: 0x33333E), lineWidth: 5))
                        .shadow(color: .black.opacity(0.35), radius: 16, y: 8)
                    Text(s.title.uppercased())
                        .font(.system(size: 11, weight: .bold))
                        .tracking(1.5)
                         .foregroundStyle(Color(hex: 0x1B1B2F))
                    Text(caption(for: s))
                        .font(.system(size: 10))
                        .foregroundStyle(Color(hex: 0x6E6E78))
                        .frame(width: watchW)
                        .multilineTextAlignment(.center)
                }
            }
        }
        .padding(40)
        .background(Color(hex: 0xE9E9E6))
    }

    func caption(for s: WatchState) -> String {
        switch s {
        case .ambient: return "complication only — no balance on the wrist"
        case .listening: return "waveform + rolling transcript"
        case .draft: return "one glanceable card — never a Pay button"
        case .sent: return "tick, then gone"
        case .paused: return "amber — no on-watch actions"
        }
    }
}

@MainActor
func savePNG(_ view: some View, to path: String, scale: CGFloat = 2) throws {
    let renderer = ImageRenderer(content: view)
    renderer.scale = scale
    guard let image = renderer.nsImage,
          let tiff = image.tiffRepresentation,
          let bmp = NSBitmapImageRep(data: tiff),
          let png = bmp.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "render", code: 1, userInfo: [NSLocalizedDescriptionKey: "render failed"])
    }
    try png.write(to: URL(fileURLWithPath: path))
}

@main
struct RenderMain {
    static func main() async {
        let outDir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "Renders"
        try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)
        // ImageRenderer needs an app context on macOS
        let app = NSApplication.shared
        app.setActivationPolicy(.accessory)
        do {
            try await MainActor.run {
                for s in WatchState.allCases {
                    let card = WatchRootView(state: s)
                        .frame(width: 416, height: 496)
                        .clipShape(RoundedRectangle(cornerRadius: 92))
                    try savePNG(card, to: "\(outDir)/watch-\(s.rawValue).png")
                    print("rendered watch-\(s.rawValue).png")
                }
                try savePNG(WatchStrip(), to: "\(outDir)/watch-strip.png")
                print("rendered watch-strip.png")
            }
        } catch {
            FileHandle.standardError.write("render error: \(error)\n".data(using: .utf8)!)
        }
        exit(0)
    }
}
#endif
