// Views/NewsDetailView.swift
// Views/NewsDetailView.swift
import SwiftUI
struct NewsDetailView: View {
    let item: NewsItem
    @ObservedObject private var audioService = AudioPlayerService.shared
    @State private var showPlayer: Bool = false
    
    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Image section
                    AsyncImage(url: URL(string: item.imageUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Color.gray
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: UIScreen.main.bounds.height * 0.3)
                    .clipped()
                    
                    // Content section
                    VStack(alignment: .leading, spacing: 12) {
                        Text(item.title)
                            .font(.title)
                            .fontWeight(.bold)
                        
                        HStack {
                            Text(item.source)
                                .foregroundColor(.blue)
                            Spacer()
                            Text(item.publishedDate, style: .date)
                                .foregroundColor(.gray)
                        }
                        .font(.subheadline)
                        
                        if item.audioUrl != nil {
                            Button(action: {
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                    audioService.setPlaylist([item])
                                    audioService.currentIndex = 0
                                    if let audioUrl = URL(string: item.audioUrl ?? "") {
                                        audioService.play(url: audioUrl)
                                        showPlayer = true
                                    }
                                }
                            }) {
                                HStack {
                                    Image(systemName: "headphones")
                                        .font(.title2)
                                    Text("Nghe tin")
                                        .font(.headline)
                                }
                                .foregroundColor(.blue)
                                .padding(.vertical, 8)
                            }
                        }
                        
                        Divider()
                        
                        Text(item.content)
                            .font(.body)
                    }
                    .padding(.horizontal)
                    
                    // Bottom spacing for player
                    if showPlayer {
                        Color.clear.frame(height: 90)
                    }
                }
            }
            .edgesIgnoringSafeArea(.top)
            
            // Player overlay
            if showPlayer,
               audioService.currentItem?.id == item.id {
                VStack(spacing: 0) {
                    Divider()
                    MiniPlayerView(showProgressBar: true)
                }
                .background(Color(UIColor.systemBackground).shadow(radius: 2))
                .transition(.move(edge: .bottom))
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .onDisappear {
            withAnimation {
                showPlayer = false
            }
        }
    }
}

#Preview {
    ContentView()
}

