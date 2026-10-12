import SwiftUI

// digiVoice watch face — the full pipeline state machine.
// Hard rule mirrored from the constitution: the wrist can show, never sign.
// No Authorise affordance exists anywhere in these views.

enum WatchState: String, CaseIterable {
    case ambient, listening, draft, sent, paused

    var title: String {
        switch self {
        case .ambient: return "Ambient"
        case .listening: return "Listening"
        case .draft: return "Draft"
        case .sent: return "Sent"
        case .paused: return "Paused"
        }
    }
}

extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 0xFF) / 255,
                  green: Double((hex >> 8) & 0xFF) / 255,
                  blue: Double(hex & 0xFF) / 255)
    }
    static let dvRed = Color(hex: 0xE60023)
    static let dvOk = Color(hex: 0x0E6B34)
    static let dvWarn = Color(hex: 0xE8A13A)
    static let dvAmber = Color(hex: 0xFFC4B4)
}

struct WatchRootView: View {
    let state: WatchState

    var body: some View {
        ZStack {
            Color(hex: 0x060609).ignoresSafeArea()
            Group {
                switch state {
                case .ambient: ambientView
                case .listening: listeningView
                case .draft: draftView
                case .sent: sentView
                case .paused: pausedView
                }
            }
            .padding(.horizontal, 12)
        }
    }

    // MARK: - 0 · Ambient

    var ambientView: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("14:31")
                .font(.system(size: 46, weight: .ultraLight))
                .foregroundStyle(.white)
            Text("TUE 21 OCT")
                .font(.system(size: 11, weight: .medium))
                .tracking(2)
                .foregroundStyle(.white.opacity(0.5))
            Spacer()
            HStack(spacing: 5) {
                Circle().fill(Color.dvRed).frame(width: 6, height: 6)
                Text("digiVoice · idle")
                    .font(.system(size: 12))
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding(.horizontal, 10).padding(.vertical, 7)
            .background(.white.opacity(0.07), in: RoundedRectangle(cornerRadius: 10))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    // MARK: - 1 · Listening

    var listeningView: some View {
        VStack(spacing: 10) {
            Text("LISTENING")
                .font(.system(size: 10, weight: .medium))
                .tracking(2)
                .foregroundStyle(.white.opacity(0.5))
            WaveformView()
                .frame(height: 26)
            Text("Send **two hundred** to **Mum**…")
                .font(.system(size: 13))
                .foregroundStyle(.white.opacity(0.85))
                .padding(.horizontal, 10).padding(.vertical, 8)
                .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
            Spacer()
            Text("raise wrist → speak")
                .font(.system(size: 10))
                .foregroundStyle(.white.opacity(0.45))
                .padding(.bottom, 12)
        }
        .padding(.top, 14)
    }

    // MARK: - 2 · Draft (show, never sign)

    var draftView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("DRAFT READY · a3f9·08c2")
                .font(.system(size: 10, weight: .medium))
                .tracking(1.5)
                .foregroundStyle(.white.opacity(0.5))
            VStack(alignment: .leading, spacing: 4) {
                Text("S$200.00")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(.white)
                Text("→ Mum ····4521 · verified ✓")
                    .font(.system(size: 11))
                    .foregroundStyle(.white.opacity(0.6))
                Text("Approve on your phone →")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Color.dvAmber)
                    .padding(.top, 4)
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 14))
            Spacer()
            Text("crown: details · 2×press: dismiss")
                .font(.system(size: 9))
                .foregroundStyle(.white.opacity(0.45))
                .frame(maxWidth: .infinity)
                .padding(.bottom, 12)
        }
        .padding(.top, 14)
    }

    // MARK: - 3 · Sent (ledger-confirmed)

    var sentView: some View {
        VStack(spacing: 8) {
            Spacer()
            ZStack {
                Circle().fill(Color.dvOk).frame(width: 44, height: 44)
                Image(systemName: "checkmark")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(.white)
            }
            VStack(spacing: 2) {
                Text("**Sent** — S$200.00 to Mum")
                    .font(.system(size: 12))
                    .multilineTextAlignment(.center)
            }
            .foregroundStyle(.white.opacity(0.85))
            Text("TXN-88214 · clears in ~4 s")
                .font(.system(size: 10))
                .foregroundStyle(.white.opacity(0.45))
            Spacer()
        }
    }

    // MARK: - 4 · Paused (shield verdict — gestures dead)

    var pausedView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("SHIELD · SHD-AUTH")
                .font(.system(size: 10, weight: .medium))
                .tracking(1.5)
                .foregroundStyle(.white.opacity(0.5))
            VStack(alignment: .leading, spacing: 4) {
                Text("Paused — looks like a scam")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white)
                Text("See your phone to continue")
                    .font(.system(size: 11))
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.dvWarn.opacity(0.16), in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.dvWarn.opacity(0.5)))
            Spacer()
            Text("no actions available here")
                .font(.system(size: 9))
                .foregroundStyle(.white.opacity(0.45))
                .frame(maxWidth: .infinity)
                .padding(.bottom, 12)
        }
        .padding(.top, 14)
    }
}

struct WaveformView: View {
    private let heights: [CGFloat] = [6, 14, 22, 12, 20, 8, 16, 24, 10, 18, 6, 14]
    var body: some View {
        HStack(spacing: 3) {
            ForEach(heights.indices, id: \.self) { i in
                RoundedRectangle(cornerRadius: 2)
                    .fill(.white)
                    .frame(width: 3, height: heights[i])
            }
        }
    }
}
