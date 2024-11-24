
// Views/Components/MiniPlayerView.swift
import SwiftUI
import AVFoundation

struct MiniPlayerView: View {
    @ObservedObject private var audioService = AudioPlayerService.shared
    let showProgressBar: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            if showProgressBar {
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 2)
                        
                        Rectangle()
                            .fill(Color.blue)
                            .frame(width: geometry.size.width * audioService.progress, height: 2)
                    }
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onEnded { value in
                                let percentage = value.location.x / geometry.size.width
                                audioService.seek(to: Double(percentage) * audioService.duration)
                            }
                    )
                }
                .frame(height: 2)
            }
            
            VStack(spacing: 8) {
                if let currentItem = audioService.currentItem {
                    // Title and time
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(currentItem.title)
                                .font(.headline)
                                .lineLimit(2)
                            
                            Text("\(formatTime(audioService.currentTime)) / \(formatTime(audioService.duration))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal)
                    
                    // Controls
                    HStack(spacing: 20) {
                        Button(action: {
                            audioService.playPreviousItem()
                        }) {
                            Image(systemName: "backward.fill")
                                .font(.title3)
                        }
                        .disabled(audioService.currentIndex <= 0)
                        
                        Button(action: {
                            audioService.togglePlayPause()
                        }) {
                            Image(systemName: audioService.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                                .font(.title)
                        }
                        
                        Button(action: {
                            audioService.playNextItem()
                        }) {
                            Image(systemName: "forward.fill")
                                .font(.title3)
                        }
                        .disabled(audioService.currentIndex >= audioService.playlist.count - 1)
                    }
                    .foregroundColor(.blue)
                }
            }
            .padding(.vertical, 8)
        }
    }
    
    private func formatTime(_ time: Double) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}
