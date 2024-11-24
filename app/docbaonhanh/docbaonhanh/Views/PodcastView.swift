// Views/PodcastView.swift
import SwiftUI
import AVFoundation

struct PodcastView: View {
    @StateObject private var viewModel = PodcastViewModel()
    @ObservedObject private var audioService = AudioPlayerService.shared
    @State private var showingFullPlayer = false
    
    var body: some View {
        NavigationView {
            ZStack {
                List {
                    ForEach(viewModel.newsItems) { item in
                        PodcastItemRow(
                            item: item,
                            isPlaying: audioService.isPlaying &&
                                     audioService.currentItem?.id == item.id,
                            onTap: {
                                if let index = viewModel.newsItems.firstIndex(where: { $0.id == item.id }) {
                                    audioService.setPlaylist(viewModel.newsItems)
                                    audioService.currentIndex = index
                                    if let audioUrl = URL(string: item.audioUrl ?? "") {
                                        audioService.play(url: audioUrl)
                                    }
                                }
                            }
                        )
                        .onAppear {
                            viewModel.loadMoreIfNeeded(currentItem: item)
                        }
                    }
                }
                .refreshable {
                    viewModel.fetchInitialNews()
                }
                
                if viewModel.isLoading && viewModel.newsItems.isEmpty {
                    ProgressView()
                }
                
                if let error = viewModel.error {
                    VStack {
                        Text("Có lỗi xảy ra")
                            .font(.headline)
                        Text(error.localizedDescription)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Button("Thử lại") {
                            viewModel.fetchInitialNews()
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding()
                    .background(Color(UIColor.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 4)
                }
            }
            .navigationTitle("Podcast")
            .overlay(
                VStack {
                    Spacer()
                    if audioService.currentItem != nil {
                        VStack(spacing: 0) {
                            Divider()
                            MiniPlayerView(showProgressBar: true)
                                .onTapGesture {
                                    showingFullPlayer = true
                                }
                        }
                        .background(Color(UIColor.systemBackground))
                        .shadow(radius: 2)
                    }
                }
            )
            .sheet(isPresented: $showingFullPlayer) {
                if let currentItem = audioService.currentItem {
                    VStack(spacing: 0) {
                        // Player Header
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(currentItem.title)
                                    .font(.headline)
                                    .lineLimit(2)
                                Text(currentItem.source)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Button(action: {
                                showingFullPlayer = false
                            }) {
                                Image(systemName: "chevron.down")
                                    .font(.title3)
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding()
                        
                        Divider()
                        
                        // Player Controls
                        MiniPlayerView(showProgressBar: true)
                            .padding(.bottom)
                    }
                    .presentationDetents([.height(200)])
                    .presentationDragIndicator(.visible)
                }
            }
        }
        .onAppear {
            if viewModel.newsItems.isEmpty {
                viewModel.fetchInitialNews()
            }
        }
    }
}

struct PodcastItemRow: View {
    let item: NewsItem
    let isPlaying: Bool
    let onTap: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: item.imageUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray
            }
            .frame(width: 60, height: 60)
            .cornerRadius(8)
            .overlay(
                Button(action: onTap) {
                    Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                        .font(.title)
                        .foregroundColor(.white)
                        .shadow(radius: 2)
                }
                .frame(width: 60, height: 60)
                .background(Color.black.opacity(0.3))
            )
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(2)
                
                HStack {
                    Text(item.source)
                        .font(.caption)
                        .foregroundColor(.blue)
                    
                    Text("•")
                        .foregroundColor(.gray)
                    
                    Text(item.publishedDate, style: .date)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// Helper extension để an toàn khi truy cập array
extension Array {
    subscript(safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

#Preview {
    NewsView()
}

