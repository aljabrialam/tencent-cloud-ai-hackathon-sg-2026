import SwiftUI

#if os(watchOS)
/// digiVoice watch face — display surface only.
/// Constitution: the wrist can propose and confirm receipt, never authorise.
@main
struct DigiVoiceWatchApp: App {
    @State private var state: WatchState = .draft

    var body: some Scene {
        WindowGroup {
            WatchRootView(state: state)
        }
    }
}
#endif
