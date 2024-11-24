// Services/AudioPlayerService.swift
import Foundation
import AVFoundation

class AudioPlayerService: ObservableObject {
    static let shared = AudioPlayerService()
    private var player: AVPlayer?
    
    @Published var isPlaying: Bool = false
    @Published var currentTime: Double = 0
    @Published var duration: Double = 0
    @Published var progress: Double = 0
    @Published var playlist: [NewsItem] = []
    @Published var currentIndex: Int = 0
    @Published private(set) var currentItem: NewsItem?
    
    private var timeObserver: Any?
    
    private init() {
        setupTimeObserver()
    }
    
    deinit {
        if let observer = timeObserver {
            player?.removeTimeObserver(observer)
        }
    }
    
    private func setupTimeObserver() {
        timeObserver = player?.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.5, preferredTimescale: 600), queue: .main) { [weak self] time in
            guard let self = self else { return }
            self.currentTime = time.seconds
            if self.duration > 0 {
                self.progress = self.currentTime / self.duration
            }
        }
    }
    
    func setPlaylist(_ items: [NewsItem]) {
        playlist = items
        updateCurrentItem()
    }
    
    private func updateCurrentItem() {
        if currentIndex >= 0 && currentIndex < playlist.count {
            currentItem = playlist[currentIndex]
        } else {
            currentItem = nil
        }
    }
    
    func play(url: URL) {
        let playerItem = AVPlayerItem(url: url)
        if player == nil {
            player = AVPlayer(playerItem: playerItem)
            setupTimeObserver()
        } else {
            player?.replaceCurrentItem(with: playerItem)
        }
        
        // Get duration using modern API
        Task {
            if let duration = try? await playerItem.asset.load(.duration).seconds {
                await MainActor.run {
                    self.duration = duration
                }
            }
        }
        
        player?.play()
        isPlaying = true
    }
    
    func togglePlayPause() {
        if isPlaying {
            player?.pause()
        } else {
            player?.play()
        }
        isPlaying.toggle()
    }
    
    func seek(to time: Double) {
        player?.seek(to: CMTime(seconds: time, preferredTimescale: 600))
    }
    
    func playNextItem() {
        guard currentIndex < playlist.count - 1 else { return }
        currentIndex += 1
        updateCurrentItem()
        if let audioUrl = URL(string: currentItem?.audioUrl ?? "") {
            play(url: audioUrl)
        }
    }
    
    func playPreviousItem() {
        guard currentIndex > 0 else { return }
        currentIndex -= 1
        updateCurrentItem()
        if let audioUrl = URL(string: currentItem?.audioUrl ?? "") {
            play(url: audioUrl)
        }
    }
}
