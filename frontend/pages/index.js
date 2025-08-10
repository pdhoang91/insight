// pages/index.js
import React from 'react';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import BlogSidebar from '../components/Shared/BlogSidebar';
import PostList from '../components/Post/PostList';

const Home = () => {
  const {
    posts,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePosts();

  return (
    <div className="min-h-screen bg-terminal-black relative overflow-hidden">
      {/* Matrix Rain Background Effect */}
      <div className="fixed inset-0 bg-terminal-grid opacity-30 pointer-events-none"></div>
      
      {/* Scanning Line Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="scan-line"></div>
      </div>

      {/* Terminal Header */}
      <div className="relative z-10 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Terminal Window */}
          <div className="terminal-window mb-8">
            <div className="terminal-header">
              <span>welcome@insight-terminal</span>
            </div>
            <div className="p-6 bg-terminal-dark">
              <div className="font-mono text-sm space-y-2">
                <div className="text-matrix-green">
                  <span className="text-hacker-yellow">$</span> cat /etc/motd
                </div>
                <div className="text-text-secondary pl-4">
                  <div className="ascii-art text-matrix-green mb-4">
{`██╗███╗   ██╗███████╗██╗ ██████╗ ██╗  ██╗████████╗
██║████╗  ██║██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝
██║██╔██╗ ██║███████╗██║██║  ███╗███████║   ██║   
██║██║╚██╗██║╚════██║██║██║   ██║██╔══██║   ██║   
██║██║ ╚████║███████║██║╚██████╔╝██║  ██║   ██║   
╚═╝╚═╝  ╚═══╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝`}
                  </div>
                  <div className="text-text-muted">
                    <span className="text-hacker-yellow">//</span> A terminal for developers, by developers
                  </div>
                  <div className="text-matrix-cyan">
                    <span className="text-hacker-yellow">//</span> Share code, thoughts, and build the future
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-xs">
                    <span className="text-matrix-green">● ONLINE</span>
                    <span className="text-text-muted">|</span>
                    <span className="text-text-muted">Users: {posts?.length || 0}+</span>
                    <span className="text-text-muted">|</span>
                    <span className="text-text-muted">Posts: Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Terminal Layout */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area - Terminal Style */}
            <div className="lg:col-span-3">
              <div className="terminal-window">
                <div className="terminal-header">
                  <span>posts@latest</span>
                  <div className="ml-auto text-matrix-green text-xs">
                    tail -f /var/log/posts.log
                  </div>
                </div>
                <div className="bg-terminal-dark">
                  {/* Timeline Post List */}
                  <PostList
                    posts={posts}
                    isLoading={isLoading}
                    isError={isError}
                    setSize={setSize}
                    isReachingEnd={isReachingEnd}
                    variant="timeline"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar - System Info Style */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* System Status */}
                <div className="terminal-window">
                  <div className="terminal-header">
                    <span>system@status</span>
                  </div>
                  <div className="p-4 bg-terminal-dark">
                    <div className="space-y-3 text-sm font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Status:</span>
                        <span className="text-matrix-green">● Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Load:</span>
                        <span className="text-hacker-yellow">0.23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Memory:</span>
                        <span className="text-matrix-cyan">4.2GB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Uptime:</span>
                        <span className="text-text-secondary">24d 15h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Sidebar */}
                <BlogSidebar />

                {/* Terminal Commands Help */}
                <div className="terminal-window">
                  <div className="terminal-header">
                    <span>help@commands</span>
                  </div>
                  <div className="p-4 bg-terminal-dark">
                    <div className="space-y-2 text-xs font-mono">
                      <div className="text-matrix-green">Available Commands:</div>
                      <div className="text-text-muted pl-2">
                        <div><span className="text-hacker-yellow">ls</span> - List posts</div>
                        <div><span className="text-hacker-yellow">grep</span> - Search content</div>
                        <div><span className="text-hacker-yellow">vim</span> - Create post</div>
                        <div><span className="text-hacker-yellow">cat</span> - Read post</div>
                        <div><span className="text-hacker-yellow">git</span> - Version control</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Terminal */}
      <div className="relative z-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="terminal-window">
            <div className="terminal-header">
              <span>footer@insight</span>
            </div>
            <div className="p-4 bg-terminal-dark text-center">
              <div className="text-sm font-mono text-text-muted">
                <span className="text-hacker-yellow">//</span> Built with ❤️ by developers, for developers
                <div className="mt-2 text-xs">
                  <span className="text-matrix-green">©</span> 2024 Insight Terminal. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
